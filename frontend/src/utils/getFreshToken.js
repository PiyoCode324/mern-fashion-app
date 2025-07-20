// utils/getFreshToken.js
import { auth } from "../firebase";

// 🔐 Utility function to retrieve the latest Firebase ID token
export const getFreshToken = async () => {
  const firebaseUser = auth.currentUser;

  // 👤 Check if a logged-in user exists
  if (firebaseUser) {
    // 🔄 Force refresh to obtain a new token
    return await firebaseUser.getIdToken(true);
  }

  // ⚠️ Return null if not logged in
  return null;
};
