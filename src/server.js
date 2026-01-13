require("dotenv").config();
require("./cron");
const app = require("./app");
const { sequelize } = require("./models");

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    // DB auth
    await sequelize.authenticate();
    console.log(" PostgreSQL connected successfully");

    // Sync models (later change to migrations)
    await sequelize.sync();
    console.log(" DB synced");

    // Start server
    app.listen(PORT, () => {
      console.log(` Server running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error(" DB connection failed:", error.message);
  }
})();
