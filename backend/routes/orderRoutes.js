// routes/orderRoutes.js

const express = require("express");
const verifyFirebaseOnly = require("../middleware/verifyFirebaseOnly");
const Order = require("../models/Order");
const Product = require("../models/Product");

const router = express.Router();

// 📌 追加: このファイルがロードされ、routerが定義されたことを示すログ
console.log("✅ orderRoutes.js loaded and router initialized.");

// ✅ 注文の保存 + 在庫の減少
router.post("/save-order", verifyFirebaseOnly, async (req, res) => {
  console.log("🚀 POST /api/orders/save-order endpoint hit.");
  console.log("📦 Order request body:", req.body);
  console.log("👤 UID:", req.user.uid);

  const { items, totalAmount } = req.body;

  try {
    // 在庫チェック
    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          message: `商品が見つかりません: ${item.productId}`,
        });
      }

      if (product.countInStock < item.quantity) {
        return res.status(400).json({
          message: `「${product.name}」の在庫が不足しています。残り ${product.countInStock} 個です。`,
        });
      }
    }

    // 在庫を減らす処理
    for (const item of items) {
      const product = await Product.findById(item.productId);
      product.countInStock -= item.quantity;
      await product.save();
    }

    // 注文を保存
    console.log("Attempting to create new Order instance...");
    const newOrder = new Order({
      userUid: req.user.uid,
      items,
      totalAmount,
    });
    console.log("New Order instance created. Attempting to save...");

    await newOrder.save();
    console.log("🎉 Order saved successfully to MongoDB.");

    res.status(200).json({ message: "Order saved successfully" });
  } catch (err) {
    console.error("🔥🔥🔥 Order Save Error:", err);
    res.status(500).json({ error: "Failed to save order" });
  }
});

// ✅ 自分の注文履歴を取得
router.get("/my-orders", verifyFirebaseOnly, async (req, res) => {
  console.log("➡️ GET /api/orders/my-orders endpoint hit.");
  console.log("👤 UID for fetching orders:", req.user.uid);

  try {
    console.log("Attempting to fetch orders from MongoDB...");
    const orders = await Order.find({ userUid: req.user.uid }).populate(
      "items.productId"
    );
    console.log(`✅ Fetched ${orders.length} orders.`);
    res.status(200).json(orders);
  } catch (err) {
    console.error("❌ Order Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// 全注文一覧を取得する例（認証・権限付き）
router.get("/", verifyFirebaseOnly, async (req, res) => {
  try {
    const orders = await Order.find().populate("items.productId");
    res.status(200).json(orders);
  } catch (err) {
    console.error("Failed to fetch all orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

module.exports = router;
