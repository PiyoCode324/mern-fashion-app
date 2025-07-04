const admin = require("firebase-admin");

const verifyFirebaseToken = async (req, res, next) => {
  try {
    // Authorization ヘッダーからトークンを取得
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const idToken = authHeader.split(" ")[1];

    // Firebase Admin SDK でトークン検証
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // 検証成功後、reqにユーザー情報をセット
    req.user = decodedToken;

    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

module.exports = { verifyFirebaseToken };
