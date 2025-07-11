// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import axios from "axios";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null); // Firebase Userオブジェクト
  const [user, setUser] = useState(null); // MongoDBユーザー情報
  const [userName, setUserName] = useState("ゲスト");
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNewFirebaseUser, setIsNewFirebaseUser] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);

        try {
          const token = await firebaseUser.getIdToken();

          // ログイン時にFirebaseユーザー情報とトークンをコンソールに表示
          console.log("🛡 Firebase User Info:");
          console.log("UID:", firebaseUser.uid);
          console.log("Email:", firebaseUser.email);
          console.log("Display Name:", firebaseUser.displayName);
          console.log("ID Token:", token);

          setToken(token);

          const res = await axios.get("/api/users/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          setUser(res.data);
          setUserName(res.data.name || "ゲスト");
          setIsNewFirebaseUser(false);
        } catch (error) {
          if (error.response?.status === 404) {
            console.log("MongoDBに未登録のFirebaseユーザーです。");
            setUser(null);
            setUserName("ゲスト");
            setIsNewFirebaseUser(true);
          } else {
            console.error("ユーザー情報取得エラー:", error);
            setUser(null);
            setUserName("ゲスト");
            setIsNewFirebaseUser(false);
          }
          setToken(null);
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
        setUserName("ゲスト");
        setToken(null);
        setIsNewFirebaseUser(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
      {!loading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
};
