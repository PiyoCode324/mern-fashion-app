// routes/productRoutes.js
const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { verifyFirebaseToken } = require("../middleware/authMiddleware");
const adminCheck = require("../middleware/adminCheck"); // 管理者チェックミドルウェア

// ---

// ✅ 一般ユーザー向け: 全商品を取得するルート (誰でも閲覧可能)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({}).populate("createdBy", "name"); // ⭐ ここに populate を追加 ⭐
    res.json(products);
  } catch (err) {
    console.error("一般向け商品一覧取得エラー:", err);
    res.status(500).json({ message: "商品一覧取得に失敗しました" });
  }
});

// ---

// 📌 Create a new product (only accessible to authenticated users)
router.post("/", verifyFirebaseToken, async (req, res) => {
  try {
    const { name, category, description, imageUrl, price, countInStock } =
      req.body;

    const product = new Product({
      name,
      category,
      description,
      imageUrl,
      price,
      countInStock: countInStock ?? 0, // 初期在庫がなければ0
      createdBy: req.user._id,
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error("商品登録エラー:", err);
    res.status(500).json({ message: "商品登録に失敗しました。" });
  }
});

// ---

// ✅ 管理者専用: 全商品を取得するルート (管理者用ダッシュボードなどで利用)
// パスを `/admin` などに変更し、管理者のチェックを継続
router.get("/admin", verifyFirebaseToken, adminCheck, async (req, res) => {
  try {
    const products = await Product.find().populate({
      path: "createdBy",
      select: "name", // 作成者名も取得
    });
    res.json(products);
  } catch (err) {
    console.error("管理者向け商品一覧取得エラー:", err);
    res.status(500).json({ message: "商品一覧取得に失敗しました" });
  }
});

// ---

// 📌 作成者専用: 自分の商品一覧取得
router.get("/mine", verifyFirebaseToken, async (req, res) => {
  try {
    const products = await Product.find({ createdBy: req.user._id });
    res.json(products);
  } catch (err) {
    console.error("自分の商品取得エラー:", err);
    res.status(500).json({ message: "自分の商品取得に失敗しました" });
  }
});

// ---

// 📌 Delete a product (only the creator can delete)
router.delete("/:id", verifyFirebaseToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "商品が見つかりません" });
    }

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

// ---

// 📌 Get detailed information about a single product (誰でも閲覧可能)
// このルートも通常は認証不要
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "createdBy",
      "name"
    ); // 作成者名は詳細ページでは表示しても良い
    if (!product) {
      return res.status(404).json({ message: "商品が見つかりません" });
    }
    res.json(product);
  } catch (err) {
    console.error("商品詳細取得エラー:", err);
    res.status(500).json({ message: "商品取得に失敗しました" });
  }
});

// ---

// 📌 Edit a product (only the creator can edit)
router.put("/:id", verifyFirebaseToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "商品が見つかりません" });
    }

    if (product.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "この商品を編集する権限がありません" });
    }

    const { name, category, description, imageUrl, price } = req.body;

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

// ---

// 📌 Update countInStock (Only admin or product creator)
router.patch("/:id/stock", verifyFirebaseToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "商品が見つかりません" });
    }

    const isAdmin = req.user.role === "admin";
    const isCreator = product.createdBy?.toString() === req.user._id.toString();

    if (!isAdmin && !isCreator) {
      return res
        .status(403)
        .json({ message: "この商品の在庫を変更する権限がありません" });
    }

    let { countInStock } = req.body;
    countInStock = parseInt(countInStock);
    if (isNaN(countInStock) || countInStock < 0) {
      return res
        .status(400)
        .json({ message: "countInStockは0以上の整数で入力してください" });
    }

    product.countInStock = countInStock;
    await product.save();

    res.status(200).json({ message: "在庫を更新しました", product });
  } catch (err) {
    console.error("在庫更新エラー:", err);
    res.status(500).json({ message: "在庫更新に失敗しました" });
  }
});

module.exports = router;
