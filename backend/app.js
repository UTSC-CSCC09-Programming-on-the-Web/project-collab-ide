import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import session from "express-session";
import bodyParser from "body-parser";
import { checkoutRouter } from "./routers/checkoutRouter.js";
import cookieParser from "cookie-parser";
import { sequelize } from "./datasource.js";
import { statusRouter } from "./routers/statusRouter.js";
import { authRouter } from "./routers/authRouter.js";
import { userRouter } from "./routers/userRouter.js";
import { queueRouter } from "./routers/queueRouter.js";
import { matchRouter } from "./routers/matchRouter.js";
import { marketRouter, getRandomMarketCombo } from "./routers/marketRouter.js";
import { timerService } from "./services/timerService.js";
import jwt from "jsonwebtoken";

import http from "http";
import { Server } from "socket.io";

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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// TODO: check for mising secret key and remove the default secret (they remove marks :c)
const sessionMiddleware = session({
  secret: process.env.SECRET_KEY || "secret",
  resave: false,
  saveUninitialized: true,
});

app.use(sessionMiddleware);

io.use((socket, next) => {
  // need to decode jwt
  // TODO: move socket stuff to new file?
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

io.on("connection", (socket) => {
  console.log("Session:", socket.request.session);
  const userId = socket.request?.session?.userId;
  if (!userId) {
    console.log("Unauthorized socket connection");
    return socket.disconnect();
  }

  console.log(`[Socket] User ${userId} connected.`);

  socket.on("join-match", (matchId) => {
    const room = `match-${matchId}`;
    socket.join(room);
    console.log(`[Socket] User ${userId} joined room ${room}.`);

    // Send current timer status to the joining user
    const status = timerService.getMatchStatus(matchId);
    socket.emit("timer-update", { timeRemaining: status.timeRemaining });

    // Check if this is the second player and start the match
    const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;
    if (roomSize === 2) {
      getRandomMarketCombo().then((marketCombo) => {
        timerService.startMatch(matchId, io);
        io.to(room).emit("match-started", { matchId, marketCombo });
      });
    }
  });

  socket.on("buy", ({ matchId, amount }) => {
    io.to(`match-${matchId}`).emit("buy-event", { userId, amount });
  });

  socket.on("sell", ({ matchId, amount }) => {
    io.to(`match-${matchId}`).emit("sell-event", { userId, amount });
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
