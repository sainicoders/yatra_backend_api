// models/flightBooking.model.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "FlightBooking",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      flight_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      booking_status: {
        type: DataTypes.ENUM(
          "PENDING",
          "CONFIRMED",
          "CANCEL_REQUESTED",
          "REFUND_INITIATED",
          "REFUNDED",
          "CANCELLED"
        ),
        defaultValue: "PENDING",
      },

      /* 🔑 REQUIRED FOR PASSENGER VALIDATION */
      expected_passengers: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      seat_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      price_per_seat: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      total_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      pnr: {
        type: DataTypes.STRING,
        allowNull: true,
      },
 ticket_pdf: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      /* ================= CANCELLATION / REFUND ================= */

      cancel_reason: DataTypes.STRING,
      cancel_requested_at: DataTypes.DATE,

      cancellation_charge: DataTypes.INTEGER,
      refund_amount: DataTypes.INTEGER,

      refunded_at: DataTypes.DATE,
    },
    {
      tableName: "flight_bookings",
      underscored: true,
      timestamps: true,
    }
  );
};
