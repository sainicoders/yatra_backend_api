// const service = require("../services/auth.service");

// /* ================= CHECK EMAIL ================= */
// exports.checkEmail = async (req, res) => {
//   try {
//     const { email } = req.body;
//     if (!email) {
//       return res.status(400).json({ success: false, message: "EMAIL_REQUIRED" });
//     }

//     const data = await service.checkEmail(email);
//     return res.json({ success: true, data });
//   } catch (e) {
//     return res.status(400).json({ success: false, message: e.message });
//   }
// };

// /* ================= EMAIL LOGIN ================= */
// exports.emailLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "EMAIL_AND_PASSWORD_REQUIRED",
//       });
//     }

//     const data = await service.emailLogin(req.body);
//     return res.json({ success: true, data });
//   } catch (e) {
//     return res.status(400).json({ success: false, message: e.message });
//   }
// };

// /* ================= SEND EMAIL OTP ================= */
// exports.sendEmailOTP = async (req, res) => {
//   try {
//     const { email } = req.body;
//     if (!email) {
//       return res.status(400).json({ success: false, message: "EMAIL_REQUIRED" });
//     }

//     const data = await service.sendEmailOTP(email);
//     return res.json({ success: true, data });
//   } catch (e) {
//     return res.status(400).json({ success: false, message: e.message });
//   }
// };

// /* ================= VERIFY EMAIL OTP ================= */
// exports.verifyEmailOTP = async (req, res) => {
//   try {
//     const { email, otp } = req.body;
//     if (!email || !otp) {
//       return res.status(400).json({
//         success: false,
//         message: "EMAIL_AND_OTP_REQUIRED",
//       });
//     }

//     const data = await service.verifyEmailOTP(req.body);
//     return res.json({ success: true, data });
//   } catch (e) {
//     return res.status(400).json({ success: false, message: e.message });
//   }
// };
// /* ================= SEND EMAIL LOGIN OTP ================= */
// exports.sendEmailLoginOTP = async (req, res) => {
//   try {
//     const { email } = req.body;
//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: "EMAIL_REQUIRED",
//       });
//     }

//     const data = await service.sendEmailLoginOTP(email);
//     return res.json({ success: true, data });
//   } catch (e) {
//     return res.status(400).json({
//       success: false,
//       message: e.message,
//     });
//   }
// };
// /* ================= VERIFY EMAIL LOGIN OTP ================= */
// exports.verifyEmailLoginOTP = async (req, res) => {
//   try {
//     const { email, otp } = req.body;
//     if (!email || !otp) {
//       return res.status(400).json({
//         success: false,
//         message: "EMAIL_AND_OTP_REQUIRED",
//       });
//     }

//     const data = await service.verifyEmailLoginOTP(req.body);
//     return res.json({ success: true, data });
//   } catch (e) {
//     return res.status(400).json({
//       success: false,
//       message: e.message,
//     });
//   }
// };

// /* ================= CHECK MOBILE ================= */
// exports.checkMobile = async (req, res) => {
//   try {
//     const { mobile } = req.body;
//     if (!mobile) {
//       return res.status(400).json({
//         success: false,
//         message: "MOBILE_REQUIRED",
//       });
//     }

//     const data = await service.checkMobile(mobile);
//     return res.json({ success: true, data });
//   } catch (e) {
//     return res.status(400).json({ success: false, message: e.message });
//   }
// };

// /* ================= MOBILE LOGIN ================= */
// exports.mobileLogin = async (req, res) => {
//   try {
//     const { mobile, password } = req.body;
//     if (!mobile || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "MOBILE_AND_PASSWORD_REQUIRED",
//       });
//     }

//     const data = await service.mobileLogin(req.body);
//     return res.json({ success: true, data });
//   } catch (e) {
//     return res.status(400).json({ success: false, message: e.message });
//   }
// };

// /* ================= SEND MOBILE OTP ================= */
// exports.sendMobileOTP = async (req, res) => {
//   try {
//     const { mobile } = req.body;
//     if (!mobile) {
//       return res.status(400).json({
//         success: false,
//         message: "MOBILE_REQUIRED",
//       });
//     }

//     const data = await service.sendMobileOTP(mobile);
//     return res.json({ success: true, data });
//   } catch (e) {
//     return res.status(400).json({
//       success: false,
//       message: e.message || "FAILED_TO_SEND_OTP",
//     });
//   }
// };

// /* ================= VERIFY MOBILE OTP ================= */
// exports.verifyMobileOTP = async (req, res) => {
//   try {
//     const { mobile, otp } = req.body;
//     if (!mobile || !otp) {
//       return res.status(400).json({
//         success: false,
//         message: "MOBILE_AND_OTP_REQUIRED",
//       });
//     }

//     const data = await service.verifyMobileOTP(req.body);
//     return res.json({ success: true, data });
//   } catch (e) {
//     return res.status(400).json({ success: false, message: e.message });
//   }
// };

// /* ================= SIGNUP ================= */
// exports.signup = async (req, res) => {
//   try {
//     const data = await service.completeSignup(req.body);
//     return res.json({ success: true, data });
//   } catch (e) {
//     return res.status(400).json({
//       success: false,
//       message: e.message,
//     });
//   }
// };
// /* ================= SEND MOBILE LOGIN OTP ================= */
// exports.sendMobileLoginOTP = async (req, res) => {
//   try {
//     const { mobile } = req.body;
//     if (!mobile) {
//       return res.status(400).json({
//         success: false,
//         message: "MOBILE_REQUIRED",
//       });
//     }

