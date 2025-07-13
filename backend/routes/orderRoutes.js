// routes/orderRoutes.js

const express = require("express");
const verifyFirebaseOnly = require("../middleware/verifyFirebaseOnly");
const adminCheck = require("../middleware/adminCheck");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

const router = express.Router();

console.log("✅ orderRoutes.js loaded and router initialized.");

// 注文の保存 + 在庫の減少
router.post("/save-order", verifyFirebaseOnly, async (req, res) => {
  console.log("🚀 POST /api/orders/save-order endpoint hit.");
  console.log("📦 Order request body:", req.body);
  console.log("👤 UID:", req.user.uid);

  const { items } = req.body; // totalAmount はバックエンドで計算するため、ここでは受け取らない

  try {
    // 注文アイテムを処理し、在庫を更新し、合計金額を計算
    const processedItems = [];
    let calculatedTotalPrice = 0; // バックエンドで合計金額を計算

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

      // 在庫を減らす
      product.countInStock -= item.quantity;
      await product.save();

      // processedItems に購入時の価格を含める
      processedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price, // 購入時点の商品の価格を保存
      });
      calculatedTotalPrice += product.price * item.quantity;
    }

    // Firebase UIDからMongoDBのUserドキュメントを取得
    const userInDb = await User.findOne({ uid: req.user.uid });
    if (!userInDb) {
      return res
        .status(404)
        .json({ message: "注文するユーザーが見つかりません。" });
    }

    // 注文を保存
    const newOrder = new Order({
      userUid: userInDb._id, // Userモデルの _id を保存する
      items: processedItems, // 加工済みのアイテムを使用
      totalPrice: calculatedTotalPrice, // バックエンドで計算した合計金額を使用
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

// 自分の注文履歴を取得
router.get("/my-orders", verifyFirebaseOnly, async (req, res) => {
  console.log("➡️ GET /api/orders/my-orders endpoint hit.");
  console.log("👤 UID for fetching orders:", req.user.uid);

  try {
    console.log("Attempting to fetch orders from MongoDB...");
    const userInDb = await User.findOne({ uid: req.user.uid });
    if (!userInDb) {
      return res.status(404).json({ message: "ユーザーが見つかりません。" });
    }
    const orders = await Order.find({ userUid: userInDb._id }).populate(
      "items.productId"
    );
    console.log(`✅ Fetched ${orders.length} orders.`);
    res.status(200).json(orders);
  } catch (err) {
    console.error("❌ Order Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// 全注文一覧を取得（管理者専用）
router.get("/", verifyFirebaseOnly, adminCheck, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate({
        path: "userUid", // Userモデルを参照
        select: "name", // ユーザー名だけを埋め込む
      })
      .populate({
        path: "items.productId", // 注文アイテム内のProductを参照
        select: "name imageUrl", // 商品名と画像URLを埋め込む
      });

    res.json(orders);
  } catch (err) {
    console.error("管理者向け注文一覧取得エラー:", err);
    res.status(500).json({ error: "注文一覧取得に失敗しました" });
  }
});

module.exports = router;