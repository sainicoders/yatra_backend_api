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

  if (user) {
    return {
      flow: "LOGIN",
      methods: ["PASSWORD", "EMAIL_OTP"],
    };
  }

  return {
    flow: "SIGNUP",
    next: "MOBILE_OTP",
  };
};



/* ================= EMAIL LOGIN (PASSWORD) ================= */
exports.emailLogin = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("EMAIL_NOT_REGISTERED");

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error("INVALID_PASSWORD");

  return { token: generateToken(user) };
};



/* ================= EMAIL OTP (LOGIN ONLY – FUTURE) ================= */
exports.sendEmailOTP = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("EMAIL_NOT_REGISTERED");

  const otp = generateOTP();

  await OTP.destroy({
    where: { target: email,  user_id: user.id, purpose: "EMAIL_LOGIN" },
  });
  

  await OTP.create({
    user_id: user.id,
    target: email,
    otp,
    purpose: "EMAIL_LOGIN",
    expires_at: new Date(Date.now() + 10 * 60 * 1000),
  });

  await sendEmail({
    to: email,
    subject: "Your Login OTP",
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
      user_id: user.id,
      target: email,
      otp,
      purpose: "EMAIL_LOGIN",
      expires_at: { [Op.gt]: new Date() },
      verified: false,
    },
  });

  if (!record || record.expires_at < new Date()) {
    throw new Error("INVALID_OR_EXPIRED_OTP");
  }

  await record.destroy();

  return { token: generateToken(user) };
};




/* ================= MOBILE OTP ================= */
exports.sendMobileOTP = async (mobile) => {
  const otp = generateOTP();

  await OTP.destroy({
    where: { target: mobile, purpose: "MOBILE_AUTH" },
  });

  await OTP.create({
    target: mobile,
    otp,
    purpose: "MOBILE_AUTH",
    expires_at: new Date(Date.now() + 10 * 60 * 1000),
  });

  await sendSMS(mobile, `Your OTP is ${otp}`);

  return { message: "OTP sent to mobile" };
};

exports.verifyMobileOTP = async ({ mobile, otp }) => {
  const record = await OTP.findOne({
    where: {
      target: mobile,
      otp,
      purpose: "MOBILE_AUTH",
      verified: false,
    },
  });

  if (!record || record.expires_at < new Date()) {
    throw new Error("INVALID_OR_EXPIRED_OTP");
  }

  
  await record.destroy();

  let user = await User.findOne({ where: { mobile } });

  // 🆕 NOT REGISTERED → SIGNUP
  if (!user) {
    user = await User.create({
      mobile,
      is_mobile_verified: true,
    });

    return {
      flow: "SIGNUP",
      userId: user.id,
    };
  }

  // ✅ REGISTERED → LOGIN
  if (!user.is_mobile_verified) {
    await user.update({ is_mobile_verified: true });
  }

  return {
    flow: "LOGIN",
    token: generateToken(user),
  };
};

exports.completeSignup = async (data) => {
  const user = await User.findByPk(data.userId);
  if (!user) throw new Error("INVALID_USER");

  if (!["PERSONAL", "SME"].includes(data.role)) {
    throw new Error("INVALID_ROLE");
  }

  if (data.role === "PERSONAL" && !data.full_name) {
    throw new Error("FULL_NAME_REQUIRED");
  }

  if (
    data.role === "SME" &&
    (!data.company_name || !data.gst_number)
  ) {
    throw new Error("SME_DETAILS_REQUIRED");
  }

  const hash = await bcrypt.hash(data.password, 10);

  await user.update({
    email: data.email,
    role: data.role,
    password: hash,

    full_name: data.full_name,
    gender: data.gender,

    company_name: data.company_name,
    gst_number: data.gst_number,
    company_address: data.company_address,

    city: data.city,
    state: data.state,
    pincode: data.pincode,

    promo_optin: data.promo_optin,
    whatsapp_optin: data.whatsapp_optin,
  });

  return { token: generateToken(user) };
};





/* ================= GOOGLE LOGIN ================= */
exports.googleLogin = async (googleToken) => {
  if (!googleToken) {
    throw new Error("GOOGLE_TOKEN_REQUIRED");
  }

  // 1️⃣ Verify Google ID token
  const ticket = await googleClient.verifyIdToken({
    idToken: googleToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { email, name, email_verified } = payload;

  if (!email || !email_verified) {
    throw new Error("GOOGLE_EMAIL_NOT_VERIFIED");
  }

  // 2️⃣ Find or create user
  let user = await User.findOne({ where: { email } });

  if (!user) {
    user = await User.create({
      email,
      full_name: name,
      is_email_verified: true,
      role: "PERSONAL",
      auth_provider: "GOOGLE", // ✅ optional but recommended
    });
  }

  // 3️⃣ Issue JWT
  const token = generateToken(user);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    },
  };
};