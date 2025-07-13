// main.jsx
// React の StrictMode（開発時のバグ検出などに役立つ）
import { StrictMode } from "react";

// React 18 以降のルート作成 API
import { createRoot } from "react-dom/client";

// React Router のルーティング機能を提供
import { BrowserRouter } from "react-router-dom";

// お気に入り管理用のコンテキスト
import { FavoriteProvider } from "./contexts/FavoriteContext";

// カート管理用のコンテキスト
import { CartProvider } from "./contexts/CartContext";

// 認証管理用のコンテキスト
import { AuthProvider } from "./contexts/AuthContext";

// トースト通知機能（ユーザーへのフィードバック表示）
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // トーストのスタイルを読み込み

// 全体スタイルとメインアプリコンポーネント
import "./index.css";
import App from "./App.jsx";

// 📌 アプリケーションのルート要素に対してレンダリングを実行
createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* 🌟 お気に入り機能（例：ハートマーク）の状態管理 */}
    <FavoriteProvider>
      {/* 🧭 ページ遷移を可能にするルーティング */}
      <BrowserRouter>
        {/* 🛒 カートの状態（商品追加・削除・合計金額など）を管理 */}
        <CartProvider>
          {/* 🔐 認証状態（ログイン済みユーザー情報など）を管理 */}
          <AuthProvider>
            {/* 🧩 実際に表示されるメインアプリケーション */}
            <App />
            {/* 💬 通知の表示領域（成功・エラーなどのフィードバック） */}
            <ToastContainer />
          </AuthProvider>
        </CartProvider>
      </BrowserRouter>
    </FavoriteProvider>
  </StrictMode>
);
