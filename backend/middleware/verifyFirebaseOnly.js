// middleware/verifyFirebaseOnly.js
const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// .envからサービスアカウントパスを取得
const serviceAccountPath = process.env.SERVICE_ACCOUNT_KEY_PATH;
const fullPath = path.resolve(serviceAccountPath);

// 初期化（安全に）
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Firebase ID トークンだけ検証するミドルウェア
const verifyFirebaseOnly = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    console.log("✅ Firebase decoded user:", decoded);
    req.user = decoded; // 👈 これでルートと整合
    next();
  } catch (error) {
    console.error("Firebase token verification failed:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = verifyFirebaseOnly;
