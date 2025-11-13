// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import axios from "axios";

const AuthContext = createContext(null);

// ✅ 認証コンテキストを簡単に利用するためのカスタムフック
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  // Firebase ユーザー情報（認証状態）
  const [firebaseUser, setFirebaseUser] = useState(null);
  // MongoDB 側のユーザー情報（アプリ独自のデータ）
  const [user, setUser] = useState(null);
  // 表示用ユーザー名（ログインしていない場合は「ゲスト」）
  const [userName, setUserName] = useState("ゲスト");
  // Firebase IDトークン（API認証で利用）
  const [token, setToken] = useState(null);
  // 認証情報の読み込み中フラグ
  const [loading, setLoading] = useState(true);
  // Firebaseに存在するがMongoDBに未登録の新規ユーザーかどうか
  const [isNewFirebaseUser, setIsNewFirebaseUser] = useState(false);

  useEffect(() => {
    // 🔄 Firebase の認証状態を監視（ログイン／ログアウトの検知）
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Firebase 側のユーザーが存在する場合
        setFirebaseUser(firebaseUser);

        try {
          // 🔑 最新のカスタムクレームを反映するためにトークンを強制リフレッシュ
          const token = await firebaseUser.getIdToken(true);

          // 📝 デバッグ用ログ（開発中に確認するため）
          console.log("🛡 Firebase User Info:");
          console.log("UID:", firebaseUser.uid);
          console.log("Email:", firebaseUser.email);
          console.log("Display Name:", firebaseUser.displayName);
          console.log("ID Token:", token);

          setToken(token);

          // MongoDB 側からユーザー情報を取得
          const res = await axios.get(
            `${import.meta.env.VITE_API_URL}/users/me`,
            {
              headers: {
                Authorization: `Bearer ${token}`, // 🔐 IDトークンをヘッダーに付与
              },
            }
          );

          // 🎯 ユーザー情報を state に反映
          setUser(res.data);
          setUserName(res.data.name || "ゲスト");
          setIsNewFirebaseUser(false);
        } catch (error) {
          // ❌ MongoDB に存在しない場合（新規ユーザー）
          if (error.response?.status === 404) {
            console.log("MongoDBに未登録のFirebaseユーザーです。");
            setUser(null);
            setUserName("ゲスト");
            setIsNewFirebaseUser(true);
          } else {
            // その他のエラー → ゲスト扱いに戻す
            console.error("ユーザー情報取得エラー:", error);
            setUser(null);
            setUserName("ゲスト");
            setIsNewFirebaseUser(false);
          }
          setToken(null);
        }
      } else {
        // 🚪 ログアウト時の処理（全ての状態をリセット）
        setFirebaseUser(null);
        setUser(null);
        setUserName("ゲスト");
        setToken(null);
        setIsNewFirebaseUser(false);
      }

      // ✅ 初期読み込み終了
      setLoading(false);
    });

    // 🧹 コンポーネントがアンマウントされた時にリスナーを解除
    return () => unsubscribe();
  }, []);

  // コンテキスト経由で提供する値
  const value = {
    firebaseUser, // Firebaseユーザー情報
    user, // MongoDBユーザー情報
    setUser, // ユーザー情報更新用
    userName, // 表示名
    setUserName, // 表示名更新用
    token, // Firebase IDトークン
    loadingAuth: loading, // 認証読み込み中フラグ
    isNewFirebaseUser, // 新規Firebaseユーザー判定
  };

  return (
    <AuthContext.Provider value={value}>
      {/* ⏳ 認証の初期化中はローディング表示、それ以外は子コンポーネントを表示 */}
      {!loading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
};

