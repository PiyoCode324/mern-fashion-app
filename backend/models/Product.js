// models/Product.js
const mongoose = require("mongoose");

// ⭐️ レビュー用のサブスキーマ
const reviewSchema = new mongoose.Schema(
  {
    user: {
      // レビューを投稿したユーザーの参照（User モデルを参照）
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      // レビュー投稿者の名前
      type: String,
      required: true,
    },
    rating: {
      // 評価スコア（1〜5の範囲）
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      // レビューコメント
      type: String,
      required: true,
    },
  },
  {
    // createdAt, updatedAt のタイムスタンプを自動追加
    timestamps: true,
  }
);

// 🛍️ 商品スキーマ（レビュー情報を含む）
const productSchema = new mongoose.Schema(
  {
    name: {
      // 商品名
      type: String,
      required: true,
    },
    category: {
      // 商品カテゴリー
      type: String,
      required: true,
    },
    description: {
      // 商品説明
      type: String,
    },
    imageUrl: {
      // 商品画像のURL
      type: String,
      required: true,
    },
    price: {
      // 商品価格
      type: Number,
      required: true,
    },
    countInStock: {
      // 在庫数
      type: Number,
      required: true,
      default: 0,
    },
    createdBy: {
      // 商品を登録したユーザー（管理者）の参照
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ✅ レビュー関連フィールド
    reviews: [reviewSchema], // レビュー配列
    averageRating: {
      // 平均評価
      type: Number,
      default: 0,
    },
    numReviews: {
      // レビュー数
      type: Number,
      default: 0,
    },
  },
  {
    // createdAt, updatedAt のタイムスタンプを自動追加
    timestamps: true,
  }
);

// 🔽 モデルを作成
const Product = mongoose.model("Product", productSchema);

// 📦 モジュールとしてエクスポート
module.exports = Product;
