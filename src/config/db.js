require("dotenv").config();
const { Sequelize } = require("sequelize");

const isLive = process.env.DB_MODE === "live";

console.log(
  isLive
    ? " USING LIVE DATABASE (SSL ON)"
    : " USING LOCAL DATABASE (SSL OFF)"
);

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false,
    dialectOptions: isLive
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {},
  }
);

module.exports = sequelize;