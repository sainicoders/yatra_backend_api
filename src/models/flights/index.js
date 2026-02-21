module.exports = (sequelize, DataTypes, db) => {

  const Flight = require("./flight.model")(sequelize, DataTypes);
  const FlightBooking = require("./flightBooking.model")(sequelize, DataTypes);
  const FlightPassenger = require("./flightPassenger.model")(sequelize, DataTypes);

  /* ================= RELATIONS ================= */

  // Flight → Bookings
  Flight.hasMany(FlightBooking, {
    foreignKey: "flight_id",
    as: "bookings",
  });

  FlightBooking.belongsTo(Flight, {
    foreignKey: "flight_id",
    as: "flight",
  });

  // Booking → Passengers
  FlightBooking.hasMany(FlightPassenger, {
    foreignKey: "booking_id",
    as: "passengers",
  });

  FlightPassenger.belongsTo(FlightBooking, {
    foreignKey: "booking_id",
    as: "booking",
  });

  // User → Bookings
  db.User.hasMany(FlightBooking, {
    foreignKey: "user_id",
    as: "bookings",
  });

  FlightBooking.belongsTo(db.User, {
    foreignKey: "user_id",
    as: "user",
  });

  return {
    Flight,
    FlightBooking,
    FlightPassenger,
  };
};