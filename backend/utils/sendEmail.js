// backend/utils/sendEmail.js

// Utility function for sending emails using the Resend email service.

const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * sendEmail function
 * Sends an email using the Resend API.
 * @param {Object} param0 - Object containing email details.
 * @param {string} param0.to - Recipient email address (multiple addresses separated by commas are allowed).
 * @param {string} param0.subject - Subject line of the email.
 * @param {string} param0.html - HTML content of the email body.
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    // Send email using resend.emails.send()
    const data = await resend.emails.send({
      from: "onboarding@resend.dev", // Sender email address (example address)
      to,
      subject,
      html,
    });
    console.log("✅ Email sent:", data);
  } catch (err) {
    // Log any errors that occur while attempting to send the email
    console.error("❌ Failed to send email:", err);
  }
};

module.exports = sendEmail;
