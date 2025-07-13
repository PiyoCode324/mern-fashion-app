// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import axios from "axios";

const AuthContext = createContext(null);

// カスタムフックでコンテキストを簡単に利用可能に
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  // Firebaseのユーザーオブジェクト（Firebase Authenticationの情報）
  const [firebaseUser, setFirebaseUser] = useState(null);

  // MongoDBに登録されたユーザー情報（カスタムのユーザーデータ）
  const [user, setUser] = useState(null);

  // 表示用のユーザー名。未ログイン時は「ゲスト」
  const [userName, setUserName] = useState("ゲスト");

  // FirebaseのIDトークン（API呼び出し時に利用）
  const [token, setToken] = useState(null);

  // 認証・ユーザー情報読み込みのローディング状態
  const [loading, setLoading] = useState(true);

  // FirebaseユーザーはいるがMongoDBに登録されていない場合のフラグ
  const [isNewFirebaseUser, setIsNewFirebaseUser] = useState(false);

  useEffect(() => {
    // Firebaseの認証状態の変化を監視
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);

        try {
          // ★トークンを強制更新することでカスタムクレームも最新に
          const token = await firebaseUser.getIdToken(true);

          // 開発用ログ出力
          console.log("🛡 Firebase User Info:");
          console.log("UID:", firebaseUser.uid);
          console.log("Email:", firebaseUser.email);
          console.log("Display Name:", firebaseUser.displayName);
          console.log("ID Token:", token);

          setToken(token);

          // API経由でMongoDBのユーザー情報を取得（認証トークン付与）
          const res = await axios.get("/api/users/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          setUser(res.data);
          setUserName(res.data.name || "ゲスト");
          setIsNewFirebaseUser(false);
        } catch (error) {
          // MongoDBにユーザーがいない場合は新規ユーザーフラグを立てる
          if (error.response?.status === 404) {
            console.log("MongoDBに未登録のFirebaseユーザーです。");
            setUser(null);
            setUserName("ゲスト");
            setIsNewFirebaseUser(true);
          } else {
            // その他のエラーはログに出してゲスト状態へ
            console.error("ユーザー情報取得エラー:", error);
            setUser(null);
            setUserName("ゲスト");
            setIsNewFirebaseUser(false);
          }
          setToken(null);
        }
      } else {
        // Firebaseユーザーがいない（ログアウト時）は初期状態に戻す
        setFirebaseUser(null);
        setUser(null);
        setUserName("ゲスト");
        setToken(null);
        setIsNewFirebaseUser(false);
      }

      // 読み込み完了フラグをfalseにセット
      setLoading(false);
    });

    // クリーンアップで監視解除
    return () => unsubscribe();
  }, []);

  // コンテキストで共有する値
  const value = {
    firebaseUser,
    user,
    setUser,
    userName,
    setUserName,
    token,
    loadingAuth: loading,
    isNewFirebaseUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* ローディング中は簡易ローディング表示 */}
      {!loading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
};
