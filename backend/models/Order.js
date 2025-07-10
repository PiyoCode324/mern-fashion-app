const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userUid: { type: String, required: true }, // Firebase UID
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: { type: Number, required: true },
    },
  ],
  totalAmount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

// モデルの重複登録を防止
module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
