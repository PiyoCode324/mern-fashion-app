// backend/routes/payment.js
const express = require("express");
const Stripe = require("stripe");
const dotenv = require("dotenv");

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// POST /payment/create-checkout-session
router.post("/create-checkout-session", async (req, res) => {
  const { items } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: items.map((item) => ({
        price_data: {
          currency: "jpy",
          product_data: {
            name: item.name,
          },
          unit_amount: item.price * 100, // 金額は「円 → 銭」に変換
        },
        quantity: item.quantity,
      })),
      success_url: "http://localhost:5173/complete",
      cancel_url: "http://localhost:5173/cart",
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Stripe Session Error:", error);
    res.status(500).json({ error: "決済セッションの作成に失敗しました" });
  }
});

module.exports = router;
