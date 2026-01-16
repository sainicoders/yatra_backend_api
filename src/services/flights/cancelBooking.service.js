const { FlightBooking, FlightPassenger } = require("../../models/flights");
const redis = require("../../config/redis");
const {
  calculateCancellationCharges,
} = require("../../utils/cancellationCharges");

/**
 * ======================================================
 * 1️⃣ USER CANCEL PENDING BOOKING (NO PAYMENT DONE)
 * Status: PENDING → CANCELLED
 * ======================================================
 */
exports.cancelPendingBooking = async ({ bookingId, userId }) => {
  if (!bookingId || !userId) {
    throw new Error("bookingId and userId are required");
  }

  const booking = await FlightBooking.findByPk(bookingId);
  if (!booking) throw new Error("Invalid bookingId");

  if (booking.user_id !== userId) {
    throw new Error("Unauthorized booking access");
  }

  if (booking.booking_status !== "PENDING") {
    throw new Error("Only pending bookings can be cancelled");
  }

  booking.booking_status = "CANCELLED";
  booking.cancel_reason = "USER_CANCELLED";

  await booking.save();

  // release redis seat lock (safe even if expired)
  if (booking.lock_key) {
    await redis.del(booking.lock_key);
  }

  // cleanup passengers (optional but recommended)
  await FlightPassenger.destroy({
    where: { booking_id: booking.id },
  });

  return {
    bookingId: booking.id,
    status: booking.booking_status,
  };
};

/**
 * ======================================================
 * 2️⃣ USER REQUEST CANCEL (PAYMENT DONE)
 * Status: CONFIRMED → CANCEL_REQUESTED
 * ======================================================
 */
exports.requestConfirmedCancellation = async ({ bookingId, userId }) => {
  if (!bookingId || !userId) {
    throw new Error("bookingId and userId are required");
  }

  const booking = await FlightBooking.findByPk(bookingId);
  if (!booking) throw new Error("Invalid bookingId");

  if (booking.user_id !== userId) {
    throw new Error("Unauthorized access");
  }

  if (booking.booking_status !== "CONFIRMED") {
    throw new Error("Only confirmed bookings can be cancelled");
  }

  booking.booking_status = "CANCEL_REQUESTED";
  booking.cancel_requested_at = new Date();

  await booking.save();

  return {
    bookingId: booking.id,
    status: booking.booking_status,
  };
};

/**
 * ======================================================
 * 3️⃣ PROCESS REFUND (CRON / ADMIN / SYSTEM)
 * Status:
 * CANCEL_REQUESTED → REFUND_INITIATED → REFUNDED
 * ======================================================
 */
exports.processRefund = async (booking) => {
  if (!booking) return;

  // idempotency protection
  if (booking.booking_status !== "CANCEL_REQUESTED") {
    return;
  }

  const { refundAmount, chargeAmount, chargePercent } =
    calculateCancellationCharges({
      totalAmount: booking.total_amount,
      departureTime: booking.departure_time,
    });

  booking.cancellation_charge = chargeAmount;
  booking.refund_amount = refundAmount;
  booking.booking_status = "REFUND_INITIATED";

  await booking.save();

  /* ===========================
     PAYMENT GATEWAY REFUND CALL
     =========================== */
  // await paymentGateway.refund({
  //   txnId: booking.payment_txn_id,
  //   amount: refundAmount,
  // });

  booking.booking_status = "REFUNDED";
  booking.refunded_at = new Date();

  await booking.save();

  return {
    bookingId: booking.id,
    refundAmount,
    chargeAmount,
    chargePercent,
    status: booking.booking_status,
  };
};

