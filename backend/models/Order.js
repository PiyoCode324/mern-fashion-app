// models/Order.js
const mongoose = require("mongoose");

// 🧾 Schema definition for each product item included in an order
const orderItemSchema = new mongoose.Schema({
  productId: {
    // Reference to the product (see Product model)
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    // Quantity purchased (must be at least 1)
    type: Number,
    required: true,
    min: [1, "Quantity must be at least 1"],
  },
  price: {
    // Unit price at the time of purchase (to preserve the price even if it changes later)
    type: Number,
    required: true,
    min: [0, "Price must be at least 0"],
  },
});

// 🧾 Schema definition for an entire order (an order can contain multiple items)
const orderSchema = new mongoose.Schema(
  {
    userUid: {
      // Reference to the user who placed the order (see User model)
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      // Array of ordered items (uses orderItemSchema)
      type: [orderItemSchema],
      required: true,
      validate: [
        (val) => val.length > 0,
        "At least one item must be included in the order",
      ],
    },
    totalPrice: {
      // Total amount of the order (sum of item prices × quantities)
      type: Number,
      required: true,
      min: [0, "Total price must be at least 0"],
    },
    // 🕒 Timestamps for creation and update are added automatically
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// ✅ Export the model (preventing duplicate model registration)
module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
