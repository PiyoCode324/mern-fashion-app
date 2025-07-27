// routes/userRoutes.js

const express = require("express");
const router = express.Router();
const { verifyFirebaseToken } = require("../middleware/authMiddleware");
const adminCheck = require("../middleware/adminCheck");
const User = require("../models/User");
const admin = require("firebase-admin"); // Firebase Admin SDK for user management

// ================================
// User-Related API Routes
// ================================

// ✅ Create User API (POST /api/users)
// Receives uid, name, and email from the frontend and creates a new user in the database.
// If a user with the same uid already exists, it returns that user.
// If the email is already in use by another account, it returns an error.
router.post("/", async (req, res) => {
  const { uid, name, email } = req.body;

  try {
    // 1. Check if a user with the same UID already exists
    let existingUser = await User.findOne({ uid });

    if (existingUser) {
      // Return the existing user (prevents duplicates)
      return res.status(200).json(existingUser);
    }

    // 2. Check for duplicate email
    existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message:
          "This email address is already associated with another account.",
      });
    }

    // 3. Create and save a new user
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

// ================================
// Get Current User API (GET /api/users/me)
// Returns information about the currently logged-in user.
// Authenticates using the Firebase token and retrieves the user from the database.
// Also syncs the role in Firebase custom claims with the role in the DB.
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

    // Sync role between DB and Firebase custom claims if different
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
        `💡 Updating Firebase custom claims for UID: ${user.uid} to role: ${user.role}`
      );
      await admin.auth().setCustomUserClaims(user.uid, { role: user.role });
      console.log("✅ Firebase custom claims updated.");
    } else if (!user.role && currentCustomClaims && currentCustomClaims.role) {
      console.log(
        `💡 Clearing Firebase custom claims for UID: ${user.uid} (no role in DB)`
      );
      await admin.auth().setCustomUserClaims(user.uid, {}); // Clear the role claim
      console.log("✅ Firebase custom claims cleared.");
    } else {
      console.log("ℹ️ Firebase custom claims already up to date.");
    }

    res.json(user);
    console.log("✅ User data sent to frontend.");
  } catch (error) {
    console.error("❌ Error fetching user info:", error);
    res.status(500).json({
      message: "An error occurred while fetching user information.",
      error: error.message,
    });
  }
});

// ================================
// Update Full User Info API (PUT /api/users/:uid)
// Replaces all user information in the DB with the provided data.
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
    console.error("Full user update error:", error);
    res.status(500).json({
      message: "An error occurred while updating user information.",
      error: error.message,
    });
  }
});

// ================================
// Partial User Update API (PATCH /api/users/:uid)
// Updates specific user fields only.
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
    console.error("Partial user update error:", error);
    res.status(500).json({
      message: "An error occurred while updating user data.",
      error: error.message,
    });
  }
});

// Get all users (Admin only)
router.get("/", verifyFirebaseToken, async (req, res) => {
  try {
    const currentUser = await User.findOne({ uid: req.user.uid });

    if (!currentUser || currentUser.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const users = await User.find({}, "name email createdAt role uid"); // Select only needed fields
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

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

// DELETE /api/users/:id - ユーザー削除（管理者専用）
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
