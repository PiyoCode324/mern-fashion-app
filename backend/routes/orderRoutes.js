// routes/orderRoutes.js
const express = require("express");
const verifyFirebaseOnly = require("../middleware/verifyFirebaseOnly");
const Order = require("../models/Order");

const router = express.Router();

// 📌 追加: このファイルがロードされ、routerが定義されたことを示すログ
console.log("✅ orderRoutes.js loaded and router initialized.");

// ✅ 注文の保存
router.post("/save-order", verifyFirebaseOnly, async (req, res) => {
  // 📌 追加: save-orderエンドポイントへのリクエスト到達を示すログ
  console.log("🚀 POST /api/orders/save-order endpoint hit.");

  console.log("📦 Order request body:", req.body);
  console.log("👤 UID:", req.user.uid);

  const { items, totalAmount } = req.body;

  try {
    // 📌 追加: Orderモデルのインスタンス生成前
    console.log("Attempting to create new Order instance...");
    const newOrder = new Order({
      userUid: req.user.uid,
      items,
      totalAmount,
    });
    // 📌 追加: Orderモデルのインスタンス生成後、保存前
    console.log("New Order instance created. Attempting to save...");

    await newOrder.save();
    // 📌 追加: 保存成功時
    console.log("🎉 Order saved successfully to MongoDB.");
    res.status(200).json({ message: "Order saved successfully" });
  } catch (err) {
    // 📌 追加: 保存失敗時、エラーを強調
    console.error("🔥🔥🔥 Order Save Error:", err);
    res.status(500).json({ error: "Failed to save order" });
  }
});

// ✅ 自分の注文履歴を取得
router.get("/my-orders", verifyFirebaseOnly, async (req, res) => {
  // 📌 追加: my-ordersエンドポイントへのリクエスト到達を示すログ
  console.log("➡️ GET /api/orders/my-orders endpoint hit.");
  console.log("👤 UID for fetching orders:", req.user.uid);

  try {
    // 📌 追加: 注文検索前
    console.log("Attempting to fetch orders from MongoDB...");
    const orders = await Order.find({ userUid: req.user.uid }).populate(
      "items.productId"
    );
    // 📌 追加: 注文検索後
    console.log(`✅ Fetched ${orders.length} orders.`);
    // 📌 追加: 取得した注文データの内容 (デバッグ用。本番環境では注意)
    // console.log("Fetched orders data:", JSON.stringify(orders, null, 2));
    res.status(200).json(orders);
  } catch (err) {
    // 📌 追加: 注文取得失敗時、エラーを強調
    console.error("❌ Order Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

module.exports = router;
