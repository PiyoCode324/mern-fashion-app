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
});

const orderSchema = new mongoose.Schema(
  {
    userUid: {
      type: String, // Firebase UID を格納
      required: true,
    },
    items: {
      type: [orderItemSchema], // サブドキュメントとして定義
      required: true,
      validate: [(val) => val.length > 0, "注文商品は1つ以上必要です"],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, "合計金額は0以上である必要があります"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // createdAt / updatedAt 両方つけたい場合はこちらも有効
  }
);

// モデルの重複登録を防止（Next.js や再起動時のエラー防止）
module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
