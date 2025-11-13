// routes/salesRoutes.js

const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

const { verifyFirebaseToken } = require("../middleware/authMiddleware");
const adminCheck = require("../middleware/adminCheck");
const {
  getTopSellingProducts,
  getCategorySales,
} = require("../controllers/salesController");

// ==============================
// 📌 売上関連のルート定義
// ==============================

// -----------------------------------------
// 日別売上集計（管理者限定）
// ・対象ステータス: "処理中", "発送済み"
// ・日ごとに合計売上(totalSales)と注文数(orderCount)を集計
// -----------------------------------------
router.get("/daily", verifyFirebaseToken, adminCheck, async (req, res) => {
  try {
    const salesData = await Order.aggregate([
      {
        $match: {
          status: { $in: ["処理中", "発送済み"] }, // 集計対象となる注文
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" }, // 年ごと
            month: { $month: "$createdAt" }, // 月ごと
            day: { $dayOfMonth: "$createdAt" }, // 日ごと
          },
          totalSales: { $sum: "$totalPrice" }, // その日の売上合計
          orderCount: { $sum: 1 }, // 注文数
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
          "_id.day": 1, // 日付順に並び替え
        },
      },
    ]);
    res.json(salesData);
  } catch (err) {
    console.error("売上集計エラー:", err);
    res.status(500).json({ message: "売上集計に失敗しました" });
  }
});

// -----------------------------------------
// 月別売上集計（管理者限定）
// ・対象ステータス: "処理中", "発送済み"
// ・月ごとに売上合計(totalSales)と注文数(orderCount)を集計
// -----------------------------------------
router.get("/monthly", verifyFirebaseToken, adminCheck, async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        $match: {
          status: { $in: ["処理中", "発送済み"] }, // 集計対象注文
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" }, // 年ごと
            month: { $month: "$createdAt" }, // 月ごと
          },
          totalSales: { $sum: "$totalPrice" }, // 月の売上合計
          orderCount: { $sum: 1 }, // 月の注文数
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1, // 年月順にソート
        },
      },
    ]);
    res.json(result);
  } catch (err) {
    console.error("Error in /sales/monthly:", err);
    res.status(500).json({ message: "月別売上データの取得に失敗しました" });
  }
});

// -----------------------------------------
// 🔝 人気商品ランキング API（管理者限定）
// ・対象ステータス: "処理中", "発送済み"
// ・各商品ごとに販売数(totalSold)と売上(totalRevenue)を集計
// ・TOP10を返す
// -----------------------------------------
router.get(
  "/top-products",
  verifyFirebaseToken,
  adminCheck,
  getTopSellingProducts, // 追加の前処理（例: ログ用）
  async (req, res) => {
    try {
      const topProducts = await Order.aggregate([
        { $match: { status: { $in: ["処理中", "発送済み"] } } }, // 対象注文
        { $unwind: "$items" }, // items配列を展開（商品ごとに分解）
        {
          $group: {
            _id: "$items.productId", // 商品ごとに集計
            totalSold: { $sum: "$items.quantity" }, // 売れた数量
            totalRevenue: {
              $sum: { $multiply: ["$items.price", "$items.quantity"] }, // 売上金額
            },
          },
        },
        {
          $lookup: {
            from: "products", // 参照コレクション
            localField: "_id", // productId
            foreignField: "_id", // products._id と結合
            as: "product",
          },
        },
        { $unwind: "$product" }, // 商品情報を展開
        { $sort: { totalSold: -1 } }, // 売上数が多い順に並べ替え
        { $limit: 10 }, // TOP10 のみ返す
        {
          $project: {
            _id: 0,
            productId: "$product._id",
            name: "$product.name",
            image: "$product.image", // 商品画像
            totalSold: 1,
            totalRevenue: 1,
          },
        },
      ]);

      res.json(topProducts);
    } catch (err) {
      console.error("Error in /sales/top-products:", err);
      res.status(500).json({ message: "人気商品の取得に失敗しました" });
    }
  }
);

// -----------------------------------------
// カテゴリー別売上割合（管理者限定）
// ・実際の処理は controllers/salesController.js に定義
// -----------------------------------------
router.get(
  "/category-sales",
  verifyFirebaseToken,
  adminCheck,
  getCategorySales
);

module.exports = router;
