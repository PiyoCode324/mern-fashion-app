// middleware/adminCheck.js
// 🔒 このミドルウェアは「管理者ユーザーのみ実行可能」に制限するための処理です。
// 認証処理の後に使うことを想定しています（req.user にログイン中のユーザー情報がある状態）

const adminCheck = (req, res, next) => {
  const user = req.user; // 🔍 認証後に保存されたユーザー情報を取得

  // ✅ ログインしていない（ユーザー情報がない）場合は 401（認証エラー）を返す
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // ❌ 管理者以外のユーザーがアクセスした場合は 403（アクセス拒否）を返す
  if (user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: 管理者権限が必要です" });
  }

  // 👍 管理者ユーザーなら処理を次の関数へ渡す（ルートの処理に進む）
  next();
};

// 📦 他のファイルから使えるようにエクスポート
module.exports = adminCheck;
