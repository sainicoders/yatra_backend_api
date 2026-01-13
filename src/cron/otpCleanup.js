const { OTP } = require("../models");
const { Op } = require("sequelize");

async function cleanupExpiredOTPs() {
  await OTP.destroy({
    where: {
      expires_at: { [Op.lt]: new Date() },
    },
  });
}

module.exports = cleanupExpiredOTPs;
