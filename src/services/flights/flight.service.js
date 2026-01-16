const {
  FlightBooking,
  Flight,
  FlightPassenger,
} = require("../../models/flights");
const { generateTicketPDF } = require("../../services/flights/ticketPdf.service");

const { sendTicketEmail } = require("../../services/flights/email.service");
const crypto = require("crypto");
const flightProvider = require("../../providers");
const redis = require("../../config/redis");
const { User } = require("../../models");
const LOCK_TTL = 15 * 60; // 15 minutes

/* ================= SEARCH FLIGHTS ================= */
exports.searchFlights = async (payload = {}) => {
  const { from, to, date, passengers = 1 } = payload;

  if (!from || !to || !date) {
    throw new Error("from, to and date are required");
  }

  const flights = await flightProvider.searchFlights({
    from,
    to,
    date,
    passengers,
  });

  return flights.filter((f) => f.seatsAvailable >= passengers);
};

/* ================= INIT BOOKING (SEAT LOCK) ================= */
exports.initBooking = async (payload = {}) => {
  const { flightId, passengers = 1, userId, price } = payload;

  if (!flightId || !userId || !price) {
    throw new Error("flightId, userId and price are required");
  }

  if (!Number.isInteger(passengers) || passengers <= 0) {
    throw new Error("Invalid passengers count");
  }

  /* ================= REDIS SEAT LOCK (FLIGHT + USER) ================= */
  const lockKey = `seat_lock:${flightId}:${userId}`;

  const locked = await redis.set(
    lockKey,
    JSON.stringify({ userId, passengers }),
    { nx: true, ex: LOCK_TTL }
  );

  if (!locked) {
    throw new Error("Seats already locked for this flight");
  }

  try {
    /* ================= ENSURE FLIGHT EXISTS ================= */
    let flight = await Flight.findOne({
      where: { provider_flight_id: flightId },
    });

    if (!flight) {
      flight = await Flight.create({
        provider_flight_id: flightId,
        airline: "MOCK",
        from: "DEL",
        to: "BOM",
        base_price: price,
      });
    }

    /* ================= CHECK EXISTING PENDING ================= */
    const existing = await FlightBooking.findOne({
      where: {
        user_id: userId,
        flight_id: flight.id,
        booking_status: "PENDING",
      },
    });

    if (existing){
      /* 🔧 AUTO-FIX PASSENGER COUNT */
      if (existing.expected_passengers !== passengers) {
        existing.expected_passengers = passengers;
        existing.seat_count = passengers;
        existing.price_per_seat = price;
        existing.total_amount = price * passengers;
        await existing.save();
      }

      return {
        bookingId: existing.id,
        status: existing.booking_status,
        seatLockedFor: `${LOCK_TTL / 60} minutes`,
      };
    }

    /* ================= CREATE BOOKING ================= */
    const booking = await FlightBooking.create({
      user_id: userId,
      flight_id: flight.id,
      expected_passengers: passengers,
      seat_count: passengers,
      price_per_seat: price,
      total_amount: price * passengers,
      booking_status: "PENDING",
    });

    return {
      bookingId: booking.id,
      status: booking.booking_status,
      seatLockedFor: `${LOCK_TTL / 60} minutes`,
    };
  } catch (err) {
    await redis.del(lockKey);
    throw err;
  }
};


/* ================= ADD PASSENGERS ================= */
exports.addPassengers = async ({ bookingId, passengers = [] }) => {
  if (!bookingId) {
    throw new Error("bookingId is required");
  }

  if (!Array.isArray(passengers) || passengers.length === 0) {
    throw new Error("At least one passenger is required");
  }

  const booking = await FlightBooking.findByPk(bookingId);
  if (!booking) {
    throw new Error("Invalid bookingId");
  }

  if (booking.booking_status !== "PENDING") {
    throw new Error("Passengers can be added only for PENDING bookings");
  }

  /* ================= PASSENGER COUNT ================= */
  const expectedCount = Number(
    booking.expected_passengers ?? booking.seat_count
  );

  if (!expectedCount || expectedCount <= 0) {
    throw new Error("Invalid booking passenger count");
  }

  if (passengers.length !== expectedCount) {
    throw new Error(
      `Passenger count mismatch. Expected ${expectedCount}, got ${passengers.length}`
    );
  }

  /* ================= GENDER NORMALIZER ================= */
  const normalizeGender = (gender) => {
    if (!gender) return null;
    const g = gender.toUpperCase();
    if (g === "MALE" || g === "M") return "M";
    if (g === "FEMALE" || g === "F") return "F";
    if (g === "OTHER" || g === "O") return "O";
    return null;
  };

  /* ================= VALIDATION ================= */
  passengers.forEach((p, index) => {
    if (!p.fullName || !p.age || !p.gender) {
      throw new Error(`Passenger data incomplete at index ${index}`);
    }

    p.gender = normalizeGender(p.gender);

    if (!p.gender) {
      throw new Error(`Invalid gender for passenger ${p.fullName}`);
    }

    if (p.age <= 0 || p.age > 120) {
      throw new Error(`Invalid age for passenger ${p.fullName}`);
    }
  });

  /* ================= SAFE RE-SUBMIT ================= */
  await FlightPassenger.destroy({
    where: { booking_id: bookingId },
  });

  const rows = passengers.map((p) => ({
    booking_id: bookingId,
    full_name: p.fullName.trim(),
    age: p.age,
    gender: p.gender,
  }));

  await FlightPassenger.bulkCreate(rows);

  return {
    bookingId,
    passengerCount: passengers.length,
    status: booking.booking_status,
  };
};



