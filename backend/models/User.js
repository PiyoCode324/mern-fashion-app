// models/User.js
const mongoose = require("mongoose");

// 👤 ユーザー情報を保存するためのスキーマ（設計図）
const userSchema = new mongoose.Schema(
  {
    uid: {
      // Firebase Authentication から発行される一意のユーザーID（文字列）
      type: String,
      required: true,
      unique: true,
      trim: true, // 前後の空白を自動で削除
    },
    name: {
      // ユーザーの名前（任意でプロフィール画面などで使用）
      type: String,
      trim: true,
    },
    email: {
      // ユーザーのメールアドレス（ログイン時に使用）
      type: String,
      required: true, // 必須項目
      unique: true, // 同じメールアドレスは登録できない
      trim: true,
      lowercase: true, // 自動的に小文字に変換
      match: [/.+@.+\..+/, "有効なメールアドレスを入力してください"], // メール形式のバリデーション
      index: true, // 検索を高速化するためのインデックス
    },
    // ⭐ ユーザーの権限（ロール）を管理するフィールド
    role: {
      // 'user'：一般ユーザー、'admin'：管理者としてアクセスできる
      type: String,
      enum: ["user", "admin"], // 指定した文字列のみ許可
      default: "user", // 新規登録時は通常"user"が自動で設定される
    },
  },
  {
    timestamps: true, // 作成日時（createdAt）と更新日時（updatedAt）を自動で追加
  }
);

// モデルをエクスポート（アプリ全体で使用できるようにする）
module.exports = mongoose.model("User", userSchema);
