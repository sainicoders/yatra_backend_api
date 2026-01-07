const { User, OTP } = require("../models");
const bcrypt = require("bcrypt");
const { generateOTP } = require("../utils/otp.util");
const { generateToken } = require("../utils/jwt.util");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);
/* EMAIL CHECK */
exports.checkEmail = async (email) => {
  const user = await User.findOne({ where: { email } });
  return user ? { flow: "LOGIN" } : { flow: "SIGNUP" };
};

/* EMAIL LOGIN */
exports.emailLogin = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("User not found");

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error("Invalid password");

  return generateToken(user);
};

/* SEND MOBILE OTP */
exports.sendMobileOTP = async (mobile) => {
  const otp = generateOTP();

  await OTP.create({
    target: mobile,
    otp,
    purpose: "LOGIN",
    expires_at: new Date(Date.now() + 15 * 60 * 1000),
  });

  console.log("📲 OTP:", otp);
};

/* VERIFY MOBILE OTP */
exports.verifyMobileOTP = async ({ mobile, otp }) => {
  const record = await OTP.findOne({
    where: { target: mobile, otp, verified: false },
  });

  if (!record || record.expires_at < new Date())
    throw new Error("Invalid OTP");

  record.verified = true;
  await record.save();

  let user = await User.findOne({ where: { mobile } });

  if (!user) {
    user = await User.create({ mobile, is_mobile_verified: true });
    return { next: "SIGNUP", userId: user.id };
  }

  return { token: generateToken(user) };
};

/* FINAL SIGNUP */
exports.completeSignup = async (data) => {
  if (!data.userId) {
    throw new Error("userId is required");
  }

  const user = await User.findByPk(data.userId);

  if (!user) {
    throw new Error("Invalid userId. User not found");
  }

  const hash = await bcrypt.hash(data.password, 10);

  await user.update({
    role: data.role,
    email: data.email,
    password: hash,
    full_name: data.full_name,
    gender: data.gender,

    gst_number: data.gst_number,
    company_name: data.company_name,
    company_address: data.company_address,
    city: data.city,
    state: data.state,
    pincode: data.pincode,

    promo_optin: data.promo_optin,
    whatsapp_optin: data.whatsapp_optin,

    is_email_verified: true,
  });

  return generateToken(user);
};


/* ================= GOOGLE LOGIN ================= */
exports.googleLogin = async (googleToken) => {
  if (!googleToken) {
    throw new Error("Google token required");
  }

  // 1️⃣ Verify token with Google
  const ticket = await googleClient.verifyIdToken({
    idToken: googleToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  const email = payload.email;
  const full_name = payload.name;

  if (!email) {
    throw new Error("Google account has no email");
  }

  // 2️⃣ Find or create user
  let user = await User.findOne({ where: { email } });

  if (!user) {
    user = await User.create({
      email,
      full_name,
      is_email_verified: true,
      role: "PERSONAL",
    });
  }

  // 3️⃣ Generate JWT (reuse existing util)
  const token = generateToken(user);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    },
  };
};

