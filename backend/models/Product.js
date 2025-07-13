// models/Product.js
const mongoose = require("mongoose");

// 🛍️ 商品情報を保存するためのスキーマ定義
const productSchema = new mongoose.Schema({
  name: {
    // 商品名（例：Tシャツ、イヤホンなど）
    type: String,
    required: true,
  },
  category: {
    // 商品のカテゴリ（例：ファッション、家電など）
    type: String,
    required: true,
  },
  description: {
    // 商品の説明文（任意）
    type: String,
    required: false,
  },
  imageUrl: {
    // 商品画像のURL（画像アップロード時に生成される）
    type: String,
    required: true,
  },
  price: {
    // 商品の価格（例：1500円）
    type: Number,
    required: true,
  },
  countInStock: {
    // 在庫数（例：在庫が5個ある → 5）
    type: Number,
    required: true,
    default: 0, // 在庫数が未指定のときは0になる
  },
  createdBy: {
    // この商品を登録したユーザー（Userモデルを参照）
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

// ✅ 上記スキーマを元に Product モデルを作成
const Product = mongoose.model("Product", productSchema);

// モデルを外部ファイルでも使えるようにエクスポート
module.exports = Product;
