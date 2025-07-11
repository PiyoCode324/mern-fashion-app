import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";

const Header = ({ handleLogout, userName, userRole }) => {
  const { cartItems } = useCart();
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-100 gap-4 sm:gap-0">
      <h1 className="text-xl font-bold text-center sm:text-left">商品一覧</h1>

      <div className="flex flex-wrap justify-center sm:justify-end gap-3">
        <span className="text-sm sm:text-base">ようこそ、{userName}さん！</span>

        <Link
          to="/profile"
          className="bg-yellow-500 text-white px-3 py-1.5 rounded hover:bg-yellow-600 text-sm"
        >
          👤 プロフィール
        </Link>

        {/* ✅ 管理者のみ表示 */}
        {userRole === "admin" && (
          <Link
            to="/admin"
            className="bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 text-sm"
          >
            ⚙️ 管理者ページ
          </Link>
        )}

        <Link
          to="/favorites"
          className="bg-pink-500 text-white px-3 py-1.5 rounded hover:bg-pink-600 text-sm"
        >
          ❤️ お気に入り一覧
        </Link>

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

        <Link
          to="/login"
          className="bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600 text-sm"
        >
          ログイン
        </Link>

        <button
          onClick={handleLogout}
          className="text-sm text-red-500 hover:underline"
        >
          ログアウト
        </button>

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
