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

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:8080";

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

app.use(cors({ origin: `${FRONTEND_URL}`, credentials: true }));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SECRET_KEY || "secret",
    resave: false,
    saveUninitialized: true,
  }),
);

app.use(express.static("static"));
app.use("/uploads", express.static("uploads"));

app.use("/stripe", checkoutRouter);
app.use("/", statusRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);

try {
  await sequelize.authenticate();
  await sequelize.sync({ alter: { drop: false } });
  console.log("Database connected.");
} catch (e) {
  console.error("Unable to connect:", e);
}

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
