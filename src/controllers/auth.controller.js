const service = require("../services/auth.service");

exports.checkEmail = async (req, res) => {
  if (!req.body.email) {
    return res.status(400).json({ message: "Email required" });
  }

  res.json(await service.checkEmail(req.body.email));
};


exports.emailLogin = async (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    const token = await service.emailLogin(req.body);
    res.json({ token });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};


exports.sendEmailOTP = async (req, res) => {
  if (!req.body.email) {
    return res.status(400).json({ message: "Email required" });
  }

  try {
    await service.sendEmailOTP(req.body.email);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};


exports.verifyEmailOTP = async (req, res) => {
  if (!req.body.email || !req.body.otp) {
    return res.status(400).json({ message: "Email and OTP required" });
  }

  try {
    const data = await service.verifyEmailOTP(req.body);
    res.json(data);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.sendMobileOTP = async (req, res, next) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({
        success: false,
        message: "Mobile required",
      });
    }

    const data = await service.sendMobileOTP(mobile);

    return res.status(200).json({
      success: true,
      data, // { message, otp }
    });
  } catch (err) {
    console.error("SEND OTP ERROR:", err);

    // simple response (without global handler)
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to send OTP",
    });

    
  }
};

exports.verifyMobileOTP = async (req, res) => {
  if (!req.body.mobile || !req.body.otp) {
    return res.status(400).json({ message: "Mobile and OTP required" });
  }

  try {
    const data = await service.verifyMobileOTP(req.body);
    res.json(data);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};


exports.signup = async (req, res) => {
  try {
    const data = await service.completeSignup(req.body);
    res.json(data);
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e.message,
    });
  }
};

/* ================= GOOGLE LOGIN ================= */
exports.googleLogin = async (req, res) => {
  try {
    const googleToken = req.body.googleToken || req.body.token;

    if (!googleToken) {
      return res.status(400).json({
        success: false,
        message: "GOOGLE_TOKEN_REQUIRED",
      });
    }

    const result = await service.googleLogin(googleToken);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (e) {
    const statusMap = {
      GOOGLE_TOKEN_REQUIRED: 400,
      GOOGLE_EMAIL_NOT_VERIFIED: 401,
      USE_EMAIL_PASSWORD_LOGIN: 409,
    };

    return res.status(statusMap[e.message] || 500).json({
      success: false,
      message: e.message || "INTERNAL_SERVER_ERROR",
    });
  }
};