/* ================= INIT EASEBUZZ PAYMENT ================= */
exports.initEasebuzzPayment = async ({ bookingId, user }) => {
  const booking = await FlightBooking.findByPk(bookingId);
  if (!booking) throw new Error("Invalid bookingId");

  if (booking.booking_status !== "PENDING") {
    throw new Error("Booking already processed");
  }

  const passengerCount = await FlightPassenger.count({
    where: { booking_id: bookingId },
  });

  if (passengerCount === 0) {
    throw new Error("No passengers added");
  }

  const txnId = `TXN_${booking.id}`;
  const amount = booking.total_amount;

  // 🔥 FIX (MANDATORY)
  await redis.set(
    `easebuzz:${txnId}`,
    booking.id,
    { ex: 3600 }
  );

  const hashString =
    `${process.env.EASEBUZZ_KEY}|${txnId}|${amount}|Flight Booking|` +
    `${user.name}|${user.email}|||||||||||${process.env.EASEBUZZ_SALT}`;

  const hash = crypto
    .createHash("sha512")
    .update(hashString)
    .digest("hex");

  return {
    easebuzzUrl: process.env.EASEBUZZ_BASE_URL,
    payload: {
      key: process.env.EASEBUZZ_KEY,
      txnid: txnId,
      amount,
      productinfo: "Flight Booking",
      firstname: user.name,
      email: user.email,
      phone: user.mobile || "9999999999",
      surl: process.env.EASEBUZZ_SUCCESS_URL,
      furl: process.env.EASEBUZZ_FAILURE_URL,
      hash,
    },
  };
};

/* ================= PAYMENT SUCCESS CALLBACK ================= */
exports.handleEasebuzzSuccess = async (payload) => {
  const { txnid, status } = payload;

  if (status !== "success") {
    throw new Error("Payment failed");
  }

  const bookingId = await redis.get(`easebuzz:${txnid}`);

  if (!bookingId) {
    throw new Error("Invalid booking id in transaction");
  }

  await redis.set(
    `payment:TXN_${bookingId}`,
    "SUCCESS",
    { ex: 3600 }
  );

  return bookingId;
};



/* ================= CONFIRM BOOKING ================= */


exports.confirmBooking = async (bookingId) => {
  const booking = await FlightBooking.findByPk(bookingId, {
    include: [
      { model: User, as: "user" },
      { model: Flight, as: "flight" },
      { model: FlightPassenger, as: "passengers" },
    ],
  });

  if (!booking) throw new Error("Invalid bookingId");

  /* payment verification */
  const paid = await redis.get(`payment:TXN_${booking.id}`);
  if (!paid) throw new Error("Payment not verified");

  // ✅ FIRST set status + PNR
  booking.booking_status = "CONFIRMED";
  booking.pnr =
    "YAT" + Math.random().toString(36).substring(2, 8).toUpperCase();

  await booking.save(); // 🔥 VERY IMPORTANT

  // ✅ NOW generate PDF
  const pdf = await generateTicketPDF(booking);

  await booking.update({
    ticket_pdf: pdf.pdfUrl,
  });

  /* Send Email */
  if (booking.user?.email) {
    await sendTicketEmail({
      to: booking.user.email,
      booking,
      ticket: pdf,
    });
  }

  /* release seat lock */
  if (booking.lock_key) {
    await redis.del(booking.lock_key);
  }

  return {
    bookingId: booking.id,
    pnr: booking.pnr,
    status: booking.booking_status,
    ticket: pdf,
  };
};




