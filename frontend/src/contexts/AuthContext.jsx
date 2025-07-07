// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import axios from "axios";

// AuthContextを作成
const AuthContext = createContext(null);

// useAuthカスタムフック
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

// AuthProviderコンポーネント
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // MongoDBのユーザー情報
  const [userName, setUserName] = useState("ゲスト"); // 表示用ユーザー名の状態を追加
  const [token, setToken] = useState(null); // Firebase ID トークン
  const [loading, setLoading] = useState(true);
  const [isNewFirebaseUser, setIsNewFirebaseUser] = useState(false);

  useEffect(() => {
    // Firebase認証状態を監視
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          console.log("取得したトークン:", token);
          setToken(token); // 🔽 トークンを状態に保存

          const res = await axios.get("/api/users/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log("MongoDBユーザー情報取得:", res.data);

          setUser(res.data);
          setUserName(res.data.name || "ゲスト"); // ユーザー名を更新
          setIsNewFirebaseUser(false);
        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.log(
              "AuthContext: Firebaseユーザーは存在するが、MongoDBに未登録です。"
            );
            setUser(null);
            setUserName("ゲスト");
            setIsNewFirebaseUser(true);
          } else {
            console.error("AuthContext: ユーザー情報の取得中にエラー:", error);
            setUser(null);
            setUserName("ゲスト");
            setIsNewFirebaseUser(false);
          }
          setToken(null); // エラー時はトークンもクリア
        }
      } else {
        // ログアウト時
        setUser(null);
        setUserName("ゲスト");
        setToken(null);
        setIsNewFirebaseUser(false);
      }

      setLoading(false);
    });

    return () => unsubscribe(); // クリーンアップ
  }, []);

  const value = {
    user,
    setUser,
    userName,
    setUserName,
    token,
    loading,
    isNewFirebaseUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
};
