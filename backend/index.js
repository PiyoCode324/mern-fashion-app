// backend/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const admin = require("firebase-admin");

const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const paymentRoutes = require("./routes/payment");
const { verifyFirebaseToken } = require("./middleware/authMiddleware");
const adminCheck = require("./middleware/adminCheck");

const Product = require("./models/Product"); // モデルは必要に応じて使うため残してOK

// ✅ Firebaseサービスアカウントのセットアップ（Render等対応）
const serviceAccountPath = path.resolve("./serviceAccountKey.json");

if (!fs.existsSync(serviceAccountPath)) {
  const base64Key = process.env.SERVICE_ACCOUNT_KEY_BASE64;
  if (!base64Key) {
    throw new Error(
      "サービスアカウントキーが見つかりません。環境変数を設定してください。"
    );
  }
  const json = Buffer.from(base64Key, "base64").toString("utf8");
  fs.writeFileSync(serviceAccountPath, json);
}

const serviceAccount = require(serviceAccountPath);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();

// ✅ ミドルウェア
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://mern-fashion-app-frontend.onrender.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
app.use(express.json());

// ✅ MongoDB接続
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ✅ ルーティング
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payment", paymentRoutes);

// ✅ サーバー起動
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
