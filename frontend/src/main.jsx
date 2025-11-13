// src/main.jsx

// React の StrictMode を利用（開発時に潜在的な問題を検出して警告してくれる）
import { StrictMode } from "react";

// React 18 以降でルートを作成するための API
import { createRoot } from "react-dom/client";

// React Router を利用してルーティング機能を提供
import { BrowserRouter } from "react-router-dom";

// お気に入りアイテムの状態を管理する Context
import { FavoriteProvider } from "./contexts/FavoriteContext";

// ショッピングカートの状態を管理する Context
import { CartProvider } from "./contexts/CartContext";

// ユーザー認証（ログイン状態など）を管理する Context
import { AuthProvider } from "./contexts/AuthContext";

// トースト通知（ユーザーにメッセージをポップアップ表示するコンポーネント）
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // トースト用のデフォルトスタイルを読み込む

// グローバルスタイルとアプリのメインコンポーネント
import "./index.css";
import App from "./App.jsx";

// 📌 アプリケーションを DOM の root 要素にレンダリングする
createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* 🌟 お気に入り機能の状態管理（例：お気に入りボタンのオン/オフ） */}
    <FavoriteProvider>
      {/* 🧭 クライアントサイドのルーティング（ページ遷移を制御） */}
      <BrowserRouter>
        {/* 🛒 カート機能の状態管理（商品リスト、合計金額など） */}
        <CartProvider>
          {/* 🔐 認証状態の管理（ログインユーザー情報、権限など） */}
          <AuthProvider>
            {/* 🧩 アプリ全体のメインコンポーネント */}
            <App />
            {/* 💬 成功・エラー・情報メッセージをユーザーに通知 */}
            <ToastContainer />
          </AuthProvider>
        </CartProvider>
      </BrowserRouter>
    </FavoriteProvider>
  </StrictMode>
);
