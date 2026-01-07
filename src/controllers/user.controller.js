const service = require("../services/user.service");

exports.getMe = async (req, res) => {
  try {
    const data = await service.getProfile(req.user.id);
    res.json(data);
  } catch (e) {
    res.status(404).json({ message: e.message });
  }
};
