// routes/orderRoutes.js

const express = require("express");
const verifyFirebaseOnly = require("../middleware/verifyFirebaseOnly");
const adminCheck = require("../middleware/adminCheck");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

console.log("✅ orderRoutes.js loaded and router initialized.");

// 注文の保存 + 在庫の減少
router.post("/save-order", verifyFirebaseOnly, async (req, res) => {
  console.log("🚀 POST /api/orders/save-order endpoint hit.");
  console.log("📦 Order request body:", req.body);
  console.log("👤 UID:", req.user.uid);

  const { items } = req.body;

  try {
    const processedItems = [];
    let calculatedTotalPrice = 0;

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

      product.countInStock -= item.quantity;
      await product.save();

      processedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });
      calculatedTotalPrice += product.price * item.quantity;
    }

    const userInDb = await User.findOne({ uid: req.user.uid });
    if (!userInDb) {
      return res
        .status(404)
        .json({ message: "注文するユーザーが見つかりません。" });
    }

    const newOrder = new Order({
      userUid: userInDb._id,
      items: processedItems,
      totalPrice: calculatedTotalPrice,
    });

    await newOrder.save();
    console.log("🎉 Order saved successfully to MongoDB.");

    // 📧 メール送信（失敗しても注文は成功）
    try {
      await sendEmail({
        to: userInDb.email,
        subject: "【Fashion Store】ご注文ありがとうございます！",
        html: `
          <h2>ご注文ありがとうございました！</h2>
          <p>以下の内容で注文を受け付けました。</p>
          <ul>
            ${processedItems
              .map(
                (item) =>
                  `<li>商品ID: ${item.productId} - 数量: ${item.quantity}</li>`
              )
              .join("")}
          </ul>
          <p>合計金額: ¥${calculatedTotalPrice.toLocaleString()}</p>
        `,
      });
      console.log("📧 メール送信完了");
    } catch (emailErr) {
      console.error("❌ メール送信エラー:", emailErr);
    }

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
        path: "userUid",
        select: "name",
      })
      .populate({
        path: "items.productId",
        select: "name imageUrl",
      });

    res.json(orders);
  } catch (err) {
    console.error("管理者向け注文一覧取得エラー:", err);
    res.status(500).json({ error: "注文一覧取得に失敗しました" });
  }
});

module.exports = router;
