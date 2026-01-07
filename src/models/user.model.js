module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      role: {
        type: DataTypes.ENUM("PERSONAL", "SME"),
        defaultValue: "PERSONAL",
      },

      email: {
        type: DataTypes.STRING,
        unique: true,
      },

      mobile: {
        type: DataTypes.STRING,
        unique: true,
      },

      password: DataTypes.TEXT,

      full_name: DataTypes.STRING,
      gender: DataTypes.STRING,

      gst_number: DataTypes.STRING,
      company_name: DataTypes.STRING,
      company_address: DataTypes.TEXT,

      city: DataTypes.STRING,
      state: DataTypes.STRING,
      pincode: DataTypes.STRING,

      promo_optin: DataTypes.BOOLEAN,
      whatsapp_optin: DataTypes.BOOLEAN,

      is_email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      is_mobile_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "users",
      underscored: true,
      timestamps: true,
    }
  );
};
