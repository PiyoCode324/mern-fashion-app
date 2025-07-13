// routes/productRoutes.js

const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { verifyFirebaseToken } = require("../middleware/authMiddleware");
const adminCheck = require("../middleware/adminCheck"); // 管理者チェックミドルウェア

// ✅ 一般ユーザー向け: 全商品を取得するルート (誰でも見れるよ)
router.get("/", async (req, res) => {
  try {
    // 商品一覧をDBから取得し、作成者の名前も取得(populateでリレーションを張る)
    const products = await Product.find({}).populate("createdBy", "name");
    res.json(products); // JSONで返すよ
  } catch (err) {
    console.error("一般向け商品一覧取得エラー:", err);
    res.status(500).json({ message: "商品一覧取得に失敗しました" });
  }
});

// ---
// 📌 新しい商品を作るAPI (ログイン済みユーザーだけ使える)
router.post("/", verifyFirebaseToken, async (req, res) => {
  try {
    // フロントから送られてきた商品情報を受け取る
    const { name, category, description, imageUrl, price, countInStock } =
      req.body;

    // 新しいProductインスタンスを作成
    const product = new Product({
      name,
      category,
      description,
      imageUrl,
      price,
      countInStock: countInStock ?? 0, // 在庫がなければ0にするよ
      createdBy: req.user._id, // ログインユーザーIDを登録者としてセット
    });

    await product.save(); // DBに保存
    res.status(201).json(product); // 作成した商品を返す
  } catch (err) {
    console.error("商品登録エラー:", err);
    res.status(500).json({ message: "商品登録に失敗しました。" });
  }
});

// ---
// ✅ 管理者専用: 全商品を取得するルート（管理画面用）
router.get("/admin", verifyFirebaseToken, adminCheck, async (req, res) => {
  try {
    // 管理者だけが使えるのでadminCheckミドルウェアで制御済み
    const products = await Product.find().populate({
      path: "createdBy",
      select: "name", // 作成者名を表示
    });
    res.json(products);
  } catch (err) {
    console.error("管理者向け商品一覧取得エラー:", err);
    res.status(500).json({ message: "商品一覧取得に失敗しました" });
  }
});

// ---
// 📌 自分が作った商品の一覧を取得する（ログインユーザー専用）
router.get("/mine", verifyFirebaseToken, async (req, res) => {
  try {
    // ログインユーザーのIDで商品を絞り込み
    const products = await Product.find({ createdBy: req.user._id });
    res.json(products);
  } catch (err) {
    console.error("自分の商品取得エラー:", err);
    res.status(500).json({ message: "自分の商品取得に失敗しました" });
  }
});

// ---
// 📌 商品削除（作成者だけが削除可能）
router.delete("/:id", verifyFirebaseToken, async (req, res) => {
  try {
    // 削除対象の商品を取得
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "商品が見つかりません" });
    }

    // 作成者とログインユーザーを比較して権限チェック
    if (product.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "この商品を削除する権限がありません" });
    }

    await product.deleteOne(); // 削除
    res.status(200).json({ message: "商品を削除しました" });
  } catch (err) {
    console.error("商品削除エラー:", err);
    res.status(500).json({ message: "商品削除に失敗しました" });
  }
});

// ---
// 📌 商品の詳細情報取得（誰でも見れる）
router.get("/:id", async (req, res) => {
  try {
    // 指定IDの商品を取得、作成者名も一緒に取得
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

// ---
// 📌 商品情報の編集（作成者だけが編集可能）
router.put("/:id", verifyFirebaseToken, async (req, res) => {
  try {
    // 編集対象の商品を取得
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

    // 送られてきた更新情報をセット
    const { name, category, description, imageUrl, price } = req.body;
    product.name = name;
    product.category = category;
    product.description = description;
    product.imageUrl = imageUrl;
    product.price = price;

    await product.save(); // DB保存
    res.status(200).json(product);
  } catch (err) {
    console.error("商品更新エラー:", err);
    res.status(500).json({ message: "商品更新に失敗しました" });
  }
});

// ---
// 📌 在庫数更新（管理者か作成者だけ可能）
router.patch("/:id/stock", verifyFirebaseToken, async (req, res) => {
  try {
    // 対象商品取得
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "商品が見つかりません" });
    }

    // 管理者か作成者かチェック
    const isAdmin = req.user.role === "admin";
    const isCreator = product.createdBy?.toString() === req.user._id.toString();
    if (!isAdmin && !isCreator) {
      return res
        .status(403)
        .json({ message: "この商品の在庫を変更する権限がありません" });
    }

    // 送られた在庫数を整数に変換し、0以上かチェック
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
