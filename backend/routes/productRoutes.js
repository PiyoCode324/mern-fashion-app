// routes/productRoutes.js
const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { verifyFirebaseToken } = require("../middleware/authMiddleware");

// 🔽 商品の新規作成（createdByにユーザーIDを紐づけ）
router.post("/", verifyFirebaseToken, async (req, res) => {
  try {
    const { name, category, description, imageUrl, price } = req.body;

    const product = new Product({
      name,
      category,
      description,
      imageUrl,
      price,
      createdBy: req.user._id, // 🔐 ミドルウェアから注入されたMongoDBユーザーID
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error("商品登録エラー:", err);
    res.status(500).json({ message: "商品登録に失敗しました。" });
  }
});

router.get("/", async (req, res) => {
  try {
    const products = await Product.find().populate({
      path: "createdBy",
      select: "name", // MongoDBのUserスキーマの「name（=displayName）」だけ取得
    });
    res.json(products);
  } catch (err) {
    console.error("商品一覧取得エラー:", err);
    res.status(500).json({ message: "商品一覧取得に失敗しました" });
  }
});

module.exports = router;
