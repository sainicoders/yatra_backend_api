const cron = require("node-cron");
const { Op } = require("sequelize");
const  FlightBooking  = require("../models/flights/flightBooking.model");
const { cancelBooking } = require("../services/flights/bookingCleanup.service");

const EXPIRY_MINUTES = 15;

/* ================= BOOKING EXPIRY CRON ================= */
cron.schedule("*/5 * * * *", async () => {
  console.log(" Running booking expiry cron...");

  try {
    const expiryTime = new Date(
      Date.now() - EXPIRY_MINUTES * 60 * 1000
    );

    const expiredBookings = await FlightBooking.findAll({
      where: {
        booking_status: "PENDING",
        createdAt: {
          [Op.lt]: expiryTime,
        },
      },
    });

    for (const booking of expiredBookings) {
      await cancelBooking(booking, "AUTO_EXPIRED");
      console.log(` Booking ${booking.id} cancelled`);
    }

    console.log(` Expired bookings processed: ${expiredBookings.length}`);
  } catch (err) {
    console.error("CRON ERROR:", err.message);
  }
});
