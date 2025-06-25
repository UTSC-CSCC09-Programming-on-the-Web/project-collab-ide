import { Router } from "express";
export const statusRouter = Router();

statusRouter.get("/", (req, res) => {
  res.status(200).json({ status: "ok" });
});
