const { User, OTP } = require("../models");
const bcrypt = require("bcrypt");
const { generateOTP } = require("../utils/otp.util");
const { generateToken } = require("../utils/jwt.util");
const { OAuth2Client } = require("google-auth-library");
const { Op } = require("sequelize");
const { sendEmail } = require("../utils/mailer.util");
const { emailOTPTemplate } = require("../utils/emailTemplates");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const { sendSMS } = require("../utils/sms");


/* ================= EMAIL CHECK ================= */


exports.checkEmail = async (email) => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return { flow: "SIGNUP" };
  }

  if (!user.is_email_verified) {
    await exports.sendEmailOTP(email);
    return {
      flow: "OTP",
      message: "OTP sent to email",
    };
  }

  return {
    flow: "LOGIN",
    methods: ["PASSWORD", "EMAIL_OTP"],
  };
};



/* ================= EMAIL LOGIN ================= */
exports.verifyEmailOTP = async ({ email, otp }) => {
  const user = await User.findOne({ where: { email } });

  const record = await OTP.findOne({
    where: {
      target: email,
      otp,
      purpose: "EMAIL_VERIFY",
      expires_at: { [Op.gt]: new Date() },
    },
  });

  if (!record) throw new Error("INVALID_OR_EXPIRED_OTP");

  await record.destroy();

  await user.update({ is_email_verified: true });

  return {
    flow: "LOGIN",
    token: generateToken(user),
  };
};




/* ================= SEND EMAIL OTP ================= */
exports.sendEmailOTP = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("EMAIL_NOT_REGISTERED");

  const otp = generateOTP();

  // remove old OTP
  await OTP.destroy({
    where: {
      target: email,
      user_id: user.id,
      purpose: "EMAIL_VERIFY",
    },
  });

  // save new OTP
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
      purpose: "EMAIL_VERIFY",
      expires_at: { [Op.gt]: new Date() },
    },
  });

  if (!record) throw new Error("INVALID_OR_EXPIRED_OTP");

  await record.destroy();

  // mark email verified
  await user.update({
    is_email_verified: true,
  });

  return {
    flow: "LOGIN",
    token: generateToken(user),
  };
};


/* ================= MOBILE CHECK ================= */

exports.checkMobile = async (mobile) => {
  const user = await User.findOne({ where: { mobile } });

  if (!user) {
    return { flow: "SIGNUP" }; // email signup
  }

  await exports.sendMobileOTP(mobile);

  return {
    flow: "OTP",
    purpose: "LOGIN",
  };
};

/* ================= MOBILE LOGIN ================= */

exports.mobileLogin = async ({ mobile, password }) => {
  const user = await User.findOne({ where: { mobile } });
  if (!user) throw new Error("MOBILE_NOT_REGISTERED");

  // 📱 Mobile not verified → send OTP
  if (!user.is_mobile_verified) {
    await exports.sendMobileOTP(mobile);
    return {
      flow: "OTP",
      message: "OTP sent to mobile",
    };
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error("INVALID_PASSWORD");

  return {
    flow: "LOGIN",
    token: generateToken(user),
  };
};
/* ================= SEND MOBILE OTP ================= */

exports.sendMobileOTP = async (mobile) => {
  const user = await User.findOne({ where: { mobile } });
  if (!user) throw new Error("MOBILE_NOT_REGISTERED");

  const otp = generateOTP();

  // Remove old OTPs
  await OTP.destroy({
    where: {
      target: mobile,
      user_id: user.id,
      purpose: "MOBILE_VERIFY",
    },
  });

  // Save new OTP
  await OTP.create({
    user_id: user.id,
    target: mobile,
    otp,
    purpose: "MOBILE_VERIFY",
    expires_at: new Date(Date.now() + 10 * 60 * 1000),
  });

  // ✅ Send SMS using new signature
  await sendSMS(mobile, `Your verification OTP is ${otp}`);

  return { message: "OTP sent to mobile",otp};
};

/* ================= VERIFY MOBILE OTP ================= */

exports.verifyMobileOTP = async ({ mobile, otp }) => {
  const user = await User.findOne({ where: { mobile } });
  if (!user) throw new Error("USER_NOT_FOUND");

  const record = await OTP.findOne({
    where: {
      target: mobile,
      otp,
      purpose: "MOBILE_VERIFY",
      expires_at: { [Op.gt]: new Date() },
    },
  });

  if (!record) throw new Error("INVALID_OR_EXPIRED_OTP");

  await record.destroy();

  // ✅ mark mobile verified
  await user.update({
    is_mobile_verified: true,
  });

  return {
    flow: "LOGIN",
    token: generateToken(user),
  };
};




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

  if (!["PERSONAL", "SME"].includes(role)) {
    throw new Error("INVALID_ROLE");
  }

  validateSignupData(data);

  // 🔒 Check duplicate email
  const emailExists = await User.findOne({ where: { email } });
  if (emailExists) throw new Error("EMAIL_ALREADY_EXISTS");

  // 🔒 Check duplicate mobile
  const mobileExists = await User.findOne({ where: { mobile } });
  if (mobileExists) throw new Error("MOBILE_ALREADY_EXISTS");

  const hash = await bcrypt.hash(password, 10);

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

  // 📧📱 Send both OTPs
  await exports.sendEmailOTP(email);
  // await exports.sendMobileOTP(mobile);

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

  const payload = ticket.getPayload();
  const { email, name, email_verified } = payload;

  if (!email || !email_verified) {
    throw new Error("GOOGLE_EMAIL_NOT_VERIFIED");
  }

  let user = await User.findOne({ where: { email } });

  if (!user) {
    user = await User.create({
      email,
      full_name: name,
      is_email_verified: true,
      auth_provider: "GOOGLE",
      signup_stage: "EMAIL_VERIFIED",
    });

    return {
      flow: "SIGNUP",
      next: "MOBILE_OTP",
      userId: user.id,
    };
  }

  if (user.auth_provider && user.auth_provider !== "GOOGLE") {
    throw new Error("USE_EMAIL_PASSWORD_LOGIN");
  }

  if (user.signup_stage !== "COMPLETED") {
    return {
      flow: "SIGNUP_RESUME",
      next: "MOBILE_OTP",
      userId: user.id,
    };
  }

  const token = generateToken(user);

  return {
    flow: "LOGIN",
    token,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    },
  };
};




