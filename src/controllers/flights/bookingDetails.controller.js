const bookingService = require("../../services/flights/bookingDetails.service");

/* ================= BY BOOKING ID ================= */
exports.getBookingById = async (req, res) => {
  try {
    const data = await bookingService.getBookingDetailsById({
      bookingId: req.params.bookingId,
      userId: req.user.id,
    });

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};

/* ================= BY PNR ================= */
exports.getBookingByPNR = async (req, res) => {
  try {
    const data = await bookingService.getBookingDetailsByPNR({
      pnr: req.params.pnr,
      userId: req.user.id,
    });

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};
