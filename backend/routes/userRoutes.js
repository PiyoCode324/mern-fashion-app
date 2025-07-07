// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const { verifyFirebaseToken } = require("../middleware/authMiddleware");
const User = require("../models/User");

// ✅ POST: ユーザー新規作成
router.post("/", async (req, res) => {
  const { uid, name, email } = req.body;

  try {
    // 🔎 1. UIDで既存ユーザーをチェック
    let existingUser = await User.findOne({ uid });

    if (existingUser) {
      // 既存ユーザーがいた場合、そのまま返す
      return res.status(200).json(existingUser);
    }

    // 🔎 2. UIDで見つからなければ、emailで重複チェック
    existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "このメールアドレスは既に他のアカウントで使用されています。",
      });
    }

    // ✅ 3. 新規ユーザーを作成
    const newUser = new User({ uid, name, email });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error("ユーザー登録エラー:", error);
    res.status(500).json({
      message: "ユーザー登録中にサーバーエラーが発生しました。",
      error: error.message,
    });
  }
});

// ✅ GET: 自分のユーザー情報取得
router.get("/me", verifyFirebaseToken, async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) {
      // ★修正箇所: ユーザーが見つからない場合のログを削除またはログレベルを下げる
      // console.log("User not found in DB for UID:", req.user.uid); // この行を削除するか、
      // console.debug("User not found in DB for UID:", req.user.uid); // または console.debug に変更
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("ユーザー情報取得エラー:", error); // これはサーバー側の予期せぬエラーなので残す
    res.status(500).json({
      message: "ユーザー情報の取得中にサーバーエラーが発生しました。",
      error: error.message,
    });
  }
});

// ✅ PUT: ユーザー全体更新
router.put("/:uid", verifyFirebaseToken, async (req, res) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { uid: req.params.uid },
      { $set: req.body },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(updatedUser);
  } catch (error) {
    console.error("ユーザー全体更新エラー:", error);
    res.status(500).json({
      message: "ユーザー全体の更新中にサーバーエラーが発生しました。",
      error: error.message,
    });
  }
});

// ✅ PATCH: ユーザー部分更新
router.patch("/:uid", verifyFirebaseToken, async (req, res) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { uid: req.params.uid },
      { $set: req.body },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(updatedUser);
  } catch (error) {
    console.error("ユーザー部分更新エラー:", error);
    res.status(500).json({
      message: "ユーザー部分の更新中にサーバーエラーが発生しました。",
      error: error.message,
    });
  }
});

module.exports = router;
