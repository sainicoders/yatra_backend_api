const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const db = {};

db.User = require("./user.model")(sequelize, DataTypes);
db.OTP = require("./otp.model")(sequelize, DataTypes);

/* relations */
db.User.hasMany(db.OTP, { foreignKey: "user_id" });
db.OTP.belongsTo(db.User, { foreignKey: "user_id" });

db.sequelize = sequelize;
module.exports = db;
