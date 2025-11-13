// controllers/salesController.js

// 📝 Orderモデルを読み込み
//   → MongoDBのordersコレクションに対応するMongooseモデル
//   → 購入履歴や注文情報を操作するために利用
const Order = require("../models/Order");

// ==================================================

// 🔽 人気商品ランキングを取得するコントローラー
// ==================================================
const getTopSellingProducts = async (req, res) => {
  try {
    // MongoDBの集計パイプラインを実行
    const topProducts = await Order.aggregate([
      // 1) items 配列を展開（1つの注文に複数商品がある場合、それぞれ別行として扱う）
      { $unwind: "$items" },
      // 2) 商品ごとに売上数量を合計
      {
        $group: {
          _id: "$items.productId", // 商品IDごとに集計
          totalSold: { $sum: "$items.quantity" }, // 合計販売数
        },
      },
      // 3) products コレクションと結合して商品情報を取得
      {
        $lookup: {
          from: "products", // 対象のコレクション
          localField: "_id", // Order.items の productId
          foreignField: "_id", // Product の _id と紐付け
          as: "productInfo", // 取得結果を productInfo に格納
        },
      },
      // 4) productInfo は配列なので展開して1ドキュメントにする
      { $unwind: "$productInfo" },
      // 5) 必要なフィールドだけを残す
      {
        $project: {
          name: "$productInfo.name", // 商品名
          totalSold: 1, // 合計販売数
        },
      },
      // 6) 売れた数量の降順に並び替え
      { $sort: { totalSold: -1 } },
      // 7) 上位10件のみ取得
      { $limit: 10 },
    ]);

    // 集計結果をレスポンスとして返却
    res.json(topProducts);
  } catch (err) {
    console.error("人気商品の取得に失敗しました:", err);
    res.status(500).json({ message: "人気商品の取得に失敗しました" });
  }
};

// ==================================================
// 🔽 カテゴリー別の売上集計を取得するコントローラー
// ==================================================
const getCategorySales = async (req, res) => {
  try {
    const result = await Order.aggregate([
      // 1) items 配列を展開
      { $unwind: "$items" },
      // 2) products コレクションと結合し、商品情報を取得
      {
        $lookup: {
          from: "products",
          localField: "items.productId", // 注文内の商品ID
          foreignField: "_id", // Product のIDと紐付け
          as: "productInfo",
        },
      },
      // 3) productInfo を展開
      { $unwind: "$productInfo" },
      // 4) 商品のカテゴリーごとに売上合計を計算
      {
        $group: {
          _id: "$productInfo.category", // カテゴリー単位で集計
          totalSales: {
            $sum: {
              // 数量 × 単価 で売上額を算出
              $multiply: ["$items.quantity", "$items.price"],
            },
          },
        },
      },
      // 5) 出力形式を整える
      {
        $project: {
          category: "$_id", // カテゴリー名
          totalSales: 1, // 合計売上
          _id: 0, // MongoDBの内部IDは不要
        },
      },
      // 6) 売上の高い順に並び替え
      { $sort: { totalSales: -1 } },
    ]);

    res.json(result);
  } catch (err) {
    console.error("カテゴリー別売上取得エラー:", err);
    res.status(500).json({ message: "カテゴリー別売上の取得に失敗しました" });
  }
};

// ==================================================
// 🔽 月別売上集計を取得するコントローラー
// ==================================================
const getMonthlySales = async (req, res) => {
  try {
    const result = await Order.aggregate([
      // 1) createdAt から年月ごとにグループ化
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" }, // 年
            month: { $month: "$createdAt" }, // 月
          },
          totalSales: { $sum: "$totalPrice" }, // 月ごとの売上合計
        },
      },
      // 2) 年月の昇順でソート（古い順に並ぶ）
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json(result);
  } catch (err) {
    console.error("月別売上取得エラー:", err);
    res.status(500).json({ message: "月別売上の取得に失敗しました" });
  }
};

// ==================================================
// 🔽 モジュールとしてエクスポート
// ==================================================
module.exports = {
  getTopSellingProducts, // 人気商品ランキング
  getCategorySales, // カテゴリー別売上集計
  getMonthlySales, // 月別売上集計
};
