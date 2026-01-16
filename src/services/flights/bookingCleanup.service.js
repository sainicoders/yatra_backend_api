const { FlightBooking, FlightPassenger } = require("../../models/flights");
const redis = require("../../config/redis");

exports.cancelBooking = async (booking, reason = "AUTO_EXPIRED") => {
  if (booking.booking_status !== "PENDING") return;

  booking.booking_status = "CANCELLED";
  booking.cancel_reason = reason;

  await booking.save();

  // cleanup redis lock (safe even if expired)
  if (booking.lock_key) {
    await redis.del(booking.lock_key);
  }

  // optional: delete passengers
  await FlightPassenger.destroy({
    where: { booking_id: booking.id },
  });
};