//     const data = await service.sendMobileLoginOTP(mobile);
//     return res.json({ success: true, data });
//   } catch (e) {
//     return res.status(400).json({
//       success: false,
//       message: e.message,
//     });
//   }
// };
// /* ================= VERIFY MOBILE LOGIN OTP ================= */
// exports.verifyMobileLoginOTP = async (req, res) => {
//   try {
//     const { mobile, otp } = req.body;
//     if (!mobile || !otp) {
//       return res.status(400).json({
//         success: false,
//         message: "MOBILE_AND_OTP_REQUIRED",
//       });
//     }

//     const data = await service.verifyMobileLoginOTP(req.body);
//     return res.json({ success: true, data });
//   } catch (e) {
//     return res.status(400).json({
//       success: false,
//       message: e.message,
//     });
//   }
// };

// /* ================= GOOGLE LOGIN ================= */
// exports.googleLogin = async (req, res) => {
//   try {
//     const googleToken = req.body.googleToken || req.body.token;

//     if (!googleToken) {
//       return res.status(400).json({
//         success: false,
//         message: "GOOGLE_TOKEN_REQUIRED",
//       });
//     }

//     const result = await service.googleLogin(googleToken);

//     return res.status(200).json({
//       success: true,
//       ...result,
//     });
//   } catch (e) {
//     const statusMap = {
//       GOOGLE_TOKEN_REQUIRED: 400,
//       GOOGLE_EMAIL_NOT_VERIFIED: 401,
//       USE_EMAIL_PASSWORD_LOGIN: 409,
//     };

//     return res.status(statusMap[e.message] || 500).json({
//       success: false,
//       message: e.message || "INTERNAL_SERVER_ERROR",
//     });
//   }
// };


const service = require("../services/auth.service");

/* ================= CHECK EMAIL ================= */
exports.checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "EMAIL_REQUIRED" });
    }

    const data = await service.checkEmail(email);
    return res.status(200).json({ success: true, data });
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  }
};

/* ================= EMAIL LOGIN ================= */
exports.emailLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "EMAIL_AND_PASSWORD_REQUIRED",
      });
    }

    const data = await service.emailLogin(req.body);
    return res.status(200).json({ success: true, data });
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  }
};

/* ================= SEND EMAIL OTP ================= */
exports.sendEmailOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "EMAIL_REQUIRED" });
    }

    const data = await service.sendEmailOTP(email);
    return res.status(200).json({ success: true, data });
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  }
};

/* ================= VERIFY EMAIL OTP ================= */
exports.verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "EMAIL_AND_OTP_REQUIRED",
      });
    }

    const data = await service.verifyEmailOTP(req.body);
    return res.status(200).json({ success: true, data });
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  }
};

/* ================= EMAIL LOGIN OTP ================= */
exports.sendEmailLoginOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "EMAIL_REQUIRED" });
    }

    const data = await service.sendEmailLoginOTP(email);
    return res.status(200).json({ success: true, data });
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  }
};

exports.verifyEmailLoginOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "EMAIL_AND_OTP_REQUIRED",
      });
    }

    const data = await service.verifyEmailLoginOTP(req.body);
    return res.status(200).json({ success: true, data });
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  }
};

/* ================= CHECK MOBILE ================= */
exports.checkMobile = async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile) {
      return res.status(400).json({ success: false, message: "MOBILE_REQUIRED" });
    }

    const data = await service.checkMobile(mobile);
    return res.status(200).json({ success: true, data });
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  }
};

/* ================= MOBILE LOGIN ================= */
exports.mobileLogin = async (req, res) => {
  try {
    const { mobile, password } = req.body;
    if (!mobile || !password) {
      return res.status(400).json({
        success: false,
        message: "MOBILE_AND_PASSWORD_REQUIRED",
      });
    }

    const data = await service.mobileLogin(req.body);
    return res.status(200).json({ success: true, data });
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  }
};

/* ================= MOBILE VERIFY OTP ================= */
exports.sendMobileOTP = async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile) {
      return res.status(400).json({ success: false, message: "MOBILE_REQUIRED" });
    }

    const data = await service.sendMobileOTP(mobile);
    return res.status(200).json({ success: true, data });
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  }
};

exports.verifyMobileOTP = async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    if (!mobile || !otp) {
      return res.status(400).json({
        success: false,
        message: "MOBILE_AND_OTP_REQUIRED",
      });
    }

    const data = await service.verifyMobileOTP(req.body);
    return res.status(200).json({ success: true, data });
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  }
};

/* ================= MOBILE LOGIN OTP ================= */
exports.sendMobileLoginOTP = async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile) {
      return res.status(400).json({ success: false, message: "MOBILE_REQUIRED" });
    }

    const data = await service.sendMobileLoginOTP(mobile);
    return res.status(200).json({ success: true, data });
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  }
};

exports.verifyMobileLoginOTP = async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    if (!mobile || !otp) {
      return res.status(400).json({
        success: false,
        message: "MOBILE_AND_OTP_REQUIRED",
      });
    }

    const data = await service.verifyMobileLoginOTP(req.body);
    return res.status(200).json({ success: true, data });
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  }
};

/* ================= SIGNUP ================= */
exports.signup = async (req, res) => {
  try {
    const data = await service.completeSignup(req.body);
    return res.status(201).json({ success: true, data });
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
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

    const data = await service.googleLogin(googleToken);
    return res.status(200).json({ success: true, data });
  } catch (e) {
    return res.status(400).json({
      success: false,
      message: e.message || "GOOGLE_LOGIN_FAILED",
    });
  }
};

