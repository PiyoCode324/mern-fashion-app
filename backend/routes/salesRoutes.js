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

// 日別売上集計（管理者限定）
router.get("/daily", verifyFirebaseToken, adminCheck, async (req, res) => {
  try {
    const salesData = await Order.aggregate([
      {
        $match: {
          status: { $in: ["処理中", "発送済み"] },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          totalSales: { $sum: "$totalPrice" },
          orderCount: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
          "_id.day": 1,
        },
      },
    ]);
    res.json(salesData);
  } catch (err) {
    console.error("売上集計エラー:", err);
    res.status(500).json({ message: "売上集計に失敗しました" });
  }
});

// 月別売上集計（管理者限定）
router.get("/monthly", verifyFirebaseToken, adminCheck, async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        $match: {
          status: { $in: ["処理中", "発送済み"] },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalSales: { $sum: "$totalPrice" },
          orderCount: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);
    res.json(result);
  } catch (err) {
    console.error("Error in /sales/monthly:", err);
    res.status(500).json({ message: "月別売上データの取得に失敗しました" });
  }
});

// 🔝 人気商品ランキング API（商品ごとの販売数）
router.get(
  "/top-products",
  verifyFirebaseToken,
  adminCheck,
  getTopSellingProducts,
  async (req, res) => {
    try {
      const topProducts = await Order.aggregate([
        { $match: { status: { $in: ["処理中", "発送済み"] } } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            totalSold: { $sum: "$items.quantity" },
            totalRevenue: {
              $sum: { $multiply: ["$items.price", "$items.quantity"] },
            },
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        { $sort: { totalSold: -1 } },
        { $limit: 10 },
        {
          $project: {
            _id: 0,
            productId: "$product._id",
            name: "$product.name",
            image: "$product.image",
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

// カテゴリー別売上割合（管理者限定）
router.get(
  "/category-sales",
  verifyFirebaseToken,
  adminCheck,
  getCategorySales
);

module.exports = router;
