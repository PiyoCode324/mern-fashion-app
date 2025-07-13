// routes/userRoutes.js

const express = require("express");
const router = express.Router();
const { verifyFirebaseToken } = require("../middleware/authMiddleware");
const User = require("../models/User");
const admin = require("firebase-admin"); // Firebase Admin SDK を使ってユーザー管理

// ================================
// ユーザー関連APIルート
// ================================

// ✅ ユーザー作成API（POST /api/users）
// フロントからuid, name, emailを受け取り、DBにユーザーを作成します。
// 既にuidが存在する場合はそのユーザーを返し、email重複があればエラー返す。
router.post("/", async (req, res) => {
  const { uid, name, email } = req.body;

  try {
    // 1. UIDで既存ユーザーを検索
    let existingUser = await User.findOne({ uid });

    if (existingUser) {
      // 既存ユーザーがあればそのまま返す（重複作成防止）
      return res.status(200).json(existingUser);
    }

    // 2. UIDがなければメールアドレス重複をチェック
    existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "このメールアドレスは既に他のアカウントで使用されています。",
      });
    }

    // 3. 新規ユーザーを作成してDBに保存
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

// ================================
// 自分のユーザー情報取得API（GET /api/users/me）
// ログイン済みのユーザー本人の情報を返します
// Firebaseトークンで認証し、DBからユーザーを検索。
// Firebaseカスタムクレーム（role）とDBのroleを同期します。
// ================================
router.get("/me", verifyFirebaseToken, async (req, res) => {
  console.log("🚀 GET /api/users/me endpoint hit.");
  console.log("👤 User from token (req.user):", req.user);

  try {
    console.log("Attempting to find user in DB with UID:", req.user.uid);
    const user = await User.findOne({ uid: req.user.uid });
    console.log("Fetched user from DB:", user);

    if (!user) {
      console.log("User not found in DB for UID:", req.user.uid);
      return res.status(404).json({ message: "User not found" });
    }

    // FirebaseのカスタムクレームとDBのロールが異なれば更新する
    const firebaseUserRecord = await admin.auth().getUser(req.user.uid);
    const currentCustomClaims = firebaseUserRecord.customClaims;
    console.log(
      "ℹ️ Current Firebase Custom Claims from record:",
      currentCustomClaims
    );

    if (
      user.role &&
      (!currentCustomClaims || currentCustomClaims.role !== user.role)
    ) {
      console.log(
        `💡 Updating Firebase Custom Claims for UID: ${user.uid} to role: ${user.role}`
      );
      await admin.auth().setCustomUserClaims(user.uid, { role: user.role });
      console.log("✅ Firebase Custom Claims updated.");
    } else if (!user.role && currentCustomClaims && currentCustomClaims.role) {
      console.log(
        `💡 Clearing Firebase Custom Claims for UID: ${user.uid} (no role in DB)`
      );
      await admin.auth().setCustomUserClaims(user.uid, {}); // ロールクレームをクリア
      console.log("✅ Firebase Custom Claims cleared.");
    } else {
      console.log(
        "ℹ️ Firebase Custom Claims already up-to-date or no role defined."
      );
    }

    res.json(user);
    console.log("✅ User data sent to frontend.");
  } catch (error) {
    console.error("❌❌❌ ユーザー情報取得エラー:", error);
    res.status(500).json({
      message: "ユーザー情報の取得中にサーバーエラーが発生しました。",
      error: error.message,
    });
  }
});

// ================================
// ユーザー全体更新API（PUT /api/users/:uid）
// 受け取った情報でDBのユーザー情報をまるごと更新
// ================================
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

// ================================
// ユーザー部分更新API（PATCH /api/users/:uid）
// 一部のフィールドだけ更新する場合に使います
// ================================
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
