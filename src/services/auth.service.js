// const { User, OTP } = require("../models");
// const bcrypt = require("bcrypt");
// const { generateOTP } = require("../utils/otp.util");
// const { generateToken } = require("../utils/jwt.util");
// const { OAuth2Client } = require("google-auth-library");
// const { Op } = require("sequelize");
// const { sendEmail } = require("../utils/mailer.util");
// const { emailOTPTemplate } = require("../utils/emailTemplates");
// const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// const { sendSMS } = require("../utils/sms");


// /* ================= EMAIL CHECK ================= */


// exports.checkEmail = async (mobile) => {
//   const user = await User.findOne({ where: { mobile } });

//   if (!user) {
//     return { flow: "SIGNUP" };
//   }

//   if (!user.is_mobile_verified) {
//     return {
//       flow: "OTP",
//       purpose: "MOBILE_VERIFY",
//     };
//   }

//   return {
//     flow: "LOGIN",
//     methods: ["PASSWORD", "MOBILE_OTP"],
//   };
// };


// /* ================= EMAIL LOGIN ================= */

// exports.emailLogin = async ({ email, password }) => {
//   const user = await User.findOne({ where: { email } });
//   if (!user) throw new Error("EMAIL_NOT_REGISTERED");

//   if (!user.is_email_verified) {
//     return {
//   flow: "OTP",
//   purpose: "EMAIL_VERIFY",
// };
//   }

//   const ok = await bcrypt.compare(password, user.password);
//   if (!ok) throw new Error("INVALID_PASSWORD");

//   return {
//     flow: "LOGIN",
//     token: generateToken(user),
//   };
// };





// /* ================= SEND EMAIL OTP ================= */
// exports.sendEmailOTP = async (email) => {
//   const user = await User.findOne({ where: { email } });
//   if (!user) throw new Error("EMAIL_NOT_REGISTERED");

  
//   const existingOTP = await OTP.findOne({
//     where: {
//       target: email,
//       user_id: user.id,
//       purpose: "EMAIL_VERIFY",
//       expires_at: { [Op.gt]: new Date() },
//     },
//   });

//   if (existingOTP) {
//     return {
//       message: "OTP already sent",
//       retryAfter: Math.ceil(
//         (existingOTP.expires_at - Date.now()) / 1000
//       ),
//     };
//   }

//   const otp = generateOTP();

//   await OTP.create({
//     user_id: user.id,
//     target: email,
//     otp,
//     purpose: "EMAIL_VERIFY",
//     expires_at: new Date(Date.now() + 10 * 60 * 1000),
//   });

//   await sendEmail({
//     to: email,
//     subject: "Verify your email",
//     html: emailOTPTemplate(otp),
//   });

//   return { message: "OTP sent to email" };
// };





// /* ================= VERIFY EMAIL OTP ================= */
// exports.verifyEmailOTP = async ({ email, otp }) => {
//   const user = await User.findOne({ where: { email } });
// if (!user) throw new Error("USER_NOT_FOUND");
//   const record = await OTP.findOne({
//     where: {
//       target: email,
//       otp,
//        user_id: user.id,
//       purpose: "EMAIL_VERIFY",
//       expires_at: { [Op.gt]: new Date() },
//     },
//   });

//   if (!record) throw new Error("INVALID_OR_EXPIRED_OTP");

//   await record.destroy();

//   await user.update({ is_email_verified: true });

//   return {
//     flow: "LOGIN",
//     token: generateToken(user),
//   };
// };

// exports.sendEmailLoginOTP = async (email) => {
//   const user = await User.findOne({ where: { email } });
//   if (!user) throw new Error("EMAIL_NOT_REGISTERED");
//   if (!user.is_email_verified) throw new Error("EMAIL_NOT_VERIFIED");

//   // 🔒 CHECK: already active OTP?
//   const existingOTP = await OTP.findOne({
//     where: {
//       target: email,
//       user_id: user.id,
//       purpose: "EMAIL_LOGIN",
//       expires_at: { [Op.gt]: new Date() },
//     },
//   });

//   if (existingOTP) {
//     return {
//       message: "OTP already sent",
//       retryAfter: Math.ceil(
//         (existingOTP.expires_at - Date.now()) / 1000
//       ),
//     };
//   }

//   const otp = generateOTP();

