// const { Sequelize } = require("sequelize");

// const isLiveDB = process.env.DB_MODE === "live";

// let sequelize;

// if (isLiveDB) {
//   sequelize = new Sequelize(process.env.LIVE_DATABASE_URL, {
//     dialect: "postgres",
//     logging: false,
//     dialectOptions: {
//       ssl: {
//         require: true,
//         rejectUnauthorized: false,
//       },
//     },
//   });

//   console.log(" USING LIVE RENDER DB");
// } else {
//   sequelize = new Sequelize(
//     process.env.DB_NAME,
//     process.env.DB_USER,
//     process.env.DB_PASS,
//     {
//       host: process.env.DB_HOST,
//       port: process.env.DB_PORT,
//       dialect: "yatra_db_user",
//       logging: false,
//     }
//   );

//   console.log(" USING LOCAL DB");
// }

// module.exports = sequelize;
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,     // yatra_db
  process.env.DB_USER,     // yatra_db_user
  process.env.DB_PASS,     // render password
  {
    host: process.env.DB_HOST, // 35.227.164.209 OR render hostname
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,            // 🔥 Render needs SSL
        rejectUnauthorized: false // 🔥 for local
      },
    },
  }
);

console.log("🌍 USING SINGLE LIVE DATABASE");

module.exports = sequelize;
