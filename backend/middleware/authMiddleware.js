// middleware/authMiddleware.js

// 🔐 Middleware for verifying Firebase authentication tokens and retrieving logged-in user information.
const admin = require("firebase-admin"); // 🔧 Token validation using the Firebase Admin SDK
const User = require("../models/User"); // 🗂️ Load the User model from MongoDB

// ✅ Middleware function to validate Firebase ID tokens
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization; // 📥 Get the Authorization header from the request

    // ⚠️ Reject if the Authorization header is missing or doesn't start with "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized: トークンが見つかりません" });
    }

    // 🔍 Extract the token part ("Bearer abc123..." → "abc123...")
    const idToken = authHeader.split(" ")[1];

    // 🛡️ Verify the token's validity using the Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // 🧑 Look up the user in MongoDB using the UID from the decoded token
    const mongoUser = await User.findOne({ uid: decodedToken.uid });

    // ❌ If the user exists in Firebase but not in MongoDB, return 404 (e.g., new user not yet registered)
    if (!mongoUser) {
      console.log(
        `MongoDBにユーザーが見つかりません (Firebase UID: ${decodedToken.uid})。新規ユーザーの可能性があります。`
      );
      return res
        .status(404)
        .json({ message: "Not Found: ユーザー情報が見つかりません" });
    }

    // ✅ Token and user are valid → attach user info to req.user and proceed
    req.user = mongoUser;
    next();
  } catch (error) {
    // 🔐 If the token is invalid, expired, or tampered with, return 401
    console.error("Token verification failed:", error);
    return res
      .status(401)
      .json({ message: "Unauthorized: トークンが無効です" });
  }
};

// 📦 Export the middleware for use in other files
module.exports = { verifyFirebaseToken };
