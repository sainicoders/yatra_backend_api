const router = require("express").Router();

const ctrl = require("../../controllers/flights/flight.controller");
const cancelCtrl = require("../../controllers/flights/cancelBooking.controller");
const bookingDetailsCtrl = require(
  "../../controllers/flights/bookingDetails.controller"
);

const auth = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");

/* ================= FLIGHT SEARCH ================= */
router.post("/search", ctrl.search);

/* ================= BOOKING INIT ================= */
router.post(
  "/booking/init",
  auth,
  role(["PERSONAL", "SME"]),
  ctrl.initBooking
);

/* ================= ADD PASSENGERS ================= */
router.post(
  "/booking/passengers",
  auth,
  role(["PERSONAL", "SME"]),
  ctrl.addPassengers
);

/* ================= PAYMENT INIT ================= */
router.post(
  "/payment/init",
  auth,
  role(["PERSONAL", "SME"]),
  ctrl.initPayment
);

/* ================= EASEBUZZ CALLBACKS ================= */
router.post("/payment/success", ctrl.paymentSuccess);
router.post("/payment/failure", ctrl.paymentFailure);

/* ======================================================
   USER SIDE CANCELLATION
   ====================================================== */

/**
 * PENDING → CANCELLED (no payment)
 */
router.post(
  "/booking/cancel",
  auth,
  role(["PERSONAL", "SME"]),
  cancelCtrl.cancelBooking
);

/**
 * CONFIRMED → CANCEL_REQUESTED (refund flow)
 */
router.post(
  "/booking/cancel/confirmed",
  auth,
  role(["PERSONAL", "SME"]),
  cancelCtrl.cancelConfirmedBooking
);

/* ======================================================
   ADMIN / SYSTEM SIDE REFUND
   ====================================================== */

/**
 * CANCEL_REQUESTED → REFUNDED
 */
router.post(
  "/booking/refund/proceed",
  auth,
  role(["ADMIN"]),
  cancelCtrl.processRefund 
);
//  details Api
router.get(
  "/booking/:bookingId",
  auth,
  role(["PERSONAL", "SME"]),
  bookingDetailsCtrl.getBookingById
);

router.get(
  "/pnr/:pnr",
  auth,
  role(["PERSONAL", "SME"]),
  bookingDetailsCtrl.getBookingByPNR
);
module.exports = router;
