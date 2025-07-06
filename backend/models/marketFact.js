import { DataTypes } from "sequelize";
import { sequelize } from "../datasource.js";

export const MarketFact = sequelize.define(
  "MarketFact",
  {
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    blurb: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "MarketFacts",
    timestamps: false,
    indexes: [
      {
        fields: ["date"],
      },
    ],
  },
);
