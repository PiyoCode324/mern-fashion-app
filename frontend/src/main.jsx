// main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { FavoriteProvider } from "./contexts/FavoriteContext";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext"; // AuthProvider をインポート
import "./index.css";
import App from "./App.jsx";

// アプリケーションのルートをレンダリング
createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* お気に入り機能のコンテキストプロバイダー */}
    <FavoriteProvider>
      {/* ルーティング機能のプロバイダー */}
      <BrowserRouter>
        {/* カート機能のコンテキストプロバイダー */}
        <CartProvider>
          {/* 認証機能のコンテキストプロバイダー (Appコンポーネント全体を囲む) */}
          <AuthProvider>
            {/* メインのアプリケーションコンポーネント */}
            <App />
          </AuthProvider>
        </CartProvider>
      </BrowserRouter>
    </FavoriteProvider>
  </StrictMode>
);
