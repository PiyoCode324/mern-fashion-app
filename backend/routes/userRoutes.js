// routes/userRoutes.js

const express = require("express");
const router = express.Router();
const { verifyFirebaseToken } = require("../middleware/authMiddleware");
const adminCheck = require("../middleware/adminCheck");
const User = require("../models/User");
const admin = require("firebase-admin"); // Firebase Admin SDK for user管理

// ================================
// 👤 User-Related API Routes
// ================================

// -----------------------------------------
// ✅ Create User API (POST /api/users)
// ・フロントエンドから uid, name, email を受け取り DB に新規ユーザーを作成
// ・既に同じ uid のユーザーが存在する場合は、そのユーザーを返す
// ・email が別ユーザーで使われている場合はエラーを返す
// -----------------------------------------
router.post("/", async (req, res) => {
  const { uid, name, email } = req.body;

  try {
    // 1. UIDで既存ユーザー確認
    let existingUser = await User.findOne({ uid });
    if (existingUser) {
      return res.status(200).json(existingUser); // 重複防止
    }

    // 2. Emailの重複確認
    existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message:
          "This email address is already associated with another account.",
      });
    }

    // 3. 新しいユーザーを作成して保存
    const newUser = new User({ uid, name, email });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error("User registration error:", error);
    res.status(500).json({
      message: "An error occurred while registering the user.",
      error: error.message,
    });
  }
});

// -----------------------------------------
// Get Current User API (GET /api/users/me)
// ・ログイン中のユーザー情報を返す
// ・Firebaseトークンを検証し、DBからユーザーを取得
// ・DB上の role と Firebase の customClaims を同期
// -----------------------------------------
router.get("/me", verifyFirebaseToken, async (req, res) => {
  console.log("🚀 GET /api/users/me endpoint hit.");
  console.log("👤 User from token (req.user):", req.user);

  try {
    // DB からユーザー取得
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Firebase 側の custom claims を取得
    const firebaseUserRecord = await admin.auth().getUser(req.user.uid);
    const currentCustomClaims = firebaseUserRecord.customClaims;

    // DBとFirebaseのroleが異なる場合 → Firebase側を更新
    if (
      user.role &&
      (!currentCustomClaims || currentCustomClaims.role !== user.role)
    ) {
      await admin.auth().setCustomUserClaims(user.uid, { role: user.role });
    }
    // DBにroleがないのにFirebaseにある場合 → Firebase側をクリア
    else if (!user.role && currentCustomClaims && currentCustomClaims.role) {
      await admin.auth().setCustomUserClaims(user.uid, {});
    }

    res.json(user);
  } catch (error) {
    console.error("❌ Error fetching user info:", error);
    res.status(500).json({
      message: "An error occurred while fetching user information.",
      error: error.message,
    });
  }
});

// -----------------------------------------
// Update Full User Info API (PUT /api/users/:uid)
// ・ユーザー情報を丸ごと上書き更新
// -----------------------------------------
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
    console.error("Full user update error:", error);
    res.status(500).json({
      message: "An error occurred while updating user information.",
      error: error.message,
    });
  }
});

// -----------------------------------------
// Partial User Update API (PATCH /api/users/:uid)
// ・特定のフィールドのみ更新
// -----------------------------------------
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
    console.error("Partial user update error:", error);
    res.status(500).json({
      message: "An error occurred while updating user data.",
      error: error.message,
    });
  }
});

// -----------------------------------------
// Get All Users API (GET /api/users)
// ・管理者のみ全ユーザー一覧を取得可能
// -----------------------------------------
router.get("/", verifyFirebaseToken, async (req, res) => {
  try {
    const currentUser = await User.findOne({ uid: req.user.uid });

    if (!currentUser || currentUser.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    // 必要なフィールドだけ返す
    const users = await User.find({}, "name email createdAt role uid");
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// -----------------------------------------
// Update User Role API (PATCH /api/users/:id/role)
// ・管理者のみユーザーの role を変更可能
// -----------------------------------------
router.patch("/:id/role", verifyFirebaseToken, adminCheck, async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    if (!["admin", "user"].includes(role)) {
      return res.status(400).json({ message: "不正なロール指定です。" });
    }

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "ユーザーが見つかりません。" });

    user.role = role;
    await user.save();

    res.json({ message: "ユーザーの権限を更新しました。" });
  } catch (err) {
    console.error("ユーザー権限更新エラー:", err);
    res.status(500).json({ message: "サーバーエラー" });
  }
});

// -----------------------------------------
// Delete User API (DELETE /api/users/:id)
// ・管理者のみユーザー削除可能
// -----------------------------------------
router.delete("/:id", verifyFirebaseToken, adminCheck, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: "ユーザーが見つかりません。" });
    }

    res.json({ message: "ユーザーを削除しました。" });
  } catch (err) {
    console.error("ユーザー削除エラー:", err);
    res.status(500).json({ message: "サーバーエラーが発生しました。" });
  }
});

module.exports = router;
