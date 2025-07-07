// middleware/authMiddleware.js
const admin = require("firebase-admin");
const User = require("../models/User");

// Middleware to validate the Firebase token
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // If the Authorization header does not exist or doesn't start with "Bearer", consider it unauthorized
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    // Extract the ID token from the Authorization header and verify it using Firebase Admin SDK
    const idToken = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Find the user in MongoDB using the Firebase UID
    // Ensure the 'uid' field in the User model matches the Firebase UID
    const mongoUser = await User.findOne({ uid: decodedToken.uid });

    if (!mongoUser) {
      // If the user is authenticated in Firebase but not found in MongoDB, return 404
      console.log(
        `MongoDBにユーザーが見つかりません (Firebase UID: ${decodedToken.uid})。新規ユーザーの可能性があります。`
      );
      return res
        .status(404)
        .json({ message: "Not Found: MongoDB user not found" });
    }

    // Attach the MongoDB user object (including _id) to the request
    req.user = mongoUser;

    next();
  } catch (error) {
    // If token verification fails (invalid, expired, tampered, etc.)
    console.error("Token verification failed:", error);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

module.exports = { verifyFirebaseToken };
