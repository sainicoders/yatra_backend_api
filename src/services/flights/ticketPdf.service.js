// src/services/flights/ticketPdf.service.js
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");

exports.generateTicketPDF = async (booking) => {
  /* ===== SAFETY GUARDS ===== */
  if (!booking) throw new Error("Booking object missing");
  if (!booking.pnr) throw new Error("PNR missing for ticket PDF");
  if (!booking.flight) throw new Error("Flight details missing");
  if (!Array.isArray(booking.passengers))
    throw new Error("Passenger list missing");

  const ticketDir = path.join(__dirname, "../../public/tickets");

  if (!fs.existsSync(ticketDir)) {
    fs.mkdirSync(ticketDir, { recursive: true });
  }

  const fileName = `TICKET_${booking.pnr}.pdf`;
  const filePath = path.join(ticketDir, fileName);

  const doc = new PDFDocument({ margin: 40 });
  doc.pipe(fs.createWriteStream(filePath));

  /* ===== HEADER ===== */
  doc
    .fontSize(20)
    .text("✈️ YATRA FLIGHT TICKET", { align: "center" })
    .moveDown(0.5);

  doc
    .fontSize(12)
    .text(`PNR: ${booking.pnr}`, { align: "center" })
    .moveDown(1);

  /* ===== FLIGHT INFO ===== */
  doc.fontSize(14).text("Flight Details", { underline: true });
  doc.moveDown(0.5);

  doc.fontSize(11);
  doc.text(`Airline: ${booking.flight.airline}`);
  doc.text(`From: ${booking.flight.from} → To: ${booking.flight.to}`);
  doc.text(`Departure: ${booking.flight.departure_time || "N/A"}`);
  doc.text(`Arrival: ${booking.flight.arrival_time || "N/A"}`);
  doc.moveDown(1);

  /* ===== PASSENGERS ===== */
  doc.fontSize(14).text("Passengers", { underline: true });
  doc.moveDown(0.5);

  booking.passengers.forEach((p, i) => {
    doc
      .fontSize(11)
      .text(
        `${i + 1}. ${p.full_name} | Age: ${p.age || "N/A"} | Gender: ${p.gender || "N/A"}`
      );
  });

  doc.moveDown(1);

  /* ===== PAYMENT ===== */
  doc.fontSize(14).text("Payment Summary", { underline: true });
  doc.moveDown(0.5);

  doc.fontSize(11);
  doc.text(`Total Amount: ₹${booking.total_amount}`);
  doc.text(`Status: ${booking.booking_status}`);
  doc.moveDown(1);

  /* ===== QR CODE (NO DISK WRITE) ===== */
  const qrData = `PNR:${booking.pnr}|BOOKING:${booking.id}`;
  const qrImage = await QRCode.toDataURL(qrData);

  doc.image(qrImage, {
    fit: [120, 120],
    align: "center",
  });

  doc.moveDown(0.5);
  doc.fontSize(9).text("Scan QR at airport check-in", { align: "center" });

  /* ===== FOOTER ===== */
  doc.moveDown(1);
  doc
    .fontSize(8)
    .text(
      "This is a system generated ticket. Please carry valid ID proof.",
      { align: "center" }
    );

  doc.end();

  return {
    pdfUrl: `/public/tickets/${fileName}`,
    filePath,
  };
};
