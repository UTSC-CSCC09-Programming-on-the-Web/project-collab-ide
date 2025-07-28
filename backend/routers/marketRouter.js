import { Router } from "express";
import { MarketFact } from "../models/marketFact.js";
import { MarketCandle } from "../models/marketCandle.js";
import { Sequelize } from "sequelize";

export const marketRouter = Router();

// TODO: use validation helpers to validate query params
// TODO: update endpoint to get data from live api and then fallback if error.

// GET /api/market/stocks
marketRouter.get("/stocks", async (req, res) => {
  try {
    const tickers = await MarketCandle.findAll({
      attributes: ["ticker"],
      group: ["ticker"],
      order: [["ticker", "DESC"]],
    });

    const tickerList = tickers.map((t) => t.ticker);

    res.json({ total: tickerList.length, stocks: tickerList });
  } catch (err) {
    console.error("[ERROR] /api/market/stocks", err);
    res.status(500).json({ error: "Failed to fetch market stocks." });
  }
});

// GET /api/market/candles?market=NASDAQ&ticker=AAPL&date=YYYY-MM-DD&page=0&limit=60 (paginated)
marketRouter.get("/candles", async (req, res) => {
  const { market, ticker, date } = req.query;
  let { page, limit } = req.query;

  if (!market || !ticker || !date) {
    return res.status(400).json({
      error: "Invalid query parameters: ticker, market, and date are required.",
    });
  }

  page = parseInt(page) || 0;
  limit = parseInt(limit) || 60;

  try {
    const candles = await getCandles({ market, ticker, date, page, limit });
    res.json({ total: candles.length, candles });
  } catch (err) {
    console.error("[ERROR] /api/market/candles", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

const getCandles = async ({ market, ticker, date, page = 0, limit = 180 }) => {
  const offset = page * limit;

  const candles = await MarketCandle.findAll({
    where: {
      market: market.toUpperCase(),
      ticker: ticker.toUpperCase(),
      date,
    },
    order: [["timestamp", "ASC"]],
    limit,
    offset,
  });

  return candles;
};

export const getRandomMarketCombo = async () => {
  const [randomCombo] = await MarketCandle.findAll({
    attributes: ["market", "ticker", "date"],
    group: ["market", "ticker", "date"],
    order: [Sequelize.literal("RANDOM()")],
    limit: 1,
  });

  if (!randomCombo) throw new Error("No candle data found.");

  return {
    market: randomCombo.market,
    ticker: randomCombo.ticker,
    marketDate: randomCombo.date,
  };
};
