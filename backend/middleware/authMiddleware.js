// middleware/authMiddleware.js

// 🔐 Firebase認証トークンを検証し、ログイン中のユーザー情報を取得するためのミドルウェア
const admin = require("firebase-admin"); // 🔧 Firebase Admin SDK を使用してトークンを検証
const User = require("../models/User"); // 🗂️ MongoDB からユーザーデータを取得するための User モデルを読み込み

// ✅ Firebase IDトークンを検証するミドルウェア関数
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    // 📥 リクエストヘッダーから "Authorization" フィールドを取得

    // ⚠️ Authorization ヘッダーが存在しない、または "Bearer " で始まっていない場合は拒否（401: Unauthorized）
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized: トークンが見つかりません" });
    }

    // 🔍 "Bearer abc123..." の形式から、実際のトークン部分 ("abc123...") を取り出す
    const idToken = authHeader.split(" ")[1];

    // 🛡️ Firebase Admin SDK を使って、トークンが有効かどうかを検証
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // 🧑 検証済みトークンの UID を使って MongoDB からユーザー情報を検索
    const mongoUser = await User.findOne({ uid: decodedToken.uid });

    // ❌ Firebaseにはユーザーが存在するが、MongoDBには登録がない場合（新規ユーザーなど）は 404 を返す
    if (!mongoUser) {
      console.log(
        `MongoDBにユーザーが見つかりません (Firebase UID: ${decodedToken.uid})。新規ユーザーの可能性があります。`
      );
      return res
        .status(404)
        .json({ message: "Not Found: ユーザー情報が見つかりません" });
    }

    // ✅ トークンが有効で、ユーザーも存在する場合 → req.user にユーザー情報を保存し、次の処理へ進む
    req.user = mongoUser;
    next();
  } catch (error) {
    // 🔐 トークンが無効・期限切れ・改ざんされた場合などは 401 を返す
    console.error("Token verification failed:", error);
    return res
      .status(401)
      .json({ message: "Unauthorized: トークンが無効です" });
  }
};

// 📦 他のファイルで使用できるようにミドルウェアをエクスポート
module.exports = { verifyFirebaseToken };
