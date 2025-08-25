// index.js

// ✅ Load environment variables from the .env file
require("dotenv").config(); // Load .env configuration

// ✅ Import core modules
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// ✅ Import the initialized Firebase Admin SDK instance
// This ensures the Admin SDK is only initialized once
const admin = require("./firebaseAdmin");

// ✅ Import route handlers
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const paymentRoutes = require("./routes/payment");
const orderRoutes = require("./routes/orderRoutes");
const salesRoutes = require("./routes/salesRoutes"); // ✅ 追加：売上集計ルート

// ✅ Create the Express app instance
const app = express();

// ✅ Configure CORS middleware
// Only allow specified origins and enable credentials (cookies, auth headers, etc.)
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Local frontend for development
      "https://mern-fashion-app-frontend.onrender.com", // Production frontend
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

// 📌 Global request logging middleware
app.use((req, res, next) => {
  console.log(`➡️ Incoming Request: ${req.method} ${req.originalUrl}`);
  next();
});

// ✅ Enable JSON body parsing for incoming requests
app.use(express.json());

// ✅ Connect to MongoDB using Mongoose
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Register route handlers under the /api namespace
console.log("Applying /api/products routes");
app.use("/api/products", productRoutes);

console.log("Applying /api/users routes");
app.use("/api/users", userRoutes);

console.log("Applying /api/payment routes");
app.use("/api/payment", paymentRoutes);

console.log("Applying /api/orders routes");
app.use("/api/orders", orderRoutes);

console.log("Applying /api/sales routes"); // ✅ 追加：ログ出力
app.use("/api/sales", salesRoutes); // ✅ 追加：売上集計ルートを登録

// ✅ Start the Express server on the specified port (default: 5000)
const PORT = process.env.PORT || 5000;

// ✅ 環境変数の確認ログをここに追加
console.log("🔑 STRIPE_SECRET_KEY exists:", !!process.env.STRIPE_SECRET_KEY);
console.log("🔑 MONGO_URI exists:", !!process.env.MONGO_URI);

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