//   // 🧹 clear old (expired) OTPs
//   await OTP.destroy({
//     where: {
//       target: email,
//       user_id: user.id,
//       purpose: "EMAIL_LOGIN",
//     },
//   });

//   await OTP.create({
//     user_id: user.id,
//     target: email,
//     otp,
//     purpose: "EMAIL_LOGIN", // 👈 SAME LOGIC, DIFFERENT PURPOSE
//     expires_at: new Date(Date.now() + 5 * 60 * 1000),
//   });

//   await sendEmail({
//     to: email,
//     subject: "Login OTP",
//     html: emailOTPTemplate(otp),
//   });

//   return { message: "Login OTP sent to email" };
// };


// exports.verifyEmailLoginOTP = async ({ email, otp }) => {
//   const user = await User.findOne({ where: { email } });
//   if (!user) throw new Error("USER_NOT_FOUND");

//   const record = await OTP.findOne({
//     where: {
//       target: email,
//       otp,
//         user_id: user.id,
//       purpose: "EMAIL_LOGIN",
//       expires_at: { [Op.gt]: new Date() },
//     },
//   });

//   if (!record) throw new Error("INVALID_OR_EXPIRED_OTP");

//   await record.destroy();

//   return {
//     flow: "LOGIN",
//     token: generateToken(user),
//   };
// };



// /* ================= MOBILE CHECK ================= */

// exports.checkMobile = async (mobile) => {
//   const user = await User.findOne({ where: { mobile } });

//   if (!user) {
//     return { flow: "SIGNUP" };
//   }

//   if (!user.is_mobile_verified) {
//     return {
//       flow: "OTP",
//       purpose: "MOBILE_VERIFY",
//     };
//   }

//   return {
//     flow: "LOGIN",
//     methods: ["PASSWORD", "MOBILE_OTP"],
//   };
// };



// /* ================= MOBILE LOGIN ================= */

// exports.mobileLogin = async ({ mobile, password }) => {
//   const user = await User.findOne({ where: { mobile } });
//   if (!user) throw new Error("MOBILE_NOT_REGISTERED");

//   if (!user.is_mobile_verified) {
//   return {
//   flow: "OTP",
//   purpose: "MOBILE_VERIFY",
// };
//   }

//   const ok = await bcrypt.compare(password, user.password);
//   if (!ok) throw new Error("INVALID_PASSWORD");

//   return {
//     flow: "LOGIN",
//     token: generateToken(user),
//   };
// };

// /* ================= SEND MOBILE OTP ================= */

// exports.sendMobileOTP = async (mobile) => {
//   const user = await User.findOne({ where: { mobile } });
//   if (!user) throw new Error("MOBILE_NOT_REGISTERED");

//   // 🔒 CHECK: active OTP already exists?
//   const existingOTP = await OTP.findOne({
//     where: {
//       target: mobile,
//       user_id: user.id,
//       purpose: "MOBILE_VERIFY", // 👈 SAME LOGIC
//       expires_at: { [Op.gt]: new Date() },
//     },
//   });

//   if (existingOTP) {
//     return {
//       message: "OTP already sent",
//       retryAfter: Math.ceil(
//         (existingOTP.expires_at - Date.now()) / 1000
//       ),
//     };
//   }

//   const otp = generateOTP();

//   // 🧹 clear old / expired OTPs
//   await OTP.destroy({
//     where: {
//       target: mobile,
//       user_id: user.id,
//       purpose: "MOBILE_VERIFY",
//     },
//   });

//   // 💾 save new OTP
//   await OTP.create({
//     user_id: user.id,
//     target: mobile,
//     otp,
//     purpose: "MOBILE_VERIFY", // 👈 SAME LOGIC
//     expires_at: new Date(Date.now() + 10 * 60 * 1000),
//   });

//   await sendSMS(mobile, `Your verification OTP is ${otp}`);

//   return { message: "OTP sent to mobile" };
// };


// /* ================= VERIFY MOBILE OTP ================= */

// exports.verifyMobileOTP = async ({ mobile, otp }) => {
//   const user = await User.findOne({ where: { mobile } });
//   if (!user) throw new Error("USER_NOT_FOUND");

//   const record = await OTP.findOne({
//     where: {
//       target: mobile,
//       otp,
//         user_id: user.id,
//       purpose: "MOBILE_VERIFY",
//       expires_at: { [Op.gt]: new Date() },
//     },
//   });

//   if (!record) throw new Error("INVALID_OR_EXPIRED_OTP");

