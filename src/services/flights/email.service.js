const sgMail = require("@sendgrid/mail");
const path = require("path");
const fs = require("fs");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

  // 🔥 PDF → base64 (SendGrid requirement)
  const pdfBuffer = fs.readFileSync(ticketPath);
  const pdfBase64 = pdfBuffer.toString("base64");

  try {
    await sgMail.send({
      to,
      from: process.env.EMAIL_FROM,
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
          content: pdfBase64,
          filename: `TICKET_${booking.pnr}.pdf`,
          type: "application/pdf",
          disposition: "attachment",
        },
      ],
    });
  } catch (err) {
    console.error(
      "SENDGRID TICKET EMAIL ERROR:",
      err.response?.body || err.message
    );
    throw new Error("TICKET_EMAIL_FAILED");
  }
};
