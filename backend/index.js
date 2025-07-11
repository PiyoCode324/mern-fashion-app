// index.js

// ✅ Loading required modules
require("dotenv").config(); // .envファイルを読み込む
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// ★修正: Firebase Admin SDK の初期化済みadminオブジェクトをインポート
// これにより、firebaseAdmin.js で一度だけ初期化が行われます
const admin = require("./firebaseAdmin");

// ✅ Import routes, middleware, and models
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const paymentRoutes = require("./routes/payment");
const orderRoutes = require("./routes/orderRoutes");

// authMiddlewareやadminCheckは各ルートで直接インポートして使用
// const { verifyFirebaseToken } = require("./middleware/authMiddleware"); // これは各ルートで直接インポート
// const adminCheck = require("./middleware/adminCheck"); // これは各ルートで直接インポート

// Productモデルは、もし直接使う必要がなければここでのインポートは不要
// const Product = require("./models/Product");

// ✅ Create an Express app
const app = express();

// ✅ Middleware configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173", // 開発用フロントエンドのURL
      "https://mern-fashion-app-frontend.onrender.com", // 本番用フロントエンドのURL
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
    // useNewUrlParser と useUnifiedTopology はMongoose 6+ では不要なので削除
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ✅ Register routes
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
