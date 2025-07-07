// routes/productRoutes.js
const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { verifyFirebaseToken } = require("../middleware/authMiddleware");

// 📌 Create a new product (only accessible to authenticated users)
// The creator's MongoDB user ID is set via middleware and stored in the createdBy field
router.post("/", verifyFirebaseToken, async (req, res) => {
  try {
    const { name, category, description, imageUrl, price } = req.body;

    const product = new Product({
      name,
      category,
      description,
      imageUrl,
      price,
      createdBy: req.user._id, // Authenticated user's MongoDB _id
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error("商品登録エラー:", err);
    res.status(500).json({ message: "商品登録に失敗しました。" });
  }
});

// 📌 Get all products
// Each product includes the creator’s name using populate
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().populate({
      path: "createdBy",
      select: "name", // Only retrieve the "name" field from the User model
    });
    res.json(products);
  } catch (err) {
    console.error("商品一覧取得エラー:", err);
    res.status(500).json({ message: "商品一覧取得に失敗しました" });
  }
});

// 📌 Delete a product (only the creator can delete)
// Authenticated user must match the product's creator
router.delete("/:id", verifyFirebaseToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "商品が見つかりません" });
    }

    // Check if the creator and current user match (convert to string and compare)
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

// 📌 Get detailed information about a single product
// Includes creator's name via populate
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

// 📌 Edit a product (only the creator can edit)
// Authenticated user must match the product's creator
router.put("/:id", verifyFirebaseToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "商品が見つかりません" });
    }

    // Check if it matches the creator ID
    if (product.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "この商品を編集する権限がありません" });
    }

    const { name, category, description, imageUrl, price } = req.body;

    // Update product information
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
