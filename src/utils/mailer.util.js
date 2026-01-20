const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendEmail = async ({ to, subject, html }) => {
  try {
    await sgMail.send({
      to,
      from: process.env.EMAIL_FROM,
      subject,
      html,
    });
  } catch (error) {
    console.error(
      "SENDGRID ERROR:",
      error.response?.body || error.message
    );
    throw new Error("EMAIL_SEND_FAILED");
  }
};
