// models/flightPassenger.model.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "FlightPassenger",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      booking_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      full_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      age: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      gender: {
        type: DataTypes.ENUM("M", "F", "O"),
        allowNull: false,
      },
    },
    {
      tableName: "flight_passengers",
      underscored: true,
      timestamps: true,
    }
  );
};
