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
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [
        (val) => val.length > 0,
        "At least one item must be included in the order",
      ],
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, "Total price must be at least 0"],
    },
    status: {
      type: String,
      enum: ["未処理", "処理中", "発送済み", "キャンセル"],
      default: "未処理",
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Export the model (preventing duplicate model registration)
module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
