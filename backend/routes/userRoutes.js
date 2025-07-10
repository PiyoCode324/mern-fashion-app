// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const { verifyFirebaseToken } = require("../middleware/authMiddleware");
const User = require("../models/User");

// ✅ POST: Create a new user
router.post("/", async (req, res) => {
  const { uid, name, email } = req.body;

  try {
    // 🔎 1. Check for existing user by UID
    let existingUser = await User.findOne({ uid });

    if (existingUser) {
      // If there is an existing user, return it as is
      return res.status(200).json(existingUser);
    } // 🔎 2. If no user found by UID, check for duplicate email.

    existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "このメールアドレスは既に他のアカウントで使用されています。",
      });
    } // ✅ 3. Create a new user

    const newUser = new User({ uid, name, email });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    // Log and response when an error occurs during user registration
    console.error("ユーザー登録エラー:", error);
    res.status(500).json({
      message: "ユーザー登録中にサーバーエラーが発生しました。",
      error: error.message,
    });
  }
});

// ✅ GET: Get your user information
router.get("/me", verifyFirebaseToken, async (req, res) => {
  // 📌 追加: /meエンドポイントへのリクエスト到達を示すログ
  console.log("🚀 GET /api/users/me endpoint hit."); // 📌 追加: Firebaseトークンからデコードされたユーザー情報
  console.log("👤 User from token (req.user):", req.user);

  try {
    // 📌 追加: データベースからユーザーを検索する前
    console.log("Attempting to find user in DB with UID:", req.user.uid);
    const user = await User.findOne({ uid: req.user.uid });
    // 📌 追加: データベースから取得したユーザー情報
    console.log("Fetched user from DB:", user);

    if (!user) {
      // If the user does not exist in the database, return 404.
      // Do not need logs or lower the log level
      // 📌 追加: ユーザーがDBに見つからない場合
      console.log("User not found in DB for UID:", req.user.uid);
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
    // 📌 追加: ユーザーデータがフロントエンドに送信されたことを示すログ
    console.log("✅ User data sent to frontend.");
  } catch (error) {
    // Logs and responses when unexpected server errors occur
    // 📌 修正: エラーログを強調
    console.error("❌❌❌ ユーザー情報取得エラー:", error);
    res.status(500).json({
      message: "ユーザー情報の取得中にサーバーエラーが発生しました。",
      error: error.message,
    });
  }
});

// ✅ PUT: Update entire user
router.put("/:uid", verifyFirebaseToken, async (req, res) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { uid: req.params.uid },
      { $set: req.body },
      { new: true }
    );
    if (!updatedUser) {
      // If the user to be updated does not exist
      return res.status(404).json({ message: "User not found" });
    }
    res.json(updatedUser);
  } catch (error) {
    // Handling server errors during update processing
    console.error("ユーザー全体更新エラー:", error);
    res.status(500).json({
      message: "ユーザー全体の更新中にサーバーエラーが発生しました。",
      error: error.message,
    });
  }
});

// ✅ PATCH: partial user update
router.patch("/:uid", verifyFirebaseToken, async (req, res) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { uid: req.params.uid },
      { $set: req.body },
      { new: true }
    );
    if (!updatedUser) {
      // If the user to be partially updated does not exist
      return res.status(404).json({ message: "User not found" });
    }
    res.json(updatedUser);
  } catch (error) {
    // Handling server errors during partial update processing
    console.error("ユーザー部分更新エラー:", error);
    res.status(500).json({
      message: "ユーザー部分の更新中にサーバーエラーが発生しました。",
      error: error.message,
    });
  }
});

module.exports = router;
