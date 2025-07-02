import { DataTypes } from "sequelize";
import { sequelize } from "../datasource.js";

export const Match = sequelize.define("Match", {
  player1Id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  player2Id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "pending",
  },
});
