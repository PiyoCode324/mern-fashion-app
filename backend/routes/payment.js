// backend/routes/payment.js

// 必要なモジュールを読み込み
const express = require("express");
const Stripe = require("stripe");
const dotenv = require("dotenv");

// .env ファイルから環境変数を読み込む
dotenv.config();

const router = express.Router();

// Stripeの秘密鍵を使ってStripeインスタンスを作成
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 支払い用のチェックアウトセッションを作成するAPI
router.post("/create-checkout-session", async (req, res) => {
  const { items } = req.body; // フロントエンドから送られてくる購入商品の情報を取得

  try {
    // Stripeのチェックアウトセッションを作成
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"], // クレジットカード決済のみ対応
      mode: "payment", // 一回限りの支払いモード
      line_items: items.map((item) => ({
        price_data: {
          currency: "jpy", // 通貨は日本円
          product_data: {
            name: item.name, // 商品名をStripeに送る
          },
          unit_amount: item.price, // 価格（最小通貨単位で。1円=1なのでpriceのまま）
        },
        quantity: item.quantity, // 購入個数
      })),
      // 支払い成功時にリダイレクトされるURL（フロントの完了画面）
      success_url: "http://localhost:5173/complete",
      // 支払いキャンセル時にリダイレクトされるURL（カート画面など）
      cancel_url: "http://localhost:5173/cart",
    });

    // フロントエンドにセッションIDを返す（決済開始に必要）
    res.json({ id: session.id });
  } catch (error) {
    console.error("Stripe Session Error:", error);
    // エラー時は500エラーとわかりやすいメッセージを返す
    res.status(500).json({ error: "決済セッションの作成に失敗しました" });
  }
});

module.exports = router;
