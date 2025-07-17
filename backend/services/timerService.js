import { Match } from "../models/match.js";

class TimerService {
  constructor() {
    this.activeMatches = new Map();
  }

  startMatch(matchId, io) {
    const match = {
      id: matchId,
      startTime: Date.now(),
      duration: 5 * 60 * 1000,
      interval: null,
    };

    // Start the timer interval
    match.interval = setInterval(() => {
      const timeRemaining = this.getTimeRemaining(matchId);

      // Broadcast timer update to all players in the match
      io.to(`match-${matchId}`).emit("timer-update", {
        timeRemaining: Math.max(0, Math.floor(timeRemaining / 1000)),
      });

      // End match when timer reaches 0
      if (timeRemaining <= 0) {
        this.endMatch(matchId, io);
      }
    }, 1000);

    this.activeMatches.set(matchId, match);

    // Update database
    this.updateMatchInDB(matchId, "active", new Date());
  }

  getTimeRemaining(matchId) {
    const match = this.activeMatches.get(matchId);
    if (!match) return 0;

    const elapsed = Date.now() - match.startTime;
    return Math.max(0, match.duration - elapsed);
  }

  endMatch(matchId, io) {
    const match = this.activeMatches.get(matchId);
    if (!match) return;

    // Clear the interval
    if (match.interval) {
      clearInterval(match.interval);
    }

    // Remove from active matches
    this.activeMatches.delete(matchId);

    // Broadcast match end
    io.to(`match-${matchId}`).emit("match-ended", {
      timeRemaining: 0,
    });

    // Update database
    this.updateMatchInDB(matchId, "finished");
  }

  async updateMatchInDB(matchId, status, startTime = null) {
    try {
      const updateData = { status };
      if (startTime) updateData.startTime = startTime;

      await Match.update(updateData, {
        where: { id: matchId },
      });
    } catch (error) {
      console.error("Error updating match in database:", error);
    }
  }

  // Get current status for HTTP requests
  getMatchStatus(matchId) {
    const match = this.activeMatches.get(matchId);
    if (!match) {
      return { timeRemaining: 0, isActive: false };
    }

    return {
      timeRemaining: Math.floor(this.getTimeRemaining(matchId) / 1000),
      isActive: true,
    };
  }
}

export const timerService = new TimerService();
