import { Router } from "express";
import { MarketCandle } from "../models/marketCandle.js";
import { Sequelize } from "sequelize";
import axios from "axios";

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
    const fallback = async () => {
      const candles = await getCandles({ market, ticker, date, page, limit });
      return res.json({ total: candles.length, candles });
    };

    const [year, month] = date.split("-");
    const alphaUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${ticker}&interval=5min&month=${year}-${month}&outputsize=full&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;

    const alphaRes = await axios.get(alphaUrl);
    const rawData = alphaRes.data["Time Series (5min)"];

    if (!rawData) {
      console.warn("AlphaVantage returned invalid format, using fallback.");
      return fallback();
    }

    const filtered = Object.entries(rawData)
      .filter(([timestamp]) => timestamp.startsWith(date))
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .slice(0, limit)
      .map(([timestamp, ohlcv]) => ({
        market: market.toUpperCase(),
        ticker: ticker.toUpperCase(),
        date,
        timestamp,
        open: parseFloat(ohlcv["1. open"]),
        high: parseFloat(ohlcv["2. high"]),
        low: parseFloat(ohlcv["3. low"]),
        close: parseFloat(ohlcv["4. close"]),
        volume: parseFloat(ohlcv["5. volume"]),
      }));

    if (filtered.length < limit) {
      console.warn("AlphaVantage data insufficient, falling back to DB.");
      return fallback();
    }
    return res.json({ total: filtered.length, candles: filtered });
  } catch (err) {
    console.error("[WARN] AlphaVantage failed, using fallback:", err.message);
    try {
      const candles = await getCandles({ market, ticker, date, page, limit });
      return res.json({ total: candles.length, candles });
    } catch (fallbackErr) {
      console.error("[ERROR] /api/market/candles fallback", fallbackErr);
      return res.status(500).json({ error: "Internal server error." });
    }
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
