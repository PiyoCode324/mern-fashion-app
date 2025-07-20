// middleware/verifyFirebaseOnly.js
// 🔐 Middleware for validating Firebase ID tokens only
// ※This middleware does not integrate with MongoDB; it only performs authentication checks using Firebase.

const admin = require("firebase-admin"); // Use the initialized Firebase Admin SDK

// ✅ Middleware function to validate Firebase ID tokens
const verifyFirebaseOnly = async (req, res, next) => {
  // 🔍 Retrieve the authorization information from the request header
  const authHeader = req.headers.authorization;

  // ⚠️ If the token is missing or doesn't start with "Bearer", the user is considered unauthenticated
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Extract the token part from "Bearer xxx"
  const token = authHeader.split(" ")[1];

  try {
    // 🔍 Verify and decode the ID token using the Firebase Admin SDK
    const decoded = await admin.auth().verifyIdToken(token);

    // ✅ If the token is valid, attach the decoded user information to req.user
    console.log("✅ Firebase decoded user:", decoded);
    req.user = decoded;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // ❌ Token verification failed (e.g., expired, tampered with, or invalid token)
    console.error("Firebase token verification failed:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
};

// 📦 Export for use in other modules
module.exports = verifyFirebaseOnly;
