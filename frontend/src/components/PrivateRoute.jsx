import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// 認証が必要なルート用コンポーネント
// ログイン済みのユーザーのみ children を表示し、それ以外はログインページへリダイレクトする
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // 認証状態を確認中の場合は何も表示しない（必要に応じてローディング表示に変更可能）
  if (loading) return null;

  // ユーザーが存在すれば children を表示し、なければログイン画面へ遷移
  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
