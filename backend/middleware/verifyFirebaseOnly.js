// middleware/verifyFirebaseOnly.js
// 🔐 FirebaseのIDトークンだけを検証するためのミドルウェア
// ※このミドルウェアではMongoDBとの連携は行わず、Firebaseの認証確認のみを行います

const admin = require("firebase-admin"); // Firebase Admin SDK（初期化済みインスタンス）を使用

// ✅ Firebase IDトークンを検証するミドルウェア関数
const verifyFirebaseOnly = async (req, res, next) => {
  // 🔍 リクエストヘッダーから認証情報（Authorization）を取得
  const authHeader = req.headers.authorization;

  // ⚠️ トークンが存在しない、または"Bearer "で始まらない場合は未認証とする
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // "Bearer xxx" からトークン部分だけ取り出す
  const token = authHeader.split(" ")[1];

  try {
    // 🔍 Firebase Admin SDKを使ってIDトークンの内容を検証・デコード
    const decoded = await admin.auth().verifyIdToken(token);

    // ✅ トークンが正しければ、デコードされたユーザー情報をreq.userにセット
    console.log("✅ Firebase decoded user:", decoded);
    req.user = decoded;

    // 次の処理へ
    next();
  } catch (error) {
    // ❌ トークンの検証に失敗（期限切れ・改ざん・不正トークンなど）
    console.error("Firebase token verification failed:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
};

// 📦 他ファイルから使えるようにエクスポート
module.exports = verifyFirebaseOnly;
