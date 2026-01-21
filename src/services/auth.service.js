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
  const emailUser = await User.findOne({ where: { email } });

  // 🆕 first time email
  if (!emailUser) {
    const u = await User.create({
      email,
      signup_stage: "EMAIL_VERIFIED",
    });

    return {
      flow: "SIGNUP",
      userId: u.id,
      next: "BASIC_DETAILS",
    };
  }

  // 🔥 PASSWORD EXISTS → LOGIN
  if (emailUser.password) {
    return {
      flow: "LOGIN",
      methods: ["PASSWORD", "EMAIL_OTP"],
    };
  }

  /**
   * 🧠 IMPORTANT PART
   * Check if there is ANY completed mobile user
   * (email will be linked later)
   */
  const completedMobileUser = await User.findOne({
    where: {
      password: { [Op.ne]: null },
      signup_stage: "COMPLETED",
    },
  });

  if (completedMobileUser) {
    return {
      flow: "LOGIN",
      methods: ["PASSWORD", "EMAIL_OTP"],
    };
  }

  // otherwise resume signup
  return {
    flow: "SIGNUP_RESUME",
    userId: emailUser.id,
    next: "BASIC_DETAILS",
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

  // remove old OTP
  await OTP.destroy({
    where: {
      target: email,
      user_id: user.id,
      purpose: "EMAIL_LOGIN",
    },
  });

  // save new OTP
  await OTP.create({
    user_id: user.id,
    target: email,
    otp,
    purpose: "EMAIL_LOGIN",
    expires_at: new Date(Date.now() + 10 * 60 * 1000),
  });

  // send email (SendGrid Web API)
  await sendEmail({
    to: email,
    subject: "Your Login OTP",
    html: emailOTPTemplate(otp), 
  });

  return { message: "OTP sent to email" };
};



/* ================= VERIFY EMAIL OTP ================= */
exports.verifyEmailOTP = async ({ email, otp }) => {
  const emailUser = await User.findOne({ where: { email } });
  if (!emailUser) throw new Error("USER_NOT_FOUND");

  const record = await OTP.findOne({
    where: {
      user_id: emailUser.id,
      target: email,
      otp,
      purpose: "EMAIL_LOGIN",
      expires_at: { [Op.gt]: new Date() },
    },
  });

  if (!record) throw new Error("INVALID_OR_EXPIRED_OTP");

  await record.destroy();

  // ✅ CASE 1: Email user already completed
  if (emailUser.signup_stage === "COMPLETED") {
    return {
      flow: "LOGIN",
      token: generateToken(emailUser),
    };
  }

  // 🔥 CASE 2: Find completed MOBILE user
  const mobileUser = await User.findOne({
    where: {
      signup_stage: "COMPLETED",
      password: { [Op.ne]: null },
    },
  });

  if (mobileUser) {
    // 🔗 MERGE EMAIL INTO MOBILE USER
    await mobileUser.update({
      email: emailUser.email,
      is_email_verified: true,
    });

    // 🧹 REMOVE TEMP EMAIL USER
    await emailUser.destroy();

    return {
      flow: "LOGIN",
      token: generateToken(mobileUser),
    };
  }

  // ❌ CASE 3: Truly incomplete user
  return {
    flow: "SIGNUP_RESUME",
    userId: emailUser.id,
    next: "BASIC_DETAILS",
  };
};





/* ================= MOBILE OTP ================= */
exports.sendMobileOTP = async (mobile, userId = null) => {
  const otp = generateOTP();

  await OTP.destroy({
    where: {
      target: mobile,
      purpose: "MOBILE_AUTH",
    },
  });

  await OTP.create({
    user_id: userId,
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
      expires_at: { [Op.gt]: new Date() },
    },
  });

  if (!record) throw new Error("INVALID_OR_EXPIRED_OTP");

  await record.destroy();

  let user = await User.findOne({ where: { mobile } });

  // 🆕 First time mobile
  if (!user) {
    user = await User.create({
      mobile,
      is_mobile_verified: true,
      signup_stage: "MOBILE_VERIFIED",
    });

    return {
      flow: "SIGNUP",
      userId: user.id,
      next: "BASIC_DETAILS",
    };
  }

  // Existing user
  if (!user.is_mobile_verified) {
    await user.update({
      is_mobile_verified: true,
      signup_stage: "MOBILE_VERIFIED",
    });
  }

  if (user.signup_stage === "COMPLETED") {
    return {
      flow: "LOGIN",
      token: generateToken(user),
    };
  }

  return {
    flow: "SIGNUP_RESUME",
    userId: user.id,
    next: "BASIC_DETAILS",
  };
};




function validateSignupData(data) {
  if (!data.password) throw new Error("PASSWORD_REQUIRED");

  // ❌ MOBILE CHECK REMOVED

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
  let user = null;

  // 1️⃣ Trust userId first
  if (data.userId) {
    user = await User.findByPk(data.userId);
  }

  // 2️⃣ Fallback to email (email-first flow)
  if (!user && data.email) {
    user = await User.findOne({ where: { email: data.email } });
  }

  // 3️⃣ 🔥 SAFETY CREATE (VERY IMPORTANT)
  if (!user) {
    user = await User.create({
      email: data.email,
      signup_stage: "BASIC_CREATED",
    });
  }

  // 4️⃣ Validate role
  if (!["PERSONAL", "SME"].includes(data.role)) {
    throw new Error("INVALID_ROLE");
  }

  validateSignupData(data);

  // 5️⃣ Hash password
  const hash = await bcrypt.hash(data.password, 10);

  // 6️⃣ Update profile
  await user.update({
    password: hash,
    role: data.role,

    full_name: data.full_name,
    gender: data.gender,

    company_name: data.company_name,
    gst_number: data.gst_number,
    company_address: data.company_address,

    city: data.city,
    state: data.state,
    pincode: data.pincode,

    is_mobile_verified: true, // already verified in mobile-first
    signup_stage: "COMPLETED",
  });

  return {
    flow: "LOGIN",
    token: generateToken(user),
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




