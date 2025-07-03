import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// 認証チェック用のコンポーネント
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // またはローディング画面を表示

  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
