const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+@.+\..+/, "有効なメールアドレスを入力してください"],
      index: true,
    },
    // ★ここから追加★
    role: {
      type: String,
      enum: ["user", "admin"], // 'user'（一般ユーザー）と'admin'（管理者）など、許可するロールを定義
      default: "user", // デフォルトは'user'に設定
    },
    // ★ここまで追加★
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
