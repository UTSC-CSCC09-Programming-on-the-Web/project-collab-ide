import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import session from "express-session";
import bodyParser from "body-parser";
import { checkoutRouter } from "./routers/checkoutRouter.js";
import cookieParser from "cookie-parser";
import { sequelize } from "./datasource.js";
import { User } from "./models/user.js";
import { statusRouter } from "./routers/statusRouter.js";
import { authRouter } from "./routers/authRouter.js";
import { userRouter } from "./routers/userRouter.js";
import { queueRouter } from "./routers/queueRouter.js";
import { matchRouter } from "./routers/matchRouter.js";
import { marketRouter, getRandomMarketCombo } from "./routers/marketRouter.js";
import { matchService } from "./services/matchService.js";
import jwt from "jsonwebtoken";
import csurf from "csurf";

import http from "http";
import { Server } from "socket.io";
import { stripWebhookRouter } from "./routers/stripeWebhookRouter.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  },
});

const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:8080";

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

app.use(cors({ origin: `${FRONTEND_URL}`, credentials: true }));
app.use("/webhook", stripWebhookRouter);
app.use(cookieParser());
app.use(
  csurf({
    cookie: {
      httpOnly: process.env.NODE_ENV === "production",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  }),
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

if (!process.env.JWT_SECRET) {
  throw new Error(
    "Missing JWT_SECRET environment variable. Set it in the backend .env file.",
  );
}

const sessionMiddleware = session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: true,
});

app.use(sessionMiddleware);

io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, () => {
    const cookieHeader = socket.request.headers.cookie || "";
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => c.trim().split("=")),
    );

    const token = cookies.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.request.session.userId = decoded.id;
      } catch (err) {
        console.warn("Invalid JWT:", err.message);
      }
    }

    next();
  });
});

app.use(express.static("static"));
app.use("/uploads", express.static("uploads"));

app.use("/stripe", checkoutRouter);
app.use("/", statusRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/queue", queueRouter);
app.use("/api/match", matchRouter);
app.use("/api/market", marketRouter);

app.get("/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

const matchPlayers = new Map();
io.on("connection", (socket) => {
  console.log("Session:", socket.request.session);
  const userId = socket.request?.session?.userId;
  if (!userId) {
    console.log("Unauthorized socket connection");
    return socket.disconnect();
  }

  console.log(`[Socket] User ${userId} connected.`);

  socket.on("join-match", async (matchId) => {
    const room = `match-${matchId}`;
    socket.join(room);
    console.log(`[Socket] User ${userId} joined room ${room}.`);

    try {
      // add userId to matchPlayers map
      if (!matchPlayers.has(matchId)) {
        matchPlayers.set(matchId, new Set());
      }
      matchPlayers.get(matchId).add(userId);

      // Initialize player portfolio
      const initResult = matchService.initializePlayer(matchId, userId);
      if (initResult && !initResult.success) {
        socket.emit("join-error", { error: initResult.error });
        return;
      }

      // Send current timer status to the joining user
      const status = matchService.getMatchStatus(matchId);
      socket.emit("timer-update", { timeRemaining: status.timeRemaining });

      // Send initial portfolio data
      const playerData = matchService.getPlayerData(matchId, userId);
      if (playerData) {
        socket.emit("portfolio-update", {
          cash: playerData.cash,
          shares: playerData.shares,
        });
      }

      const players = matchPlayers.get(matchId);
      if (players.size === 2) {
        // Randomly pick host
        const playerArray = Array.from(players);
        const hostUserId =
          playerArray[Math.floor(Math.random() * playerArray.length)];

        getRandomMarketCombo().then(async (marketCombo) => {
          matchService.startMatch(matchId, io);

          // Get all sockets in the room
          const socketsInRoom = await io.in(room).fetchSockets();
          const allUserIds = [];
          for (const socketInRoom of socketsInRoom) {
            const roomUserId = socketInRoom.request?.session?.userId;
            if (roomUserId) {
              allUserIds.push(roomUserId);
            }
          }
          const allUsers = await User.findAll({
            where: { id: allUserIds },
            attributes: ["id", "username"],
          });

          // Send player info to all players
          for (const userInfo of allUsers) {
            io.to(room).emit("player-info", {
              userId: userInfo.id,
              username: userInfo.username,
            });
          }

          io.to(room).emit("match-started", {
            matchId,
            hostUserId,
            marketCombo,
          });
        });
      }
    } catch (error) {
      console.error("Error in join-match handler:", error);
    }
  });

  socket.on("buy", ({ matchId, amount }) => {
    const result = matchService.processBuy(matchId, userId, amount);
    if (result.success) {
      // Send updated portfolio to the buyer
      socket.emit("portfolio-update", {
        cash: result.playerData.cash,
        shares: result.playerData.shares,
      });

      // Broadcast trade to other players
      socket.to(`match-${matchId}`).emit("opponent-trade", {
        userId,
        type: "buy",
        amount,
        inputValue: amount.toString(),
        cash: result.playerData.cash,
        shares: result.playerData.shares,
      });
    } else {
      socket.emit("trade-error", { error: result.error });
    }
  });

  socket.on("sell", ({ matchId, amount }) => {
    const result = matchService.processSell(matchId, userId, amount);
    if (result.success) {
      // Send updated portfolio to the seller
      socket.emit("portfolio-update", {
        cash: result.playerData.cash,
        shares: result.playerData.shares,
      });

      // Broadcast trade to other players
      socket.to(`match-${matchId}`).emit("opponent-trade", {
        userId,
        type: "sell",
        amount,
        inputValue: amount.toString(),
        cash: result.playerData.cash,
        shares: result.playerData.shares,
      });
    } else {
      socket.emit("trade-error", { error: result.error });
    }
  });

  // Handle stock price updates
  socket.on("stock-update", ({ matchId, price, change, percentChange }) => {
    if (matchService.updatePrice) {
      matchService.updatePrice(matchId, price, change, percentChange);
    }

    // Broadcast to all players in the match
    socket.to(`match-${matchId}`).emit("price-update", {
      price,
      change,
      percentChange,
    });
  });
});

try {
  await sequelize.authenticate();
  await sequelize.sync({ alter: { drop: false } });
  console.log("Database connected.");
} catch (e) {
  console.error("Unable to connect:", e);
}

server.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
