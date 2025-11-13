// src/components/Header.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";

const Header = ({ handleLogout, userName, userRole }) => {
  // カートの中身を取得
  const { cartItems } = useCart();
  // カート内の合計アイテム数を計算
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // 🔹 ダークモード状態の管理
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dark-mode"); // 以前の設定を取得
      if (saved !== null) return saved === "true"; // 保存されていればそれを使用
      return window.matchMedia("(prefers-color-scheme: dark)").matches; // OS設定を初期値に
    }
    return false;
  });

  // 🔹 ダークモードの適用・保存
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark"); // darkクラスをhtmlに追加
    } else {
      root.classList.remove("dark"); // darkクラスを削除
    }
    localStorage.setItem("dark-mode", isDark); // 設定を保存
  }, [isDark]);

  // 🔹 ダークモード切替
  const toggleDarkMode = () => setIsDark((prev) => !prev);

  // 🔹 ハンバーガーメニューの開閉状態
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-gray-100 dark:bg-gray-800 p-4">
      <div className="flex justify-between items-center">
        {/* サイトタイトル */}
        <h1 className="text-xl font-bold dark:text-white">商品一覧</h1>

        {/* 🔹 モバイル用ハンバーガーメニュー */}
        <button
          className="sm:hidden text-gray-800 dark:text-white text-2xl"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          ☰
        </button>

        {/* 🔹 デスクトップ用ナビゲーション */}
        <nav className="hidden sm:flex flex-wrap gap-3 items-center">
          {/* ダークモード切替ボタン */}
          <button
            onClick={toggleDarkMode}
            className="px-3 py-1.5 rounded bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-600 transition text-sm sm:text-base"
            aria-label="ダークモード切替"
          >
            {isDark ? "🌙" : "☀️"}
          </button>

          {/* ユーザー名表示 */}
          <span className="text-sm sm:text-base dark:text-gray-200">
            {userName ? `ようこそ、${userName}さん！` : "ようこそ！"}
          </span>

          {/* プロフィールページへのリンク */}
          <Link
            to="/profile"
            className="bg-yellow-500 text-white px-3 py-1.5 rounded hover:bg-yellow-600 text-sm sm:text-base"
          >
            👤 プロフィール
          </Link>

          {/* 管理者のみ表示されるリンク */}
          {userRole === "admin" && (
            <Link
              to="/admin"
              className="bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 text-sm sm:text-base"
            >
              ⚙️ 管理者ページ
            </Link>
          )}

          {/* お気に入りページ */}
          <Link
            to="/favorites"
            className="bg-pink-500 text-white px-3 py-1.5 rounded hover:bg-pink-600 text-sm sm:text-base"
          >
            ❤️ お気に入り一覧
          </Link>

          {/* カートページ、アイテム数バッジ表示 */}
          <Link
            to="/cart"
            className="bg-green-500 text-white px-3 py-1.5 rounded hover:bg-green-600 relative text-sm sm:text-base"
          >
            🛒 カート
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {itemCount}
              </span>
            )}
          </Link>

          {/* ログインリンク */}
          <Link
            to="/login"
            className="bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600 text-sm sm:text-base"
          >
            ログイン
          </Link>

          {/* ログアウトボタン */}
          <button
            onClick={handleLogout}
            className="bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600 text-sm sm:text-base"
          >
            ログアウト
          </button>

          {/* 商品追加リンク */}
          <Link
            to="/add"
            className="bg-indigo-500 text-white px-3 py-1.5 rounded hover:bg-indigo-600 text-sm sm:text-base"
          >
            ➕ 商品を追加
          </Link>
        </nav>
      </div>

      {/* 🔹 モバイル用メニュー */}
      {menuOpen && (
        <div className="sm:hidden mt-4 flex flex-col gap-3 items-start">
          {/* ダークモード切替 */}
          <button
            onClick={toggleDarkMode}
            className="w-full text-left px-3 py-1.5 rounded bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-600 transition text-sm"
          >
            {isDark ? "🌙 ダークモード" : "☀️ ライトモード"}
          </button>

          {/* ユーザー名表示 */}
          <span className="text-sm dark:text-gray-200">
            {userName ? `ようこそ、${userName}さん！` : "ようこそ！"}
          </span>

          {/* 各リンクを縦並びに表示 */}
          <Link
            to="/profile"
            className="w-full text-left bg-yellow-500 text-white px-3 py-1.5 rounded hover:bg-yellow-600 text-sm"
          >
            👤 プロフィール
          </Link>

          {userRole === "admin" && (
            <Link
              to="/admin"
              className="w-full text-left bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 text-sm"
            >
              ⚙️ 管理者ページ
            </Link>
          )}

          <Link
            to="/favorites"
            className="w-full text-left bg-pink-500 text-white px-3 py-1.5 rounded hover:bg-pink-600 text-sm"
          >
            ❤️ お気に入り一覧
          </Link>

          <Link
            to="/cart"
            className="w-full text-left bg-green-500 text-white px-3 py-1.5 rounded hover:bg-green-600 text-sm relative"
          >
            🛒 カート
            {itemCount > 0 && (
              <span className="absolute top-1 right-3 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {itemCount}
              </span>
            )}
          </Link>

          <Link
            to="/login"
            className="w-full text-left bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600 text-sm"
          >
            ログイン
          </Link>

          <button
            onClick={handleLogout}
            className="w-full text-left bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600 text-sm"
          >
            ログアウト
          </button>

          <Link
            to="/add"
            className="w-full text-left bg-indigo-500 text-white px-3 py-1.5 rounded hover:bg-indigo-600 text-sm"
          >
            ➕ 商品を追加
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
