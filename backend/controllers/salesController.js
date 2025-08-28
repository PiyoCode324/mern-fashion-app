// controllers/salesController.js

const Order = require("../models/Order");

// 🔽 人気商品ランキング
const getTopSellingProducts = async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalSold: { $sum: "$items.quantity" },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $project: {
          name: "$productInfo.name",
          totalSold: 1,
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);
    res.json(topProducts);
  } catch (err) {
    console.error("人気商品の取得に失敗しました:", err);
    res.status(500).json({ message: "人気商品の取得に失敗しました" });
  }
};

// 🔽 カテゴリー別売上集計
const getCategorySales = async (req, res) => {
  try {
    const result = await Order.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $group: {
          _id: "$productInfo.category",
          totalSales: {
            $sum: {
              $multiply: ["$items.quantity", "$items.price"],
            },
          },
        },
      },
      {
        $project: {
          category: "$_id",
          totalSales: 1,
          _id: 0,
        },
      },
      { $sort: { totalSales: -1 } },
    ]);

    res.json(result);
  } catch (err) {
    console.error("カテゴリー別売上取得エラー:", err);
    res.status(500).json({ message: "カテゴリー別売上の取得に失敗しました" });
  }
};

// 🔽 月別売上集計
const getMonthlySales = async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalSales: { $sum: "$totalPrice" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);
    res.json(result);
  } catch (err) {
    console.error("月別売上取得エラー:", err);
    res.status(500).json({ message: "月別売上の取得に失敗しました" });
  }
};

module.exports = {
  getTopSellingProducts,
  getCategorySales,
  getMonthlySales, // ← 追加
};
