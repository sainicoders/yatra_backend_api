module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "OTP",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
          user_id: {
        type: DataTypes.UUID,  
         allowNull: true,
      },

      target: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      otp: {
        type: DataTypes.STRING(6),
        allowNull: false,
      },

      purpose: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "otp_verifications",
      underscored: true,
      timestamps: true,
    }
  );
};
