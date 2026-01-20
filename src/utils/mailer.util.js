
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT), // 🔥 IMPORTANT
  // secure: false,
  secure: true, // true only for 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Optional but recommended (debug once)
transporter.verify((err) => {
  if (err) {
    console.error("SMTP ERROR ", err.message);
  } else {
    console.log("SMTP READY ");
  }
});

exports.sendEmail = async ({ to, subject, html }) => {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};
