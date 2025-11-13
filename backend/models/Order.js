// models/Order.js
const mongoose = require("mongoose");

// 🧾 注文内の商品アイテムごとのスキーマ定義
const orderItemSchema = new mongoose.Schema({
  productId: {
    // 商品の参照（Product モデルを参照する外部キー）
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    // 購入数量（最低1以上である必要がある）
    type: Number,
    required: true,
    min: [1, "購入数量は1以上である必要があります"],
  },
  price: {
    // 購入時点での商品単価（後から商品価格が変わっても注文時の価格を保持するため）
    type: Number,
    required: true,
    min: [0, "価格は0以上である必要があります"],
  },
});

// 🧾 注文全体のスキーマ定義（1つの注文には複数の商品アイテムを含むことができる）
const orderSchema = new mongoose.Schema(
  {
    userUid: {
      // 注文を行ったユーザーの参照（User モデルを参照）
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      // 注文内の商品アイテム（少なくとも1つ以上必要）
      type: [orderItemSchema],
      required: true,
      validate: [
        (val) => val.length > 0,
        "注文には少なくとも1つの商品が含まれている必要があります",
      ],
    },
    totalPrice: {
      // 注文全体の合計金額
      type: Number,
      required: true,
      min: [0, "合計金額は0以上である必要があります"],
    },
    status: {
      // 注文のステータス（進行状況）
      type: String,
      enum: ["未処理", "処理中", "発送済み", "キャンセル"], // 許可されるステータスのみ指定
      default: "未処理", // デフォルトは「未処理」
    },
  },
  {
    // createdAt, updatedAt のタイムスタンプを自動的に追加
    timestamps: true,
  }
);

// ✅ モデルをエクスポート（すでに登録済みのモデルがあれば再利用して重複定義を防ぐ）
module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
