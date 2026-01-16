// models/flight.model.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Flight",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      provider_flight_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      airline: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      from: {
        type: DataTypes.STRING(3),
        allowNull: false,
      },

      to: {
        type: DataTypes.STRING(3),
        allowNull: false,
      },

      departure_time: DataTypes.DATE,
      arrival_time: DataTypes.DATE,

      duration_minutes: DataTypes.INTEGER,
      stops: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

      base_price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      refundable: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "flights",
      underscored: true,
      timestamps: true,
    }
  );
};
