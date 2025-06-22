import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from "fs";
import session from "express-session";
import bodyParser from "body-parser";

dotenv.config();

const app = express();
const PORT = 3000;
const FRONTEND_PORT = 8080;

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

app.use(cors({ origin: `http://localhost:${FRONTEND_PORT}`, credentials: true }));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(
  session({
    secret: process.env.SECRET_KEY || "secret",
    resave: false,
    saveUninitialized: true,
  }),
);

app.use(express.static("static"));
app.use("/uploads", express.static("uploads"));

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});