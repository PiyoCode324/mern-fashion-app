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

// 🔽 Route for saving an order and updating inventory
router.post("/save-order", verifyFirebaseOnly, async (req, res) => {
  console.log("--- 🏁 注文保存リクエスト受信 ---");
  console.log("📦 Order request body:", req.body);
  console.log("👤 UID:", req.user.uid);

  const { items } = req.body;

  try {
    const processedItems = [];
    let calculatedTotalPrice = 0;

    // Iterate through each item and update inventory
    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          message: `Product not found: ${item.productId}`,
        });
      }

      if (product.countInStock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for "${product.name}". Only ${product.countInStock} left.`,
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
        .json({ message: "User not found for placing the order." });
    }

    const newOrder = new Order({
      userUid: userInDb._id,
      items: processedItems,
      totalPrice: calculatedTotalPrice,
    });

    console.log("--- 💾 データベース保存直前 ---");
    console.log("保存する注文データ:", newOrder);

    // **Nested try...catch for specific database errors**
    try {
      await newOrder.save();
      console.log(
        "🎉 Order successfully saved to MongoDB. Order ID:",
        newOrder._id
      );
    } catch (dbSaveErr) {
      console.error("--- 🚨 データベース保存エラー ---");
      console.error("詳細:", dbSaveErr);
      // Return a 500 status code with a specific error message
      return res.status(500).json({
        error: "Failed to save order to database.",
        details: dbSaveErr.message,
      });
    }

    // Attempt to send a confirmation email (non-blocking)
    try {
      await sendEmail({
        to: userInDb.email,
        subject: "【Fashion Store】Thank you for your order!",
        html: `
          <h2>Thank you for your order!</h2>
          <p>We've received your order with the following details:</p>
          <ul>
            ${processedItems
              .map(
                (item) =>
                  `<li>Product ID: ${item.productId} - Quantity: ${item.quantity}</li>`
              )
              .join("")}
          </ul>
          <p>Total Price: ¥${calculatedTotalPrice.toLocaleString()}</p>
        `,
      });
      console.log("📧 Confirmation email sent.");
    } catch (emailErr) {
      console.error("❌ Email sending error:", emailErr);
    }

    res.status(200).json({ message: "Order saved successfully" });
  } catch (err) {
    console.error("--- 🚨 全体的な注文保存エラー ---");
    console.error("🔥🔥🔥 Order Save Error:", err);
    console.error("エラー名:", err.name);
    console.error("エラーメッセージ:", err.message);
    res.status(500).json({ error: "Failed to save order" });
  }
});

// 🔽 Route to get order history for the logged-in user
router.get("/my-orders", verifyFirebaseOnly, async (req, res) => {
  console.log("➡️ GET /api/orders/my-orders endpoint hit.");
  console.log("👤 UID for fetching orders:", req.user.uid);

  try {
    const userInDb = await User.findOne({ uid: req.user.uid });
    if (!userInDb) {
      return res.status(404).json({ message: "User not found." });
    }

    const orders = await Order.find({ userUid: userInDb._id })
      .populate({
        path: "items.productId",
        // Ensure to select the necessary fields for the frontend
        select: "name imageUrl reviews",
      })
      .sort({ createdAt: -1 });

    console.log(`✅ Retrieved ${orders.length} orders.`);
    res.status(200).json(orders);
  } catch (err) {
    console.error("❌ Error fetching order history:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// 🔽 Route for admin to get all orders (admin access only)
router.get("/", verifyFirebaseOnly, adminCheck, async (req, res) => {
  console.log("➡️ GET /api/orders (admin) endpoint hit.");
  try {
    const { status, userName, sort } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (userName) {
      const matchedUsers = await User.find({
        name: { $regex: new RegExp(userName, "i") },
      }).select("_id");

      const userIds = matchedUsers.map((u) => u._id);
      query.userUid = userIds.length > 0 ? { $in: userIds } : { $in: [] };
    }

    const sortOrder = sort === "asc" ? 1 : -1;

    const orders = await Order.find(query)
      .populate({ path: "userUid", select: "name" })
      .populate({ path: "items.productId", select: "name imageUrl" })
      .sort({ createdAt: sortOrder });

    console.log(`✅ Admin retrieved ${orders.length} orders.`);
    res.json(orders);
  } catch (err) {
    console.error("❌ Error fetching filtered orders:", err);
    res.status(500).json({ error: "注文の取得に失敗しました" });
  }
});

// 🔽 Route for updating order status (admin or order owner only)
router.patch("/:id/status", verifyFirebaseOnly, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "注文が見つかりません" });
    }

    const userInDb = await User.findOne({ uid: req.user.uid });
    if (!userInDb) {
      return res.status(404).json({ message: "ユーザーが見つかりません" });
    }

    const isAdmin = userInDb?.role === "admin";
    const isOwner = order.userUid.toString() === userInDb._id.toString();

    if (!isAdmin && !isOwner) {
      return res
        .status(403)
        .json({ message: "ステータス変更の権限がありません" });
    }

    order.status = status;
    const updatedOrder = await order.save();

    console.log(
      `📝 注文 ${order._id} のステータスを「${status}」に更新しました`
    );

    res.status(200).json({
      message: "注文ステータスを更新しました",
      updatedOrder,
    });
  } catch (err) {
    console.error("❌ ステータス更新エラー:", err);
    res.status(500).json({ error: "注文ステータスの更新に失敗しました" });
  }
});

module.exports = router;
