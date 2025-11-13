// src/components/PrivateRoute.jsx

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// PrivateRouteコンポーネントは、認証が必要なルートをラップする
// ログイン済みの場合は子コンポーネント(children)を表示し、
// 未ログインの場合はログインページ(/login)へリダイレクトする
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // 認証情報の読み込み中は何もレンダリングしない
  // ※必要に応じてローディングスピナーに置き換えることも可能
  if (loading) return null;

  // ユーザーがログイン済みなら子コンポーネントを表示
  // そうでなければログインページへリダイレクト
  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
