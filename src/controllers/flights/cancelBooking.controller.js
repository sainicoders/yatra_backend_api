const {
  cancelPendingBooking,
  requestConfirmedCancellation,
} = require("../../services/flights/cancelBooking.service");

/**
 * ======================================================
 * CANCEL PENDING BOOKING (NO PAYMENT)
 * Status: PENDING → CANCELLED
 * ======================================================
 */
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const result = await cancelPendingBooking({
      bookingId,
      userId: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * ======================================================
 * CANCEL CONFIRMED BOOKING (REFUND FLOW)
 * Status: CONFIRMED → CANCEL_REQUESTED
 * ======================================================
 */
exports.cancelConfirmedBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const result = await requestConfirmedCancellation({
      bookingId,
      userId: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: "Cancellation request submitted successfully",
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
exports.processRefund = async (bookingId) => {
  const booking = await FlightBooking.findByPk(bookingId);
  if (!booking) throw new Error("Invalid bookingId");

  if (booking.booking_status !== "CANCEL_REQUESTED") {
    throw new Error("Booking not eligible for refund");
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

  /* PAYMENT GATEWAY REFUND CALL HERE */

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
