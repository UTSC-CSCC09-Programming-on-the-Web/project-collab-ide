import { Router } from "express";
import { Match } from "../models/match.js";
import { isAuthenticated } from "../middleware/auth.js";
import Sequelize from "sequelize";

export const matchRouter = Router();

matchRouter.get("/status", isAuthenticated, async (req, res) => {
  const userId = req.user.id;
  const match = await Match.findOne({
    where: {
      [Sequelize.Op.or]: [{ player1Id: userId }, { player2Id: userId }],
      status: "pending",
    },
  });

  if (match) {
    return res.json({ matchId: match.id, status: match.status });
  }

  res.json({ status: "waiting" });
});
