// backend/routes/payment.js

// 必要なモジュールをインポート
const express = require("express");
const Stripe = require("stripe");
const dotenv = require("dotenv");

// .env ファイルから環境変数を読み込む
dotenv.config();

const router = express.Router();

// Stripe のインスタンスを初期化（秘密鍵を使用）
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 📦 Stripe Checkout セッションを作成する API エンドポイント
router.post("/create-checkout-session", async (req, res) => {
  const { items } = req.body; // フロントエンドから送信される購入商品の詳細

  try {
    // Stripe Checkout のセッションを新規作成
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"], // 支払い方法：クレジットカードのみ対応
      mode: "payment", // 一回限りの支払い（サブスクではない）
      line_items: items.map((item) => ({
        price_data: {
          currency: "jpy", // 通貨を日本円に指定
          product_data: {
            name: item.name, // Stripe Checkout に表示される商品名
          },
          unit_amount: item.price, // 金額（最小単位で指定：例 ¥100 → 100）
        },
        quantity: item.quantity, // 購入数量
      })),
      // 支払い成功後にリダイレクトされる URL
      success_url: `${process.env.FRONTEND_URL}/complete`,
      // 支払いキャンセル時にリダイレクトされる URL
      cancel_url: `${process.env.FRONTEND_URL}/cart`,
    });

    // セッション ID を返却（フロント側で Checkout ページへリダイレクトする際に使用）
    res.json({ id: session.id });
  } catch (error) {
    console.error("❌ Stripe Checkout セッション作成エラー:", error);
    // エラー発生時は 500 を返し、エラーメッセージと詳細情報を送信
    res.status(500).json({ error: error.message, raw: error });
  }
});

module.exports = router;
