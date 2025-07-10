// backend/routes/payment.js

// Load the required modules
const express = require("express");
const Stripe = require("stripe");
const dotenv = require("dotenv");

// Read environment variables from .env file
dotenv.config();

const router = express.Router();

// Create a Stripe instance using your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Endpoint for creating a payment session
// Creates a Stripe session using product information sent from the frontend
router.post("/create-checkout-session", async (req, res) => {
  const { items } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"], // Accept card payments
      mode: "payment", // One-time payment mode
      // Send product information to Stripe
      line_items: items.map((item) => ({
        price_data: {
          currency: "jpy", // Use Japanese Yen
          product_data: {
            name: item.name, // Product name
          },
          unit_amount: item.price, // Price in the smallest currency unit (1 yen = 1)
        },
        quantity: item.quantity, // Product quantity
      })),
      success_url: "http://localhost:5173/complete", // Redirect URL after successful payment
      cancel_url: "http://localhost:5173/cart", // Redirect URL if payment is canceled
    });

    // Return the session ID to the frontend
    res.json({ id: session.id });
  } catch (error) {
    console.error("Stripe Session Error:", error);
    // Return a 500 status code if an error occurs
    res.status(500).json({ error: "決済セッションの作成に失敗しました" });
  }
});

module.exports = router;
