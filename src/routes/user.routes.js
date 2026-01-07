const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const ctrl = require("../controllers/user.controller");

router.get("/me", auth, ctrl.getMe);

module.exports = router;
