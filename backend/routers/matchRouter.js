import { Router } from "express";
import { Match } from "../models/match.js";
import { isAuthenticated } from "../middleware/auth.js";
import { timerService } from "../services/timerService.js";
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

// Get current match status including timer
matchRouter.get("/:id/status", isAuthenticated, async (req, res) => {
  try {
    const matchId = req.params.id;
    const userId = req.user.id;

    // Verify user is part of this match
    const match = await Match.findOne({
      where: {
        id: matchId,
        [Sequelize.Op.or]: [{ player1Id: userId }, { player2Id: userId }],
      },
    });

    if (!match) {
      return res
        .status(404)
        .json({ error: "Match not found or access denied" });
    }

    // Get timer status from service
    const timerStatus = timerService.getMatchStatus(matchId);

    // Return match info with timer
    const response = {
      matchId: match.id,
      status: match.status,
      timeRemaining: timerStatus.timeRemaining,
      isActive: timerStatus.isActive,
      player1Id: match.player1Id,
      player2Id: match.player2Id,
      startTime: match.startTime,
    };

    res.json(response);
  } catch (error) {
    console.error("Error getting match status:", error);
    res.status(500).json({ error: "Failed to get match status" });
  }
});
