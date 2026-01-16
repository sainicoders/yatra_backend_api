const nodemailer = require("nodemailer");
const path = require("path");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

exports.sendTicketEmail = async ({ to, booking }) => {
  const ticketPath = path.join(
    __dirname,
    "../../public/tickets",
    path.basename(booking.ticket_pdf_url)
  );

  await transporter.sendMail({
    from: `"Yatra Flights " <${process.env.SMTP_USER}>`,
    to,
    subject: ` Your Flight Ticket | PNR ${booking.pnr}`,
    html: `
      <h2>Booking Confirmed ✅</h2>
      <p><b>PNR:</b> ${booking.pnr}</p>
      <p><b>Status:</b> ${booking.booking_status}</p>
      <p><b>Amount Paid:</b> ₹${booking.total_amount}</p>
      <br/>
      <p>Your ticket is attached with this email.</p>
      <p>Have a safe journey ✨</p>
    `,
    attachments: [
      {
        filename: `TICKET_${booking.pnr}.pdf`,
        path: ticketPath,
      },
    ],
  });
};
