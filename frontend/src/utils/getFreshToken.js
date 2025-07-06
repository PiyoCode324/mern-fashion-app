// utils/getFreshToken.js
import { auth } from "../firebase";

export const getFreshToken = async () => {
  const firebaseUser = auth.currentUser;
  if (firebaseUser) {
    return await firebaseUser.getIdToken(true); // ← 「true」で強制リフレッシュ
  }
  return null;
};
