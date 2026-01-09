const { User, OTP } = require("../models");
const bcrypt = require("bcrypt");
const { generateOTP } = require("../utils/otp.util");
const { generateToken } = require("../utils/jwt.util");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* ================= EMAIL CHECK ================= */
exports.checkEmail = async (email) => {
  const user = await User.findOne({ where: { email } });
  return user ? { flow: "LOGIN" } : { flow: "SIGNUP" };
};

/* ================= EMAIL LOGIN (PASSWORD) ================= */
exports.emailLogin = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("Email not registered");

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error("INVALID_PASSWORD");

  return generateToken(user);
};

/* ================= EMAIL OTP (LOGIN ONLY – FUTURE) ================= */
exports.sendEmailOTP = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("Email not registered");

  const otp = generateOTP();

  await OTP.create({
    target: email,
    otp,
    purpose: "LOGIN",
    expires_at: new Date(Date.now() + 15 * 60 * 1000),
  });

  console.log(" Email OTP:", otp);
};

exports.verifyEmailOTP = async ({ email, otp }) => {
  const record = await OTP.findOne({
    where: { target: email, otp, verified: false },
  });

  if (!record || record.expires_at < new Date()) {
    throw new Error("Invalid OTP");
  }

  record.verified = true;
  await record.save();

  const user = await User.findOne({ where: { email } });
  return { token: generateToken(user) };
};

/* ================= MOBILE OTP ================= */
exports.sendMobileOTP = async (mobile) => {
  const otp = generateOTP();

  await OTP.create({
    target: mobile,
    otp,
    purpose: "LOGIN",
    expires_at: new Date(Date.now() + 15 * 60 * 1000),
  });

  console.log("📲 Mobile OTP:", otp);
};

exports.verifyMobileOTP = async ({ mobile, otp }) => {
  const record = await OTP.findOne({
    where: {
      target: mobile,
      otp,
      verified: false,
    },
  });

  if (!record || record.expires_at < new Date()) {
    throw new Error("Invalid OTP");
  }

  // ✅ OTP can be used only once
  record.verified = true;
  await record.save();

  let user = await User.findOne({ where: { mobile } });

  // 🔹 FIRST TIME MOBILE USER → SIGNUP
  if (!user) {
    user = await User.create({
      mobile,
      is_mobile_verified: true,
    });

    return {
      next: "SIGNUP",
      userId: user.id,
    };
  }

  // 🔹 EXISTING USER → VERIFY & LOGIN
  if (!user.is_mobile_verified) {
    await user.update({ is_mobile_verified: true });
  }

  return {
    next: "LOGIN",
    token: generateToken(user),
  };
};


/* ================= FINAL SIGNUP ================= */
exports.completeSignup = async (data) => {
  let user;

  // MOBILE FLOW
  if (data.userId) {
    user = await User.findByPk(data.userId);
    if (!user) throw new Error("Invalid userId");
  }
  // EMAIL FLOW
  else {
    user = await User.create({
      email: data.email,
      is_email_verified: true,
    });
  }

  // ROLE VALIDATION
  if (!["PERSONAL", "SME"].includes(data.role)) {
    throw new Error("Invalid role");
  }

  if (data.role === "PERSONAL" && !data.full_name) {
    throw new Error("full_name required for PERSONAL");
  }

  if (
    data.role === "SME" &&
    (!data.company_name || !data.gst_number)
  ) {
    throw new Error("SME details required");
  }

  const hash = await bcrypt.hash(data.password, 10);

  await user.update({
    role: data.role,
    email: data.email,
    mobile: data.mobile,

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
  });

  return generateToken(user);
};




/* ================= GOOGLE LOGIN ================= */
exports.googleLogin = async (googleToken) => {
  if (!googleToken) throw new Error("Google token required");

  const ticket = await googleClient.verifyIdToken({
    idToken: googleToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const { email, name } = ticket.getPayload();
  if (!email) throw new Error("Google account has no email");

  let user = await User.findOne({ where: { email } });

  if (!user) {
    user = await User.create({
      email,
      full_name: name,
      is_email_verified: true,
      role: "PERSONAL",
    });
  }

  return {
    token: generateToken(user),
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    },
  };
};
