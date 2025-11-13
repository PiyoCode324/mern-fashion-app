// index.js

// ================================
// 環境変数のロード
// ================================
// .env ファイルから環境変数を読み込む。
// MongoDB の接続文字列や Stripe の秘密鍵など、機密情報は .env に定義する。
require("dotenv").config();

// ================================
// 必要なモジュールのインポート
// ================================
const express = require("express"); // Webアプリケーションフレームワーク
const cors = require("cors"); // CORS対応ミドルウェア（異なるオリジン間の通信を許可）
const mongoose = require("mongoose"); // MongoDB ODMライブラリ

// ================================
// Firebase Admin SDK の初期化済みインスタンスを読み込み
// ================================
// firebaseAdmin.js 内で環境変数または JSON ファイルを用いて初期化している。
// ここでは再度初期化するのではなく、既存のインスタンスを利用する。
const admin = require("./firebaseAdmin");

// ================================
// ルートモジュールの読み込み
// ================================
const productRoutes = require("./routes/productRoutes"); // 商品関連API
const userRoutes = require("./routes/userRoutes"); // ユーザー関連API
const paymentRoutes = require("./routes/payment"); // 決済関連API
const orderRoutes = require("./routes/orderRoutes"); // 注文関連API
const salesRoutes = require("./routes/salesRoutes"); // 売上集計API

// ================================
// Express アプリケーションの作成
// ================================
const app = express();

// ================================
// CORS（クロスオリジンリソースシェアリング）の設定
// ================================
// ローカル開発用（http://localhost:5173）と本番環境用（Renderフロントエンド）を許可。
// 認証情報（Cookie, Authorizationヘッダなど）も送信可能にしている。
app.use(
  cors({
    origin: [
      "http://localhost:5173", // 開発用フロントエンド
      "https://mern-fashion-app-frontend.onrender.com", // 本番フロントエンド
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // 許可するHTTPメソッド
    credentials: true, // 認証情報を含めることを許可
  })
);

// ================================
// グローバルリクエストロギング
// ================================
// 全てのリクエストについて、HTTPメソッドとURLをログに出力する。
app.use((req, res, next) => {
  console.log(`➡️ Incoming Request: ${req.method} ${req.originalUrl}`);
  next();
});

// ================================
// JSON ボディパーサー
// ================================
// リクエストの body を JSON として解釈できるようにする。
app.use(express.json());

// ================================
// MongoDB への接続
// ================================
// 環境変数 MONGO_URI を使用して接続。
// 成功・失敗でログを出力。
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ================================
// API ルートの適用
// ================================
// /api/xxx の形でエンドポイントをまとめて管理。
console.log("Applying /api/products routes");
app.use("/api/products", productRoutes);

console.log("Applying /api/users routes");
app.use("/api/users", userRoutes);

console.log("Applying /api/payment routes");
app.use("/api/payment", paymentRoutes);

console.log("Applying /api/orders routes");
app.use("/api/orders", orderRoutes);

console.log("Applying /api/sales routes");
app.use("/api/sales", salesRoutes);

// ================================
// サーバーの起動
// ================================
// PORT は環境変数から読み込み、指定がなければデフォルトで 5000 を使用。
const PORT = process.env.PORT || 5000;

// ✅ デバッグ用：主要な環境変数が存在するか確認
console.log("🔑 STRIPE_SECRET_KEY exists:", !!process.env.STRIPE_SECRET_KEY);
console.log("🔑 MONGO_URI exists:", !!process.env.MONGO_URI);

// サーバーを起動してログ出力
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
