// index.js

// ✅ Load environment variables from .env file
require("dotenv").config(); // .envファイルを読み込む

// ✅ Load core modules
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// ★ Import initialized Firebase Admin SDK instance
// firebaseAdmin.jsで一度だけ初期化されているadminオブジェクトを取得
const admin = require("./firebaseAdmin");

// ✅ Import route handlers
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const paymentRoutes = require("./routes/payment");
const orderRoutes = require("./routes/orderRoutes");

// ※ authMiddlewareやadminCheckは各ルートファイルで直接インポートして使用するため、ここでは読み込まない

// ✅ Create Express app instance
const app = express();

// ✅ Configure CORS middleware
// 指定したオリジンのみ許可し、Cookieなどの認証情報も送信可能に設定
app.use(
  cors({
    origin: [
      "http://localhost:5173", // ローカル開発用フロントエンドのURL
      "https://mern-fashion-app-frontend.onrender.com", // 本番用フロントエンドのURL
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // 許可するHTTPメソッド
    credentials: true, // クッキー送信を許可
  })
);

// 📌 全ルート共通のリクエストログ出力ミドルウェア
app.use((req, res, next) => {
  console.log(`➡️ Incoming Request: ${req.method} ${req.originalUrl}`);
  next();
});

// ✅ JSONリクエストボディのパース設定
app.use(express.json());

// ✅ Connect to MongoDB using Mongoose
// useNewUrlParserやuseUnifiedTopologyはMongoose 6+でデフォルト有効なので削除済み
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ✅ Register route handlers under /api 以下のパスに割り当て
console.log("Applying /api/products routes");
app.use("/api/products", productRoutes);

console.log("Applying /api/users routes");
app.use("/api/users", userRoutes);

console.log("Applying /api/payment routes");
app.use("/api/payment", paymentRoutes);

console.log("Applying /api/orders routes");
app.use("/api/orders", orderRoutes);

// ✅ Start Express server on specified PORT or default 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
