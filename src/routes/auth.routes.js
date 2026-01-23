const router = require("express").Router();
const ctrl = require("../controllers/auth.controller");

/* ================= EMAIL ================= */
router.post("/check-email", ctrl.checkEmail);
router.post("/email-login", ctrl.emailLogin);
router.post("/email/send-otp", ctrl.sendEmailOTP);
router.post("/email/verify-otp", ctrl.verifyEmailOTP);
/* ================= EMAIL OTP LOGIN ================= */
router.post("/email/login/send-otp", ctrl.sendEmailLoginOTP);
router.post("/email/login/verify-otp", ctrl.verifyEmailLoginOTP);
/* ================= MOBILE ================= */
router.post("/check-mobile", ctrl.checkMobile);
router.post("/mobile-login", ctrl.mobileLogin);
router.post("/mobile/send-otp", ctrl.sendMobileOTP);
router.post("/mobile/verify-otp", ctrl.verifyMobileOTP);
/* ================= MOBILE OTP LOGIN ================= */
router.post("/mobile/login/send-otp", ctrl.sendMobileLoginOTP);
router.post("/mobile/login/verify-otp", ctrl.verifyMobileLoginOTP);

/* ================= SIGNUP ================= */
router.post("/signup", ctrl.signup);

/* ================= GOOGLE ================= */

router.post("/google", ctrl.googleLogin);

module.exports = router;