//   await record.destroy();

//   // ✅ mark mobile verified
//   await user.update({
//     is_mobile_verified: true,
//   });

//   return {
//     flow: "LOGIN",
//     token: generateToken(user),
//   };
// };
// exports.sendMobileLoginOTP = async (mobile) => {
//   const user = await User.findOne({ where: { mobile } });
//   if (!user) throw new Error("MOBILE_NOT_REGISTERED");
//   if (!user.is_mobile_verified) throw new Error("MOBILE_NOT_VERIFIED");

//   // 🔒 CHECK: active login OTP already exists?
//   const existingOTP = await OTP.findOne({
//     where: {
//       target: mobile,
//       user_id: user.id,
//       purpose: "MOBILE_LOGIN", // 👈 SAME LOGIC
//       expires_at: { [Op.gt]: new Date() },
//     },
//   });

//   if (existingOTP) {
//     return {
//       message: "OTP already sent",
//       retryAfter: Math.ceil(
//         (existingOTP.expires_at - Date.now()) / 1000
//       ),
//     };
//   }

//   const otp = generateOTP();

//   // 🧹 remove old OTPs (expired / used)
//   await OTP.destroy({
//     where: {
//       target: mobile,
//       user_id: user.id,
//       purpose: "MOBILE_LOGIN",
//     },
//   });

//   // 💾 save new login OTP
//   await OTP.create({
//     user_id: user.id,
//     target: mobile,
//     otp,
//     purpose: "MOBILE_LOGIN", // 👈 SAME LOGIC
//     expires_at: new Date(Date.now() + 5 * 60 * 1000),
//   });

//   await sendSMS(mobile, `Your login OTP is ${otp}`);

//   return { message: "Login OTP sent to mobile" };
// };

// exports.verifyMobileLoginOTP = async ({ mobile, otp }) => {
//   const user = await User.findOne({ where: { mobile } });
//   if (!user) throw new Error("USER_NOT_FOUND");

//   const record = await OTP.findOne({
//     where: {
//       target: mobile,
//       otp,
//             user_id: user.id, // ✅ FIX
//       purpose: "MOBILE_LOGIN",
//       expires_at: { [Op.gt]: new Date() },
//     },
//   });

//   if (!record) throw new Error("INVALID_OR_EXPIRED_OTP");

//   await record.destroy();

//   return {
//     flow: "LOGIN",
//     token: generateToken(user),
//   };
// };




// function validateSignupData(data) {
//   if (!data.email) throw new Error("EMAIL_REQUIRED");
//   if (!data.mobile) throw new Error("MOBILE_REQUIRED");
//   if (!data.password) throw new Error("PASSWORD_REQUIRED");
//   if (!data.role) throw new Error("ROLE_REQUIRED");

//   if (data.role === "PERSONAL") {
//     if (!data.full_name) throw new Error("FULL_NAME_REQUIRED");
//   }

//   if (data.role === "SME") {
//     if (!data.company_name) throw new Error("COMPANY_NAME_REQUIRED");
//     if (!data.gst_number) throw new Error("GST_NUMBER_REQUIRED");
//     if (!data.company_address) throw new Error("COMPANY_ADDRESS_REQUIRED");
//   }
// }

// exports.completeSignup = async (data) => {
//   const {
//     email,
//     password,
//     role,
//     full_name,
//     gender,
//     mobile,
//     company_name,
//     gst_number,
//     company_address,
//     city,
//     state,
//     pincode,
//   } = data;

//   if (!["PERSONAL", "SME"].includes(role)) {
//     throw new Error("INVALID_ROLE");
//   }

//   validateSignupData(data);

//   // 🔒 Check duplicate email
//   const emailExists = await User.findOne({ where: { email } });
//   if (emailExists) throw new Error("EMAIL_ALREADY_EXISTS");

//   // 🔒 Check duplicate mobile
//   const mobileExists = await User.findOne({ where: { mobile } });
//   if (mobileExists) throw new Error("MOBILE_ALREADY_EXISTS");

//   const hash = await bcrypt.hash(password, 10);

//   const user = await User.create({
//     email,
//     password: hash,
//     role,
//     full_name,
//     gender,
//     mobile,
//     company_name,
//     gst_number,
//     company_address,
//     city,
//     state,
//     pincode,
//     is_email_verified: false,
//     is_mobile_verified: false,
//   });

