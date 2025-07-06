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

// 🔐 商品削除（作成者のみ削除可能）
router.delete("/:id", verifyFirebaseToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "商品が見つかりません" });
    }

    // 作成者チェック
    if (product.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "この商品を削除する権限がありません" });
    }

    await product.deleteOne();
    res.status(200).json({ message: "商品を削除しました" });
  } catch (err) {
    console.error("商品削除エラー:", err);
    res.status(500).json({ message: "商品削除に失敗しました" });
  }
});

// 🔍 商品詳細取得（createdBy.name を含める）
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "createdBy",
      "name"
    );
    if (!product) {
      return res.status(404).json({ message: "商品が見つかりません" });
    }
    res.json(product);
  } catch (err) {
    console.error("商品詳細取得エラー:", err);
    res.status(500).json({ message: "商品取得に失敗しました" });
  }
});

// ✏️ 商品編集（作成者のみ可能）
router.put("/:id", verifyFirebaseToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "商品が見つかりません" });
    }

    // 作成者チェック
    if (product.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "この商品を編集する権限がありません" });
    }

    const { name, category, description, imageUrl, price } = req.body;

    // フィールド更新
    product.name = name;
    product.category = category;
    product.description = description;
    product.imageUrl = imageUrl;
    product.price = price;

    await product.save();
    res.status(200).json(product);
  } catch (err) {
    console.error("商品更新エラー:", err);
    res.status(500).json({ message: "商品更新に失敗しました" });
  }
});

module.exports = router;
