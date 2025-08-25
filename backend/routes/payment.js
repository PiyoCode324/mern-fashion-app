// backend/routes/payment.js

// Import required modules
const express = require("express");
const Stripe = require("stripe");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

const router = express.Router();

// Initialize Stripe instance with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 📦 API endpoint to create a Stripe Checkout session
router.post("/create-checkout-session", async (req, res) => {
  const { items } = req.body; // Purchase details sent from the frontend

  try {
    // Create a new Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"], // Accept credit card payments only
      mode: "payment", // One-time payment
      line_items: items.map((item) => ({
        price_data: {
          currency: "jpy", // Currency set to Japanese Yen
          product_data: {
            name: item.name, // Product name to display in Stripe Checkout
          },
          unit_amount: item.price, // Price in the smallest currency unit (e.g., 100 = ¥100)
        },
        quantity: item.quantity, // Quantity of the product
      })),
      // URL to redirect to after successful payment
      success_url: `${process.env.FRONTEND_URL}/complete`,
      // URL to redirect to if the customer cancels the payment
      cancel_url: `${process.env.FRONTEND_URL}/cart`,
    });

    // Respond with the session ID (used to redirect to the Stripe Checkout page)
    res.json({ id: session.id });
  } catch (error) {
    console.error("❌ Stripe Checkout Session Error:", error);
    // Return a 500 error with a user-friendly message
    res.status(500).json({ error: error.message, raw: error });
  }
});

module.exports = router;
