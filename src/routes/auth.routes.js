const router = require("express").Router();
const ctrl = require("../controllers/auth.controller");

router.post("/check-email", ctrl.checkEmail);
router.post("/email-login", ctrl.emailLogin);

router.post("/email/send-otp", ctrl.sendEmailOTP);
router.post("/email/verify-otp", ctrl.verifyEmailOTP);

router.post("/mobile/send-otp", ctrl.sendMobileOTP);
router.post("/mobile/verify-otp", ctrl.verifyMobileOTP);

router.post("/signup", ctrl.signup);

/* ================= GOOGLE ================= */
router.post("/google", ctrl.googleLogin);

module.exports = router;