//   // 📧📱 Send both OTPs
//   await exports.sendEmailOTP(email);
//   // await exports.sendMobileOTP(mobile);

//   return {
//     flow: "OTP",
//     message: "OTP sent to email",
//   };
// };



// /* ================= GOOGLE LOGIN ================= */
// exports.googleLogin = async (googleToken) => {
//   if (!googleToken) throw new Error("GOOGLE_TOKEN_REQUIRED");

//   const ticket = await googleClient.verifyIdToken({
//     idToken: googleToken,
//     audience: process.env.GOOGLE_CLIENT_ID,
//   });

//   const payload = ticket.getPayload();
//   const { email } = payload;

//   if (!email) throw new Error("GOOGLE_EMAIL_REQUIRED");

//   const user = await User.findOne({ where: { email } });

 
//   if (!user) {
//     throw new Error("ACCOUNT_NOT_FOUND");
//   }

  
//   if (user.is_email_verified || user.is_mobile_verified) {
//     return {
//       flow: "LOGIN",
//       token: generateToken(user),
//     };
//   }

// return {
//   flow: "OTP",
//   methods: ["EMAIL_OTP", "MOBILE_OTP"],
// }
// };

const { User, OTP } = require("../models");
const bcrypt = require("bcrypt");
const { generateOTP } = require("../utils/otp.util");
const { generateToken } = require("../utils/jwt.util");
const { OAuth2Client } = require("google-auth-library");
const { Op } = require("sequelize");
const { sendEmail } = require("../utils/mailer.util");
const { emailOTPTemplate } = require("../utils/emailTemplates");
const { sendSMS } = require("../utils/sms");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* ================= EMAIL CHECK ================= */

exports.checkEmail = async (email) => {
  const user = await User.findOne({ where: { email } });

  if (!user) return { flow: "SIGNUP" };

  if (!user.is_email_verified) {
    return { flow: "OTP", purpose: "EMAIL_VERIFY" };
  }

  return {
    flow: "LOGIN",
    methods: ["PASSWORD", "EMAIL_OTP"],
  };
};

/* ================= EMAIL LOGIN ================= */

exports.emailLogin = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("EMAIL_NOT_REGISTERED");

  if (!user.is_email_verified) {
    return { flow: "OTP", purpose: "EMAIL_VERIFY" };
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error("INVALID_PASSWORD");

  return { flow: "LOGIN", token: generateToken(user) };
};

/* ================= SEND EMAIL VERIFY OTP ================= */

exports.sendEmailOTP = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("EMAIL_NOT_REGISTERED");

  const existingOTP = await OTP.findOne({
    where: {
      target: email,
      user_id: user.id,
      purpose: "EMAIL_VERIFY",
      expires_at: { [Op.gt]: new Date() },
    },
  });

  if (existingOTP) {
    return {
      message: "OTP already sent",
      retryAfter: Math.ceil((existingOTP.expires_at - Date.now()) / 1000),
    };
  }

  const otp = generateOTP();

  await OTP.create({
    user_id: user.id,
    target: email,
    otp,
    purpose: "EMAIL_VERIFY",
    expires_at: new Date(Date.now() + 10 * 60 * 1000),
  });

  await sendEmail({
    to: email,
    subject: "Verify your email",
    html: emailOTPTemplate(otp),
  });

  return { message: "OTP sent to email" };
};

/* ================= VERIFY EMAIL OTP ================= */

exports.verifyEmailOTP = async ({ email, otp }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("USER_NOT_FOUND");

  const record = await OTP.findOne({
    where: {
      target: email,
      otp,
      user_id: user.id,
      purpose: "EMAIL_VERIFY",
      expires_at: { [Op.gt]: new Date() },
    },
  });

  if (!record) throw new Error("INVALID_OR_EXPIRED_OTP");

  await record.destroy();
  await user.update({ is_email_verified: true });

  return { flow: "LOGIN", token: generateToken(user) };
};

/* ================= EMAIL LOGIN OTP ================= */

