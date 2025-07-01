import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

export const sequelize = new Sequelize(
  process.env.POSTGRES_DB || "postgres",
  process.env.POSTGRES_USER || "postgres",
  process.env.POSTGRES_PASSWORD || "password",
  {
    host: process.env.POSTGRES_HOST || "localhost",
    port: process.env.POSTGRES_PORT || 5432,
    dialect: "postgres",
    logging: false,
  },
);
