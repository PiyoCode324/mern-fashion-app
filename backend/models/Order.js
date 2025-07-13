// models/Order.js
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity must be at least 1"],
  },
  price: {
    // ⭐ ここにpriceフィールドを追加 ⭐
    type: Number,
    required: true,
    min: [0, "Price must be at least 0"],
  },
});

const orderSchema = new mongoose.Schema(
  {
    userUid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [orderItemSchema], // サブドキュメントとして定義
      required: true,
      validate: [(val) => val.length > 0, "注文商品は1つ以上必要です"],
    },
    totalPrice: {
      // ⭐ totalAmount を totalPrice に変更 ⭐
      type: Number,
      required: true,
      min: [0, "合計金額は0以上である必要があります"],
    },
    // createdAt は timestamps: true で自動生成されるので、ここでは明示的に定義する必要はない
  },
  {
    timestamps: true, // createdAt と updatedAt を自動的に追加
  }
);

// モデルの重複登録を防止（Next.js や再起動時のエラー防止）
module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
