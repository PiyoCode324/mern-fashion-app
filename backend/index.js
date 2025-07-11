// index.js

// ✅ Loading required modules
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const admin = require("firebase-admin");

// ✅ Import routes, middleware, and models
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const paymentRoutes = require("./routes/payment");
const orderRoutes = require("./routes/orderRoutes");
const { verifyFirebaseToken } = require("./middleware/authMiddleware");
const adminCheck = require("./middleware/adminCheck");
const Product = require("./models/Product"); // もし後で必要になった場合のためにインポート

// ✅ Set up Firebase service account
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

// ✅ Create an Express app
const app = express();

// ✅ Middleware configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173", // 開発用
      "https://mern-fashion-app-frontend.onrender.com", // 本番用
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

// 📌 リクエストログ（全ルート共通）
app.use((req, res, next) => {
  console.log(`➡️ Incoming Request: ${req.method} ${req.originalUrl}`);
  next();
});

app.use(express.json()); // JSONリクエストパーサー

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ✅ Register routes（← ここが重要な修正ポイント）
console.log("Applying /api/products routes");
app.use("/api/products", productRoutes);

console.log("Applying /api/users routes");
app.use("/api/users", userRoutes);

console.log("Applying /api/payment routes");
app.use("/api/payment", paymentRoutes);

console.log("Applying /api/orders routes");
app.use("/api/orders", orderRoutes);

// ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
