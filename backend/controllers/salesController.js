// controllers/salesController.js

const Order = require("../models/Order");

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

module.exports = {
  getTopSellingProducts,
  getCategorySales, // ← これを追加
};
