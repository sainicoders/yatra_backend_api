const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const db = {};

// Core Models
db.User = require("./user.model")(sequelize, DataTypes);
db.OTP = require("./otp.model")(sequelize, DataTypes);

/* Core Relations */
db.User.hasMany(db.OTP, { foreignKey: "user_id", onDelete: "CASCADE" });
db.OTP.belongsTo(db.User, { foreignKey: "user_id" });

// Load Flight Models
const flightModels = require("./flights")(sequelize, DataTypes, db);

db.Flight = flightModels.Flight;
db.FlightBooking = flightModels.FlightBooking;
db.FlightPassenger = flightModels.FlightPassenger;

db.sequelize = sequelize;

module.exports = db;