// routes/orderRoutes.js

const express = require("express");
const verifyFirebaseOnly = require("../middleware/verifyFirebaseOnly"); // Middleware for verifying Firebase Auth token
const adminCheck = require("../middleware/adminCheck"); // Middleware for checking admin privileges
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

console.log("✅ orderRoutes.js loaded and router initialized.");

// 🔽 Route for saving an order and updating inventory
router.post("/save-order", verifyFirebaseOnly, async (req, res) => {
  console.log("🚀 POST /api/orders/save-order endpoint hit.");
  console.log("📦 Order request body:", req.body);
  console.log("👤 UID:", req.user.uid);

  const { items } = req.body; // Array of ordered items

  try {
    const processedItems = [];
    let calculatedTotalPrice = 0;

    // Iterate through each item and update inventory
    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        // Return 404 if the product does not exist
        return res.status(404).json({
          message: `Product not found: ${item.productId}`,
        });
      }

      if (product.countInStock < item.quantity) {
        // Return error if stock is insufficient
        return res.status(400).json({
          message: `Insufficient stock for "${product.name}". Only ${product.countInStock} left.`,
        });
      }

      // Reduce stock
      product.countInStock -= item.quantity;
      await product.save();

      // Build order item object (including current price)
      processedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });

      // Add to total price
      calculatedTotalPrice += product.price * item.quantity;
    }

    // Find the user in MongoDB by Firebase UID
    const userInDb = await User.findOne({ uid: req.user.uid });
    if (!userInDb) {
      return res
        .status(404)
        .json({ message: "User not found for placing the order." });
    }

    // Create and save the new order
    const newOrder = new Order({
      userUid: userInDb._id,
      items: processedItems,
      totalPrice: calculatedTotalPrice,
    });

    await newOrder.save();
    console.log("🎉 Order successfully saved to MongoDB.");

    // Attempt to send a confirmation email (non-blocking)
    try {
      await sendEmail({
        to: userInDb.email,
        subject: "【Fashion Store】Thank you for your order!",
        html: `
          <h2>Thank you for your order!</h2>
          <p>We've received your order with the following details:</p>
          <ul>
            ${processedItems
              .map(
                (item) =>
                  `<li>Product ID: ${item.productId} - Quantity: ${item.quantity}</li>`
              )
              .join("")}
          </ul>
          <p>Total Price: ¥${calculatedTotalPrice.toLocaleString()}</p>
        `,
      });
      console.log("📧 Confirmation email sent.");
    } catch (emailErr) {
      console.error("❌ Email sending error:", emailErr);
    }

    res.status(200).json({ message: "Order saved successfully" });
  } catch (err) {
    console.error("🔥🔥🔥 Order Save Error:", err);
    res.status(500).json({ error: "Failed to save order" });
  }
});

// 🔽 Route to get order history for the logged-in user
router.get("/my-orders", verifyFirebaseOnly, async (req, res) => {
  console.log("➡️ GET /api/orders/my-orders endpoint hit.");
  console.log("👤 UID for fetching orders:", req.user.uid);

  try {
    // Find the user by Firebase UID
    const userInDb = await User.findOne({ uid: req.user.uid });
    if (!userInDb) {
      return res.status(404).json({ message: "User not found." });
    }

    // Fetch the user's orders and populate product info
    const orders = await Order.find({ userUid: userInDb._id }).populate(
      "items.productId"
    );

    console.log(`✅ Retrieved ${orders.length} orders.`);
    res.status(200).json(orders);
  } catch (err) {
    console.error("❌ Error fetching order history:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// 🔽 Route for admin to get all orders (admin access only)
router.get("/", verifyFirebaseOnly, adminCheck, async (req, res) => {
  try {
    // Fetch all orders and populate user and product information
    const orders = await Order.find({})
      .populate({
        path: "userUid",
        select: "name",
      })
      .populate({
        path: "items.productId",
        select: "name imageUrl",
      });

    res.json(orders);
  } catch (err) {
    console.error("❌ Error fetching all orders (admin):", err);
    res.status(500).json({ error: "Failed to retrieve orders" });
  }
});

module.exports = router;
