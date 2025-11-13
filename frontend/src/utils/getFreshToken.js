// utils/getFreshToken.js
import { auth } from "../firebase";

/**
 * 🔐 Firebase IDトークンを最新のものに更新して取得するユーティリティ関数
 *
 * @returns {Promise<string|null>} ログイン中のユーザーの最新IDトークン、未ログインの場合はnull
 */
export const getFreshToken = async () => {
  const firebaseUser = auth.currentUser;

  // 👤 ログインユーザーが存在する場合
  if (firebaseUser) {
    // 🔄 強制的にトークンをリフレッシュして取得
    try {
      const token = await firebaseUser.getIdToken(true);
      return token;
    } catch (err) {
      console.error("IDトークン取得失敗:", err);
      return null;
    }
  }

  // ⚠️ 未ログインの場合はnullを返す
  return null;
};
