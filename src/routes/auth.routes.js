const router = require("express").Router();
const ctrl = require("../controllers/auth.controller");


router.post("/check-email", ctrl.checkEmail);
router.post("/email-login", ctrl.emailLogin);

router.post("/mobile/send-otp", ctrl.sendMobileOTP);
router.post("/mobile/verify-otp", ctrl.verifyMobileOTP);
router.post("/google", ctrl.googleLogin);
router.post("/signup", ctrl.signup);

module.exports = router;
