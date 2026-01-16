const {
  FlightBooking,
  Flight,
  FlightPassenger,
} = require("../../models/flights");

exports.getBookingDetailsById = async ({ bookingId, userId }) => {
    console.log(" bookingId, userId", bookingId, userId)
  const booking = await FlightBooking.findOne({
    where: { id: bookingId, user_id: userId },
    include: [
      {
        model: Flight,
        as: "flight",
      },
      {
        model: FlightPassenger,
        as: "passengers",
      },
    ],
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  return formatBookingResponse(booking);
};

exports.getBookingDetailsByPNR = async ({ pnr, userId }) => {
  const booking = await FlightBooking.findOne({
    where: { pnr, user_id: userId },
    include: [
      {
        model: Flight,
        as: "flight",
      },
      {
        model: FlightPassenger,
        as: "passengers",
      },
    ],
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  return formatBookingResponse(booking);
};

/* ================= FORMAT RESPONSE ================= */
const formatBookingResponse = (booking) => {
  return {
    bookingId: booking.id,
    pnr: booking.pnr,
    status: booking.booking_status,
    amount: booking.total_amount,
    passengers: booking.passengers.map((p) => ({
      name: p.full_name,
      age: p.age,
      gender: p.gender,
    })),
    flight: {
      airline: booking.flight.airline,
      from: booking.flight.from,
      to: booking.flight.to,
      departure_time: booking.flight.departure_time,
      arrival_time: booking.flight.arrival_time,
      duration_minutes: booking.flight.duration_minutes,
      stops: booking.flight.stops,
    },
    createdAt: booking.createdAt,
  };
};
