require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://mern-fashion-app-frontend.onrender.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

const Product = require("./models/Product"); // mongooseのモデル

// MongoDB接続
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// 商品一覧API
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Error fetching products" });
  }
});

// 商品を追加するAPI
app.post("/api/products", async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error("Error saving product:", err.message, err.errors);
    res.status(500).json({ message: "Error saving product" });
  }
});

// 商品詳細取得API（idで1件取得）
app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// 商品情報を更新するAPI
app.put("/api/products/:id", async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating product" });
  }
});

// 商品を削除するAPI
app.delete("/api/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "商品を削除しました" });
  } catch (error) {
    res.status(500).json({ message: "削除に失敗しました" });
  }
});

// サーバー起動
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
