const service = require("../services/auth.service");

exports.checkEmail = async (req, res) => {
  try {
    res.json(await service.checkEmail(req.body.email));
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.emailLogin = async (req, res) => {
  try {
    const token = await service.emailLogin(req.body);
    res.json({ token });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.sendMobileOTP = async (req, res) => {
  await service.sendMobileOTP(req.body.mobile);
  res.json({ success: true });
};

exports.verifyMobileOTP = async (req, res) => {
  try {
    res.json(await service.verifyMobileOTP(req.body));
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.signup = async (req, res) => {
  try {
    const token = await service.completeSignup(req.body);
    res.json({ token });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};
exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body; // Google ID token

    const data = await service.googleLogin(token);

    res.json({
      success: true,
      ...data,
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e.message,
    });
  }
};

