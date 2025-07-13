const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    const data = await resend.emails.send({
      from: "onboarding@resend.dev", // 認証不要なテスト用ドメイン
      to,
      subject,
      html,
    });
    console.log("Email sent:", data);
  } catch (err) {
    console.error("Email send failed:", err);
  }
};

module.exports = sendEmail;
