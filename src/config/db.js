const { Sequelize } = require("sequelize");

const isProduction = process.env.NODE_ENV === "production";
const isLiveDB = process.env.DB_MODE === "live";

let sequelize;

if (isLiveDB) {
  //  LIVE (Render) DB – local or production both
  sequelize = new Sequelize(process.env.LIVE_DATABASE_URL, {
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });

  console.log(" Connected to LIVE Render DB");
} else {
  //  LOCAL DB
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: "postgres",
      logging: false,
    }
  );

  console.log(" Connected to LOCAL DB");
}

module.exports = sequelize;
