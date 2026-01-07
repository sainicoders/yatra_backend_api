const { User } = require("../models/index");

exports.getProfile = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ["password"] },
  });

  if (!user) throw new Error("User not found");
  return user;
};
