const service = require("../services/auth.service");
const otpService = require("../services/auth.service");
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

// exports.sendMobileOTP = async (req, res) => {
//   if (!req.body.mobile) {
//     return res.status(400).json({ message: "Mobile required" });
//   }

//   try {
//     await service.sendMobileOTP(req.body.mobile);
//     res.json({ success: true });
//   } catch (e) {
//     res.status(400).json({ message: e.message });
//   }
// };

exports.sendMobileOTP = async (req, res) => {
  if (!req.body.mobile) {
    return res.status(400).json({ message: "Mobile required" });
  }

  const data = await otpService.sendMobileOTPService(req.body.mobile);

  return res.json({
    success: true,
    data, 
  });
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
  const token = await service.completeSignup(req.body);
  res.json({ token });
};

/* ================= GOOGLE LOGIN ================= */
exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body; // Google ID token from frontend

    if (!token) {
      return res.status(400).json({ message: "Google token required" });
    }

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

