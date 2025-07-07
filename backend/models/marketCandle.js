import { DataTypes } from "sequelize";
import { sequelize } from "../datasource.js";

export const MarketCandle = sequelize.define(
  "MarketCandle",
  {
    ticker: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    open: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    high: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    low: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    close: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    volume: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
  },
  {
    tableName: "MarketCandles",
    timestamps: false,
    indexes: [
      {
        fields: ["ticker", "date"],
      },
    ],
  },
);
