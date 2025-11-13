// backend/utils/sendEmail.js

// Resend という外部メール送信サービスを使ってメールを送信するためのユーティリティ関数。
// サーバーからユーザーへの通知メールや確認メールを送信する用途で利用される。

const { Resend } = require("resend"); // Resendライブラリをインポート
const resend = new Resend(process.env.RESEND_API_KEY);
// 環境変数から APIキーを読み込み、Resendクライアントを初期化

/**
 * sendEmail 関数
 * Resend API を利用してメールを送信する。
 *
 * @param {Object} param0 - メール送信に必要な情報をまとめたオブジェクト
 * @param {string} param0.to - 受信者のメールアドレス（カンマ区切りで複数指定も可能）
 * @param {string} param0.subject - メールの件名
 * @param {string} param0.html - メール本文のHTMLコンテンツ
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    // resend.emails.send() を使ってメールを送信
    const data = await resend.emails.send({
      from: "onboarding@resend.dev", // 差出人のメールアドレス（ここでは例として固定値を使用）
      to, // 宛先
      subject, // 件名
      html, // HTML本文
    });
    console.log("✅ Email sent:", data); // 成功した場合のログ出力
  } catch (err) {
    // 送信に失敗した場合のエラーログ
    console.error("❌ Failed to send email:", err);
  }
};

module.exports = sendEmail; // 他のファイルから利用できるようにエクスポート
