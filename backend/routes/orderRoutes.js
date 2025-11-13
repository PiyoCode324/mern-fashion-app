// routes/orderRoutes.js

const express = require("express");
const verifyFirebaseOnly = require("../middleware/verifyFirebaseOnly"); // 🔐 Firebaseトークン認証のみのミドルウェア
const adminCheck = require("../middleware/adminCheck"); // 🔒 管理者専用アクセスチェック
const Order = require("../models/Order"); // 🗂️ Orderモデル（注文情報）
const Product = require("../models/Product"); // 🗂️ Productモデル（商品情報）
const User = require("../models/User"); // 🗂️ Userモデル（ユーザー情報）
const sendEmail = require("../utils/sendEmail"); // 📧 メール送信用ユーティリティ

const router = express.Router();

console.log("✅ orderRoutes.js が読み込まれ、ルーターを初期化しました。");

// ==================================================
// 🔽 注文保存ルート（在庫更新も同時に行う）
// ==================================================
router.post("/save-order", verifyFirebaseOnly, async (req, res) => {
  console.log("--- 🏁 注文保存リクエスト受信 ---");
  console.log("📦 リクエストボディ:", req.body);
  console.log("👤 UID:", req.user.uid);

  const { items } = req.body;

  try {
    const processedItems = [];
    let calculatedTotalPrice = 0;

    // 💡 各注文アイテムごとに在庫を確認し、更新
    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          message: `商品が見つかりません: ${item.productId}`,
        });
      }

      if (product.countInStock < item.quantity) {
        return res.status(400).json({
          message: `在庫不足: "${product.name}" は残り ${product.countInStock} 個です`,
        });
      }

      // 在庫を減らす
      product.countInStock -= item.quantity;
      await product.save();

      processedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });

      calculatedTotalPrice += product.price * item.quantity;
    }

    // 🔍 ユーザー情報を取得
    const userInDb = await User.findOne({ uid: req.user.uid });
    if (!userInDb) {
      return res.status(404).json({ message: "ユーザーが見つかりません" });
    }

    // 📝 新しい注文を作成
    const newOrder = new Order({
      userUid: userInDb._id,
      items: processedItems,
      totalPrice: calculatedTotalPrice,
    });

    console.log("--- 💾 データベース保存直前 ---");
    console.log("保存する注文データ:", newOrder);

    // 💾 MongoDBに注文を保存（ネストtry...catchで特定のDBエラーを処理）
    try {
      await newOrder.save();
      console.log("🎉 注文がMongoDBに保存されました。Order ID:", newOrder._id);
    } catch (dbSaveErr) {
      console.error("--- 🚨 データベース保存エラー ---");
      console.error("詳細:", dbSaveErr);
      return res.status(500).json({
        error: "注文の保存に失敗しました",
        details: dbSaveErr.message,
      });
    }

    // 📧 確認メール送信（非同期・非ブロッキング）
    try {
      await sendEmail({
        to: userInDb.email,
        subject: "【Fashion Store】ご注文ありがとうございます！",
        html: `
          <h2>ご注文ありがとうございます！</h2>
          <p>以下の内容でご注文を受け付けました：</p>
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
      console.log("📧 確認メールを送信しました。");
    } catch (emailErr) {
      console.error("❌ メール送信エラー:", emailErr);
    }

    res.status(200).json({ message: "注文が正常に保存されました" });
  } catch (err) {
    console.error("--- 🚨 全体的な注文保存エラー ---");
    console.error("🔥 Order Save Error:", err);
    console.error("エラー名:", err.name);
    console.error("エラーメッセージ:", err.message);
    res.status(500).json({ error: "注文の保存に失敗しました" });
  }
});

// ==================================================
// 🔽 ログインユーザーの注文履歴取得
// ==================================================
router.get("/my-orders", verifyFirebaseOnly, async (req, res) => {
  console.log("➡️ GET /api/orders/my-orders エンドポイントにアクセス");
  console.log("👤 UID:", req.user.uid);

  try {
    const userInDb = await User.findOne({ uid: req.user.uid });
    if (!userInDb) {
      return res.status(404).json({ message: "ユーザーが見つかりません" });
    }

    // 💡 注文履歴を取得し、関連商品情報を populate
    const orders = await Order.find({ userUid: userInDb._id })
      .populate({
        path: "items.productId",
        select: "name imageUrl reviews",
      })
      .sort({ createdAt: -1 }); // 新しい順

    console.log(`✅ ${orders.length} 件の注文を取得しました`);
    res.status(200).json(orders);
  } catch (err) {
    console.error("❌ 注文履歴取得エラー:", err);
    res.status(500).json({ error: "注文履歴の取得に失敗しました" });
  }
});

// ==================================================
// 🔽 管理者用：全注文取得（管理者のみアクセス可能）
// ==================================================
router.get("/", verifyFirebaseOnly, adminCheck, async (req, res) => {
  console.log("➡️ GET /api/orders (admin) エンドポイントにアクセス");
  try {
    const { status, userName, sort } = req.query;

    const query = {};

    if (status) {
      query.status = status; // 注文ステータスで絞り込み
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

    console.log(`✅ 管理者が ${orders.length} 件の注文を取得しました`);
    res.json(orders);
  } catch (err) {
    console.error("❌ 注文取得エラー:", err);
    res.status(500).json({ error: "注文の取得に失敗しました" });
  }
});

// ==================================================
// 🔽 注文ステータス更新（管理者または注文所有者のみ）
// ==================================================
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

    // ステータスを更新
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

module.exports = router; // 📦 モジュールとしてエクスポート
