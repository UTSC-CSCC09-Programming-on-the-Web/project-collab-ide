import { DataTypes } from "sequelize";
import { sequelize } from "../datasource.js";

export const QueueEntry = sequelize.define("QueueEntry", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  queuedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});
