// middleware/authMiddleware.js
// 🔐 Firebaseの認証トークンを検証して、ログイン中のユーザー情報を取得するためのミドルウェア

const admin = require("firebase-admin"); // Firebase Admin SDK を使用してトークン検証
const User = require("../models/User"); // MongoDB上のUserモデルを読み込み

// ✅ Firebaseトークンを検証するミドルウェア関数
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization; // リクエストヘッダーから Authorization を取得

    // ⚠️ Authorization ヘッダーが存在しない、または "Bearer " で始まっていない場合は拒否
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized: トークンが見つかりません" });
    }

    // 🔍 トークン部分のみを取り出す（"Bearer abc123..." → "abc123..."）
    const idToken = authHeader.split(" ")[1];

    // 🛡️ Firebase Admin SDK を使ってトークンを検証（有効性・改ざんチェック）
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // 🧑 FirebaseのUIDに基づいてMongoDBに登録されているユーザーを検索
    const mongoUser = await User.findOne({ uid: decodedToken.uid });

    // ❌ Firebase上には存在するが、MongoDBに登録がない場合（新規ユーザーなど）は 404 を返す
    if (!mongoUser) {
      console.log(
        `MongoDBにユーザーが見つかりません (Firebase UID: ${decodedToken.uid})。新規ユーザーの可能性があります。`
      );
      return res
        .status(404)
        .json({ message: "Not Found: ユーザー情報が見つかりません" });
    }

    // ✅ 正常な場合、ユーザー情報を req.user に格納して次の処理へ
    req.user = mongoUser;
    next();
  } catch (error) {
    // 🔐 トークンが無効・期限切れ・改ざんなどで失敗した場合
    console.error("Token verification failed:", error);
    return res
      .status(401)
      .json({ message: "Unauthorized: トークンが無効です" });
  }
};

// 📦 他のファイルでも使えるようにエクスポート
module.exports = { verifyFirebaseToken };
