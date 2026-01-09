const service = require("../services/auth.service");

exports.checkEmail = async (req, res) => {
  res.json(await service.checkEmail(req.body.email));
};

exports.emailLogin = async (req, res) => {
  const token = await service.emailLogin(req.body);
  res.json({ token });
};

exports.sendEmailOTP = async (req, res) => {
  await service.sendEmailOTP(req.body.email);
  res.json({ success: true });
};

exports.verifyEmailOTP = async (req, res) => {
  res.json(await service.verifyEmailOTP(req.body));
};

exports.sendMobileOTP = async (req, res) => {
  await service.sendMobileOTP(req.body.mobile);
  res.json({ success: true });
};

exports.verifyMobileOTP = async (req, res) => {
  res.json(await service.verifyMobileOTP(req.body));
};

exports.signup = async (req, res) => {
  const token = await service.completeSignup(req.body);
  res.json({ token });
};

/* ================= GOOGLE LOGIN ================= */
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
