import { DataTypes } from "sequelize";
import { sequelize } from "../datasource.js";

export const Match = sequelize.define("Match", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  player1Id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  player2Id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 300,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("pending", "active", "finished"),
    defaultValue: "pending",
  },
  winnerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  loserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  player1Payout: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.0,
    allowNull: false,
  },
  player2Payout: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.0,
    allowNull: false,
  },
  stockTicker: {
    type: DataTypes.STRING,
    defaultValue: "AAPL",
    allowNull: false,
  },
});
