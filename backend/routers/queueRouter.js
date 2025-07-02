import { Router } from "express";
import { QueueEntry } from "../models/queueEntry.js";
import { Match } from "../models/match.js";
import { isAuthenticated } from "../middleware/auth.js";

export const queueRouter = Router();

queueRouter.post("/join", isAuthenticated, async (req, res) => {
  const userId = req.user.id;

  const alreadyInQueue = await QueueEntry.findOne({
    where: { userId },
  });
  if (alreadyInQueue)
    return res.status(400).json({ error: "User already in queue." });

  await QueueEntry.create({ userId });
  const queue = await QueueEntry.findAll({ order: [["queuedAt", "ASC"]] });
  if (queue.length >= 2) {
    const player1 = queue[0];
    const player2 = queue[1];

    // Create a match
    const match = await Match.create({
      player1Id: player1.userId,
      player2Id: player2.userId,
      status: "pending",
    });

    await QueueEntry.destroy({ where: { id: [player1.id, player2.id] } });

    return res.json({ message: "Match found", matchId: match.id });
  }

  res.json({ message: "Joined queue, waiting for opponent" });
});

queueRouter.post("/leave", isAuthenticated, async (req, res) => {
  const userId = req.user.id;
  await QueueEntry.destroy({ where: { userId } });
  res.json({ message: "Left queue" });
});
