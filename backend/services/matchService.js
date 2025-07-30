import { Match } from "../models/match.js";
import { MATCH_DURATION } from "../utils/constants.js";

class MatchService {
  constructor() {
    this.activeMatches = new Map();
    this.matchData = new Map();
  }

  initializePlayer(matchId, playerId) {
    let matchData = this.matchData.get(matchId);

    if (!matchData) {
      matchData = {
        players: new Map(),
        currentPrice: 179.76,
        stockTicker: "AAPL",
        trades: [],
      };
      this.matchData.set(matchId, matchData);
    }

    if (!matchData.players.has(playerId)) {
      matchData.players.set(playerId, {
        cash: 100.0,
        shares: 0.0,
        userId: playerId,
      });
    }

    return { success: true, playerData: matchData.players.get(playerId) };
  }

  getPlayerData(matchId, playerId) {
    const matchData = this.matchData.get(matchId);
    return matchData ? matchData.players.get(playerId) : null;
  }

  updateStockTicker(matchId, stockTicker) {
    const matchData = this.matchData.get(matchId);
    matchData.stockTicker = stockTicker;

    return {
      success: true,
    };
  }

  processBuy(matchId, playerId, amount) {
    const matchData = this.matchData.get(matchId);
    if (!matchData) return { success: false, error: "Match not found" };

    const player = matchData.players.get(playerId);
    if (!player) return { success: false, error: "Player not found" };

    if (amount <= 0 || amount > player.cash) {
      return { success: false, error: "Invalid amount or insufficient funds" };
    }

    const sharesToBuy = amount / matchData.currentPrice;
    player.cash -= amount;
    player.shares += sharesToBuy;

    return {
      success: true,
      playerData: { cash: player.cash, shares: player.shares },
    };
  }

  processSell(matchId, playerId, amount) {
    const matchData = this.matchData.get(matchId);
    if (!matchData) return { success: false, error: "Match not found" };

    const player = matchData.players.get(playerId);
    if (!player) return { success: false, error: "Player not found" };

    const sharesToSell = amount / matchData.currentPrice;
    if (amount <= 0 || sharesToSell > player.shares) {
      return { success: false, error: "Invalid amount or insufficient shares" };
    }

    player.cash += amount;
    player.shares -= sharesToSell;

    return {
      success: true,
      playerData: { cash: player.cash, shares: player.shares },
    };
  }

  updatePrice(matchId, newPrice) {
    const matchData = this.matchData.get(matchId);
    if (matchData) {
      matchData.currentPrice = newPrice;
    }
  }

  startMatch(matchId, io) {
    const match = {
      id: matchId,
      startTime: Date.now(),
      duration: MATCH_DURATION * 1000,
      interval: null,
    };

    // Store match in memory
    this.activeMatches.set(matchId, match);

    // Immediately emit 3:00 timer
    io.to(`match-${matchId}`).emit("timer-update", {
      timeRemaining: MATCH_DURATION,
    });

    // Start ticking every second
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

  async endMatch(matchId, io) {
    const match = this.activeMatches.get(matchId);
    if (!match) return;

    // Calculate and store final results
    const matchData = this.matchData.get(matchId);
    if (matchData && matchData.players.size >= 2) {
      await this.storeFinalResults(matchId, matchData);
    }

    // Clear the interval
    if (match.interval) {
      clearInterval(match.interval);
    }

    // Remove from active matches
    this.activeMatches.delete(matchId);
    this.matchData.delete(matchId);

    // Broadcast match end
    io.to(`match-${matchId}`).emit("match-ended", {
      timeRemaining: 0,
    });

    // Update database
    if (!matchData || matchData.players.size < 2) {
      this.updateMatchInDB(matchId, "finished");
    }
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

  async storeFinalResults(matchId, matchData) {
    try {
      if (!matchData || matchData.players.size < 2) {
        console.log("Insufficient player data for match", matchId);
        return;
      }

      const players = Array.from(matchData.players.values());
      const currentPrice = matchData.currentPrice;
      const STARTING_AMOUNT = 100.0;
      const player1 = players[0];
      const player2 = players[1];
      const stock = matchData.stockTicker;

      // Calculate payouts
      const player1FinalValue = player1.cash + player1.shares * currentPrice;
      const player2FinalValue = player2.cash + player2.shares * currentPrice;
      const player1Payout = player1FinalValue - STARTING_AMOUNT;
      const player2Payout = player2FinalValue - STARTING_AMOUNT;

      // Determine winner and loser
      let winnerId = null;
      let loserId = null;
      if (player1FinalValue > player2FinalValue) {
        winnerId = player1.userId;
        loserId = player2.userId;
      } else if (player2FinalValue > player1FinalValue) {
        winnerId = player2.userId;
        loserId = player1.userId;
      }

      // Update match in database with final results
      await Match.update(
        {
          status: "finished",
          winnerId,
          loserId,
          player1Payout: Math.round(player1Payout * 100) / 100,
          player2Payout: Math.round(player2Payout * 100) / 100,
          stockTicker: stock,
        },
        {
          where: { id: matchId },
        },
      );

      return {
        winnerId,
        loserId,
        player1: {
          userId: player1.userId,
          payout: player1Payout,
        },
        player2: {
          userId: player2.userId,
          payout: player2Payout,
        },
        finalStockPrice: currentPrice,
      };
    } catch (error) {
      console.error("Error storing match results:", error);
      return null;
    }
  }
}

export const matchService = new MatchService();
