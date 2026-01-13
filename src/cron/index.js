const cron = require("node-cron");
const cleanupExpiredOTPs = require("./otpCleanup");

cron.schedule("*/30 * * * *", async () => {
  try {
    console.log(" OTP cleanup cron started");
    await cleanupExpiredOTPs();
    console.log(" OTP cleanup done");
  } catch (err) {
    console.error("OTP cleanup failed", err);
  }
});
