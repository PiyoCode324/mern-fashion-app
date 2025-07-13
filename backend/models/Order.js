// models/Order.js
const mongoose = require("mongoose");

// 🧾 注文の中に含まれる各商品（注文アイテム）のスキーマ定義
const orderItemSchema = new mongoose.Schema({
  productId: {
    // 商品のID（Productモデルを参照）
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    // 購入数量（最低1以上）
    type: Number,
    required: true,
    min: [1, "数量は1以上である必要があります"],
  },
  price: {
    // 購入時の単価（後から商品価格が変わっても問題ないように）
    type: Number,
    required: true,
    min: [0, "価格は0円以上である必要があります"],
  },
});

// 🧾 注文全体のスキーマ定義（1つの注文 = 複数の商品アイテムを含む）
const orderSchema = new mongoose.Schema(
  {
    userUid: {
      // この注文をしたユーザーのID（Userモデルを参照）
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      // 注文された商品リスト（orderItemSchemaの配列）
      type: [orderItemSchema],
      required: true,
      validate: [
        (val) => val.length > 0,
        "注文商品は1つ以上含まれている必要があります",
      ],
    },
    totalPrice: {
      // この注文の合計金額（すべての商品×数量の合計）
      type: Number,
      required: true,
      min: [0, "合計金額は0円以上である必要があります"],
    },
    // 🕒 作成日時・更新日時は、オプションで自動生成（timestamps）
  },
  {
    timestamps: true, // createdAt / updatedAt が自動的に追加される
  }
);

// ✅ モデルをエクスポート（重複登録を防ぐための条件付きエクスポート）
module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