exports.sendEmailLoginOTP = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("EMAIL_NOT_REGISTERED");
  if (!user.is_email_verified) throw new Error("EMAIL_NOT_VERIFIED");

  const existingOTP = await OTP.findOne({
    where: {
      target: email,
      user_id: user.id,
      purpose: "EMAIL_LOGIN",
      expires_at: { [Op.gt]: new Date() },
    },
  });

  if (existingOTP) {
    return {
      message: "OTP already sent",
      retryAfter: Math.ceil((existingOTP.expires_at - Date.now()) / 1000),
    };
  }

  const otp = generateOTP();

  await OTP.destroy({
    where: { target: email, user_id: user.id, purpose: "EMAIL_LOGIN" },
  });

  await OTP.create({
    user_id: user.id,
    target: email,
    otp,
    purpose: "EMAIL_LOGIN",
    expires_at: new Date(Date.now() + 5 * 60 * 1000),
  });

  await sendEmail({
    to: email,
    subject: "Login OTP",
    html: emailOTPTemplate(otp),
  });

  return { message: "Login OTP sent to email" };
};

exports.verifyEmailLoginOTP = async ({ email, otp }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("USER_NOT_FOUND");

  const record = await OTP.findOne({
    where: {
      target: email,
      otp,
      user_id: user.id,
      purpose: "EMAIL_LOGIN",
      expires_at: { [Op.gt]: new Date() },
    },
  });

  if (!record) throw new Error("INVALID_OR_EXPIRED_OTP");

  await record.destroy();

  return { flow: "LOGIN", token: generateToken(user) };
};

/* ================= MOBILE CHECK ================= */

exports.checkMobile = async (mobile) => {
  const user = await User.findOne({ where: { mobile } });

  if (!user) return { flow: "SIGNUP" };

  if (!user.is_mobile_verified) {
    return { flow: "OTP", purpose: "MOBILE_VERIFY" };
  }

  return {
    flow: "LOGIN",
    methods: ["PASSWORD", "MOBILE_OTP"],
  };
};

/* ================= MOBILE LOGIN ================= */

