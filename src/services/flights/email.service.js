const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT), // 🔥 IMPORTANT
  secure: true, // 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendTicketEmail = async ({ to, booking }) => {
  if (!booking.ticket_pdf) {
    throw new Error("Ticket PDF URL missing");
  }

  const ticketPath = path.join(
    __dirname,
    "../../public/tickets",
    path.basename(booking.ticket_pdf)
  );

  if (!fs.existsSync(ticketPath)) {
    throw new Error("Ticket PDF file not found on server");
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Your Flight Ticket | PNR ${booking.pnr}`,
    html: `
      <h2>Booking Confirmed </h2>
      <p><b>PNR:</b> ${booking.pnr}</p>
      <p><b>Status:</b> ${booking.booking_status}</p>
      <p><b>Amount Paid:</b> ₹${booking.total_amount}</p>
      <br/>
      <p>Your ticket is attached with this email.</p>
      <p>Have a safe journey </p>
    `,
    attachments: [
      {
        filename: `TICKET_${booking.pnr}.pdf`,
        path: ticketPath,
      },
    ],
  });
};
