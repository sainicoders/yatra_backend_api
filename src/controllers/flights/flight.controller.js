const flightService = require("../../services/flights/flight.service");

/* ================= SEARCH FLIGHTS ================= */
exports.search = async (req, res) => {
  try {
    const flights = await flightService.searchFlights(req.body);

    res.status(200).json({
      success: true,
      count: flights.length,
      data: flights,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/* ================= INIT BOOKING ================= */
exports.initBooking = async (req, res) => {
  try {
    const { flightId, passengers = 1, price } = req.body;

    if (!flightId || !price) {
      return res.status(400).json({
        success: false,
        message: "flightId and price are required",
      });
    }
console.log("INIT TOKEN:", req.headers.authorization);
console.log("INIT userId:", req.user.id);
    

    const booking = await flightService.initBooking({
      flightId,
      passengers,
      price,
      userId: req.user.id, // ✅ ONLY from JWT
    });
console.log(
  "flightId, passengers, price, userId",
  flightId,
  passengers,
  price,
  req.user.id   // ✅ correct
);

    res.status(201).json({
      success: true,
      message: "Seats locked for 15 minutes",
      data: booking,
    });
  } catch (err) {
    console.error("INIT BOOKING ERROR:", err.message);

    res.status(409).json({
      success: false,
      message: err.message,
    });
  }
};


/* ================= ADD PASSENGERS ================= */
exports.addPassengers = async (req, res) => {
  try {
    const { bookingId, passengers } = req.body;

    const result = await flightService.addPassengers({
      bookingId,
      passengers,
    });

    res.status(201).json({
      success: true,
      message: "Passengers added successfully",
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/* ================= INIT PAYMENT ================= */
exports.initPayment = async (req, res) => {
  try {
    const payment = await flightService.initEasebuzzPayment({
      bookingId: req.body.bookingId,
      user: req.user,
    });

    res.status(200).json({
      success: true,
      message: "Easebuzz payment initiated",
      data: payment,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/* ================= PAYMENT SUCCESS CALLBACK ================= */
exports.paymentSuccess = async (req, res) => {
  try {
    // ✅ returns bookingId
    const bookingId = await flightService.handleEasebuzzSuccess(req.body);

    const booking = await flightService.confirmBooking(bookingId);

    return res.status(200).json({
      success: true,
      message: "Payment successful, booking confirmed",
      data: booking,
    });
  } catch (err) {
    console.error("PAYMENT SUCCESS ERROR:", err.message);

    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};


/* ================= PAYMENT FAILURE CALLBACK ================= */
exports.paymentFailure = async (req, res) => {
  res.status(400).json({
    success: false,
    message: "Payment failed",
  });
};
