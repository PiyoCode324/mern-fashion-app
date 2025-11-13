// routes/productRoutes.js

const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { verifyFirebaseToken } = require("../middleware/authMiddleware");
const adminCheck = require("../middleware/adminCheck");
const Order = require("../models/Order");

// ===============================
// 商品関連ルート定義
// ===============================

// ✅ 管理者のみ：全商品の取得（管理者用ダッシュボード）
router.get("/admin", verifyFirebaseToken, adminCheck, async (req, res) => {
  try {
    console.log("DEBUG: GET /api/products/admin (管理者用商品一覧)");
    // 作成者のユーザー名も取得
    const products = await Product.find().populate({
      path: "createdBy",
      select: "name",
    });
    res.json(products);
  } catch (err) {
    console.error("Error fetching admin product list:", err);
    res.status(500).json({ message: "Failed to fetch product list" });
  }
});

// ✅ ログインユーザー自身が作成した商品を取得
router.get("/mine", verifyFirebaseToken, async (req, res) => {
  try {
    console.log("DEBUG: GET /api/products/mine (ユーザー作成商品)");
    const products = await Product.find({ createdBy: req.user._id });
    res.json(products);
  } catch (err) {
    console.error("Error fetching user's own products:", err);
    res.status(500).json({ message: "Failed to fetch your products" });
  }
});

// ✅ 公開：すべての商品を取得（ログイン不要）
router.get("/", async (req, res) => {
  try {
    console.log("DEBUG: GET /api/products (すべての商品)");
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    console.error("Error fetching all products:", err);
    res.status(500).json({ message: "Failed to fetch all products" });
  }
});

// ✅ 公開：ID で商品を取得（詳細ページ表示など）
router.get("/:id", async (req, res) => {
  try {
    console.log(`DEBUG: GET /api/products/${req.params.id} (個別商品詳細)`);
    const product = await Product.findById(req.params.id)
      .populate("createdBy", "name")
      .populate("reviews.user", "name");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    console.error("Error fetching product details:", err);
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    res.status(500).json({ message: "Failed to fetch product details" });
  }
});

// ===============================
// CRUD 操作
// ===============================

// 📌 商品作成（ログイン必須）
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
      countInStock: countInStock ?? 0, // 未指定なら 0
      createdBy: req.user._id, // 作成者をログイン中ユーザーに紐付け
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ message: "Failed to create product" });
  }
});

// 📌 商品削除（作成者本人のみ可能）
router.delete("/:id", verifyFirebaseToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    // 作成者でない場合は削除不可
    if (product.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You do not have permission to delete this product" });
    }

    await product.deleteOne();
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

// 📌 商品更新（作成者または管理者のみ可能）
router.put("/:id", verifyFirebaseToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const isAdmin = req.user.role === "admin";
    const isCreator = product.createdBy.toString() === req.user._id.toString();

    if (!isAdmin && !isCreator) {
      return res
        .status(403)
        .json({ message: "You do not have permission to edit this product" });
    }

    // 更新対象フィールド
    const { name, category, description, imageUrl, price } = req.body;
    product.name = name;
    product.category = category;
    product.description = description;
    product.imageUrl = imageUrl;
    product.price = price;

    await product.save();
    res.status(200).json(product);
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ message: "Failed to update product" });
  }
});

// 📌 在庫数更新（作成者または管理者のみ可能）
router.patch("/:id/stock", verifyFirebaseToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const isAdmin = req.user.role === "admin";
    const isCreator = product.createdBy?.toString() === req.user._id.toString();
    if (!isAdmin && !isCreator) {
      return res.status(403).json({
        message: "You do not have permission to update this product's stock",
      });
    }

    let { countInStock } = req.body;
    countInStock = parseInt(countInStock);
    if (isNaN(countInStock) || countInStock < 0) {
      return res.status(400).json({
        message: "Please provide a valid stock count (integer ≥ 0)",
      });
    }

    product.countInStock = countInStock;
    await product.save();

    res.status(200).json({ message: "Stock updated successfully", product });
  } catch (err) {
    console.error("Error updating stock:", err);
    res.status(500).json({ message: "Failed to update stock" });
  }
});

// ===============================
// レビュー関連
// ===============================

// 📌 商品にレビューを追加（ユーザー1人につき1回まで）
router.post("/:id/reviews", verifyFirebaseToken, async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "商品が見つかりません。" });
    }

    // 同一ユーザーが既にレビューしているか確認
    const alreadyReviewed = product.reviews?.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).json({ message: "既にレビュー済みです。" });
    }

    // 新規レビュー作成
    const newReview = {
      name: req.user.name || "匿名",
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    if (!product.reviews) product.reviews = [];

    product.reviews.push(newReview);
    product.numReviews = product.reviews.length;
    product.averageRating =
      product.reviews.reduce((acc, r) => r.rating + acc, 0) /
      product.reviews.length;

    await product.save();

    res.status(201).json({ message: "レビューを追加しました。" });
  } catch (err) {
    console.error("レビュー追加エラー:", err);
    res.status(500).json({ message: "レビュー追加に失敗しました。" });
  }
});

// ===============================
// 購入済み判定
// ===============================

// 📌 ユーザーが商品を購入したことがあるか確認
router.get("/:id/hasPurchased", verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const productId = req.params.id;

    const orders = await Order.find({
      userUid: userId,
      status: { $ne: "キャンセル" }, // キャンセル済み注文は除外
      "items.productId": productId,
    });

    const hasPurchased = orders.length > 0;
    res.json({ hasPurchased });
  } catch (error) {
    console.error("購入済み判定エラー:", error);
    res.status(500).json({ message: "購入履歴の取得に失敗しました" });
  }
});

module.exports = router;