exports.mobileLogin = async ({ mobile, password }) => {
  const user = await User.findOne({ where: { mobile } });
  if (!user) throw new Error("MOBILE_NOT_REGISTERED");

  if (!user.is_mobile_verified) {
    return { flow: "OTP", purpose: "MOBILE_VERIFY" };
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error("INVALID_PASSWORD");

  return { flow: "LOGIN", token: generateToken(user) };
};

/* ================= MOBILE VERIFY OTP ================= */

exports.sendMobileOTP = async (mobile) => {
  const user = await User.findOne({ where: { mobile } });
  if (!user) throw new Error("MOBILE_NOT_REGISTERED");

  const existingOTP = await OTP.findOne({
    where: {
      target: mobile,
      user_id: user.id,
      purpose: "MOBILE_VERIFY",
      expires_at: { [Op.gt]: new Date() },
    },
  });

  if (existingOTP) {
    return {
      message: "OTP already sent",
      retryAfter: Math.ceil((existingOTP.expires_at - Date.now()) / 1000),
    };
  }

  const otp = generateOTP();

  await OTP.destroy({
    where: { target: mobile, user_id: user.id, purpose: "MOBILE_VERIFY" },
  });

  await OTP.create({
    user_id: user.id,
    target: mobile,
    otp,
    purpose: "MOBILE_VERIFY",
    expires_at: new Date(Date.now() + 10 * 60 * 1000),
  });

  await sendSMS(mobile, `Your verification OTP is ${otp}`);

  return { message: "OTP sent to mobile",otp };
};

exports.verifyMobileOTP = async ({ mobile, otp }) => {
  const user = await User.findOne({ where: { mobile } });
  if (!user) throw new Error("USER_NOT_FOUND");

  const record = await OTP.findOne({
    where: {
      target: mobile,
      otp,
      user_id: user.id,
      purpose: "MOBILE_VERIFY",
      expires_at: { [Op.gt]: new Date() },
    },
  });

  if (!record) throw new Error("INVALID_OR_EXPIRED_OTP");

  await record.destroy();
  await user.update({ is_mobile_verified: true });

  return { flow: "LOGIN", token: generateToken(user) };
};

/* ================= MOBILE LOGIN OTP ================= */

exports.sendMobileLoginOTP = async (mobile) => {
  const user = await User.findOne({ where: { mobile } });
  if (!user) throw new Error("MOBILE_NOT_REGISTERED");
  if (!user.is_mobile_verified) throw new Error("MOBILE_NOT_VERIFIED");

  const existingOTP = await OTP.findOne({
    where: {
      target: mobile,
      user_id: user.id,
      purpose: "MOBILE_LOGIN",
      expires_at: { [Op.gt]: new Date() },
    },
  });

  if (existingOTP) {
    return {
      message: "OTP already sent",
      retryAfter: Math.ceil((existingOTP.expires_at - Date.now()) / 1000),
    };
  }

  const otp = generateOTP();

  await OTP.destroy({
    where: { target: mobile, user_id: user.id, purpose: "MOBILE_LOGIN" },
  });

  await OTP.create({
    user_id: user.id,
    target: mobile,
    otp,
    purpose: "MOBILE_LOGIN",
    expires_at: new Date(Date.now() + 5 * 60 * 1000),
  });

  await sendSMS(mobile, `Your login OTP is ${otp}`);

  return { message: "Login OTP sent to mobile",otp };
};

exports.verifyMobileLoginOTP = async ({ mobile, otp }) => {
  const user = await User.findOne({ where: { mobile } });
  if (!user) throw new Error("USER_NOT_FOUND");

  const record = await OTP.findOne({
    where: {
      target: mobile,
      otp,
      user_id: user.id,
      purpose: "MOBILE_LOGIN",
      expires_at: { [Op.gt]: new Date() },
    },
  });

  if (!record) throw new Error("INVALID_OR_EXPIRED_OTP");

  await record.destroy();

  return { flow: "LOGIN", token: generateToken(user) };
};

/* ================= complete signup================= */
function validateSignupData(data) {
  if (!data.email) throw new Error("EMAIL_REQUIRED");
  if (!data.mobile) throw new Error("MOBILE_REQUIRED");
  if (!data.password) throw new Error("PASSWORD_REQUIRED");
  if (!data.role) throw new Error("ROLE_REQUIRED");

  if (data.role === "PERSONAL") {
    if (!data.full_name) throw new Error("FULL_NAME_REQUIRED");
  }

  if (data.role === "SME") {
    if (!data.company_name) throw new Error("COMPANY_NAME_REQUIRED");
    if (!data.gst_number) throw new Error("GST_NUMBER_REQUIRED");
    if (!data.company_address) throw new Error("COMPANY_ADDRESS_REQUIRED");
  }
}

exports.completeSignup = async (data) => {
  const {
    email,
    password,
    role,
    full_name,
    gender,
    mobile,
    company_name,
    gst_number,
    company_address,
    city,
    state,
    pincode,
  } = data;

  // 🔐 Role validation
  if (!["PERSONAL", "SME"].includes(role)) {
    throw new Error("INVALID_ROLE");
  }

  // 📋 Basic + role based validation
  validateSignupData(data);

  // 🔒 Check duplicate email
  const emailExists = await User.findOne({ where: { email } });

  if (emailExists && emailExists.is_email_verified) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  if (emailExists && !emailExists.is_email_verified) {
    // 🔁 Resume signup (resend OTP)
    await exports.sendEmailOTP(email);
    return {
      flow: "OTP",
      message: "OTP resent to email",
    };
  }

  // 🔒 Check duplicate mobile
  const mobileExists = await User.findOne({ where: { mobile } });
  if (mobileExists) {
    throw new Error("MOBILE_ALREADY_EXISTS");
  }

  // 🔐 Hash password
  const hash = await bcrypt.hash(password, 10);

  // 👤 Create user
  const user = await User.create({
    email,
    password: hash,
    role,
    full_name,
    gender,
    mobile,
    company_name,
    gst_number,
    company_address,
    city,
    state,
    pincode,
    is_email_verified: false,
    is_mobile_verified: false,
  });

  // 📧 Send email OTP after successful signup
  await exports.sendEmailOTP(user.email);
  // await exports.sendMobileOTP(user.mobile);

  return {
    flow: "OTP",
    message: "OTP sent to email",
  };
};


/* ================= GOOGLE LOGIN ================= */

exports.googleLogin = async (googleToken) => {
  if (!googleToken) throw new Error("GOOGLE_TOKEN_REQUIRED");

  const ticket = await googleClient.verifyIdToken({
    idToken: googleToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const { email } = ticket.getPayload();
  if (!email) throw new Error("GOOGLE_EMAIL_REQUIRED");

  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("ACCOUNT_NOT_FOUND");

  if (user.is_email_verified || user.is_mobile_verified) {
    return { flow: "LOGIN", token: generateToken(user) };
  }

  return { flow: "OTP", methods: ["EMAIL_OTP", "MOBILE_OTP"] };
};




