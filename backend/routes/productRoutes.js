// routes/productRoutes.js

const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { verifyFirebaseToken } = require("../middleware/authMiddleware");
const adminCheck = require("../middleware/adminCheck"); // Middleware to check for admin privileges
const Order = require("../models/Order");

// ✅ Public: Get all products (accessible to anyone)
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("createdBy", "name")
      .populate("reviews.user", "name"); // ✅ これを追加！

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error("Error fetching product details:", err);
    res.status(500).json({ message: "Failed to fetch product details" });
  }
});

// 📌 Create a new product (only available to logged-in users)
router.post("/", verifyFirebaseToken, async (req, res) => {
  try {
    // Receive product data from frontend
    const { name, category, description, imageUrl, price, countInStock } =
      req.body;

    // Create a new Product instance
    const product = new Product({
      name,
      category,
      description,
      imageUrl,
      price,
      countInStock: countInStock ?? 0, // Defaults to 0 if not provided
      createdBy: req.user._id, // Assign current user as the creator
    });

    await product.save(); // Save product to DB
    res.status(201).json(product); // Return the newly created product
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ message: "Failed to create product" });
  }
});

// ✅ Admin only: Get all products (for admin panel)
router.get("/admin", verifyFirebaseToken, adminCheck, async (req, res) => {
  try {
    // Controlled by adminCheck middleware
    const products = await Product.find().populate({
      path: "createdBy",
      select: "name", // Show creator name
    });
    res.json(products);
  } catch (err) {
    console.error("Error fetching admin product list:", err);
    res.status(500).json({ message: "Failed to fetch product list" });
  }
});

// 📌 Get all products created by the logged-in user
router.get("/mine", verifyFirebaseToken, async (req, res) => {
  try {
    // Filter products by creator ID (current user)
    const products = await Product.find({ createdBy: req.user._id });
    res.json(products);
  } catch (err) {
    console.error("Error fetching user's own products:", err);
    res.status(500).json({ message: "Failed to fetch your products" });
  }
});

// 📌 Delete a product (only the creator can delete)
router.delete("/:id", verifyFirebaseToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Only the creator is allowed to delete
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

// 📌 Get detailed product info (publicly accessible)
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "createdBy",
      "name"
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    console.error("Error fetching product details:", err);
    res.status(500).json({ message: "Failed to fetch product details" });
  }
});

// 📌 Update a product (only the creator can update)
router.put("/:id", verifyFirebaseToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ✅ 管理者 or 作成者 のみ許可
    const isAdmin = req.user.role === "admin";
    const isCreator = product.createdBy.toString() === req.user._id.toString();
    if (!isAdmin && !isCreator) {
      return res
        .status(403)
        .json({ message: "You do not have permission to edit this product" });
    }
    // Update product fields
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

// 📌 Update product stock (only available to admins or the creator)
router.patch("/:id/stock", verifyFirebaseToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if the user is either an admin or the product creator
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

// 📌 レビュー追加エンドポイント
router.post("/:id/reviews", verifyFirebaseToken, async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "商品が見つかりません。" });
    }

    // ユーザーが既にレビューしているか確認
    const alreadyReviewed = product.reviews?.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: "既にレビュー済みです。" });
    }

    const newReview = {
      name: req.user.name || "匿名",
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    // 配列がなければ初期化
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

// 購入済み判定API
router.get("/:id/hasPurchased", verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const productId = req.params.id;

    const orders = await Order.find({
      userUid: userId,
      status: { $ne: "キャンセル" }, // キャンセル以外
      "items.productId": productId, // 注文内に対象商品あり
    });

    const hasPurchased = orders.length > 0;
    res.json({ hasPurchased });
  } catch (error) {
    console.error("購入済み判定エラー:", error);
    res.status(500).json({ message: "購入履歴の取得に失敗しました" });
  }
});

module.exports = router;
