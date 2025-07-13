// utils/getFreshToken.js
import { auth } from "../firebase";

// 🔐 Firebaseの最新トークンを取得するユーティリティ関数
export const getFreshToken = async () => {
  const firebaseUser = auth.currentUser;

  // 👤 ログインユーザーが存在するかチェック
  if (firebaseUser) {
    // 🔄 「true」でトークンを強制リフレッシュして取得
    return await firebaseUser.getIdToken(true);
  }

  // ⚠️ ログインしていない場合は null を返す
  return null;
};
