// middleware/verifyFirebaseOnly.js

// 🔐 Firebase IDトークンの検証のみを行うミドルウェア
// ※このミドルウェアは MongoDB との連携は行わず、Firebase 認証のみをチェックする

const admin = require("firebase-admin"); // 初期化済みの Firebase Admin SDK を利用

// ✅ Firebase IDトークンを検証するミドルウェア関数
const verifyFirebaseOnly = async (req, res, next) => {
  // 🔍 リクエストヘッダーから Authorization 情報を取得
  const authHeader = req.headers.authorization;

  // ⚠️ Authorization ヘッダーが存在しない、または "Bearer " で始まっていない場合は未認証として扱う
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // "Bearer xxx" の形式から、実際のトークン部分（xxx）を取り出す
  const token = authHeader.split(" ")[1];

  try {
    // 🔍 Firebase Admin SDK を使って IDトークンを検証・デコードする
    const decoded = await admin.auth().verifyIdToken(token);

    // ✅ トークンが有効であれば、デコードされたユーザー情報を req.user に保存
    console.log("✅ Firebase decoded user:", decoded);
    req.user = decoded;

    // 次のミドルウェアまたはルートハンドラに処理を渡す
    next();
  } catch (error) {
    // ❌ トークンの検証に失敗（期限切れ・改ざん・無効トークンなど）の場合
    console.error("Firebase token verification failed:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
};

// 📦 他のモジュールで使用できるようにエクスポート
module.exports = verifyFirebaseOnly;
