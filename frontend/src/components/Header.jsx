// src/components/Header.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";

const Header = ({ handleLogout, userName, userRole }) => {
  const { cartItems } = useCart();
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // ダークモードの状態管理
  const [isDark, setIsDark] = useState(() => {
    // ページ初期表示時にlocalStorageかOS設定から初期値取得
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dark-mode");
      if (saved !== null) return saved === "true";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  // ダークモードのクラス付け外しをDOMに反映
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    // localStorageに設定を保存
    localStorage.setItem("dark-mode", isDark);
  }, [isDark]);

  // トグルハンドラー
  const toggleDarkMode = () => setIsDark((prev) => !prev);

  return (
    <header className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-100 dark:bg-gray-800 gap-4 sm:gap-0">
      {/* サイトタイトル */}
      <h1 className="text-xl font-bold text-center sm:text-left dark:text-white">
        商品一覧
      </h1>

      <div className="flex flex-wrap justify-center sm:justify-end gap-3 items-center">
        {/* ダークモードトグル */}
        <button
          onClick={toggleDarkMode}
          className="px-3 py-1.5 rounded bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-600 transition"
          aria-label="ダークモード切替"
        >
          {isDark ? "🌙" : "☀️"}
        </button>

        <span className="text-sm sm:text-base dark:text-gray-200">
          ようこそ、{userName}さん！
        </span>

        {/* Link to user profile */}
        <Link
          to="/profile"
          className="bg-yellow-500 text-white px-3 py-1.5 rounded hover:bg-yellow-600 text-sm"
        >
          👤 プロフィール
        </Link>

        {/* Admin page link - visible only to admins */}
        {userRole === "admin" && (
          <Link
            to="/admin"
            className="bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 text-sm"
          >
            ⚙️ 管理者ページ
          </Link>
        )}

        {/* Link to favorites list */}
        <Link
          to="/favorites"
          className="bg-pink-500 text-white px-3 py-1.5 rounded hover:bg-pink-600 text-sm"
        >
          ❤️ お気に入り一覧
        </Link>

        {/* Link to cart page with badge showing item count */}
        <Link
          to="/cart"
          className="bg-green-500 text-white px-3 py-1.5 rounded hover:bg-green-600 relative text-sm"
        >
          🛒 カート
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
              {itemCount}
            </span>
          )}
        </Link>

        {/* Link to login page */}
        <Link
          to="/login"
          className="bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600 text-sm"
        >
          ログイン
        </Link>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600 text-sm"
        >
          ログアウト
        </button>

        {/* Link to add new product */}
        <Link
          to="/add"
          className="bg-indigo-500 text-white px-3 py-1.5 rounded hover:bg-indigo-600 text-sm"
        >
          ➕ 商品を追加
        </Link>
      </div>
    </header>
  );
};

export default Header;
