// utils/sendEmail.js

// Resendというメール送信サービスを使ったメール送信ユーティリティ関数です。

const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * sendEmail関数
 * メールを送信します。
 * @param {Object} param0 - 送信先、件名、HTML本文を含むオブジェクト
 * @param {string} param0.to - 送信先メールアドレス（カンマ区切りの複数も可）
 * @param {string} param0.subject - メールの件名
 * @param {string} param0.html - メール本文（HTML形式）
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    // resend.emails.send()でメール送信を実行
    const data = await resend.emails.send({
      from: "onboarding@resend.dev", // テスト用の送信元メールアドレス
      to,
      subject,
      html,
    });
    console.log("✅ Email sent:", data);
  } catch (err) {
    // 送信失敗時はエラーをログに出す（アプリの動作は続行）
    console.error("❌ Email send failed:", err);
  }
};

module.exports = sendEmail;
