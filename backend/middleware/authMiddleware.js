// middleware/authMiddleware.js
const admin = require("firebase-admin");
const User = require("../models/User"); // Userモデルへのパスが正しいことを再確認してください

const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // 認証トークンが提供されていない、または形式が不正な場合
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const idToken = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // 🔽 Firebase UID から MongoDB ユーザーを探す
    // ここでMongoDBのUserモデルに保存しているフィールド名を確認してください。
    // 以前のroutes/userRoutes.jsでは 'uid' を使用していました。
    const mongoUser = await User.findOne({ uid: decodedToken.uid }); // または { firebaseUid: decodedToken.uid }

    if (!mongoUser) {
      // ✅ ここを修正！ユーザーはFirebaseで認証されたが、MongoDBにまだ存在しない場合
      // フロントエンドは404を期待しています。
      console.log(
        `MongoDBにユーザーが見つかりません (Firebase UID: ${decodedToken.uid})。新規ユーザーの可能性があります。`
      );
      return res
        .status(404) // ⭐ ここを404に変更！
        .json({ message: "Not Found: MongoDB user not found" }); // メッセージも404向けに調整
    }

    req.user = mongoUser; // ✅ MongoDBユーザー（_id含む）をセット！
    console.log("ログイン中のMongoDBユーザー:", req.user);
    next();
  } catch (error) {
    // Firebaseトークンの検証自体に失敗した場合 (期限切れ、無効、改ざんなど)
    console.error("Token verification failed:", error);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

module.exports = { verifyFirebaseToken };
