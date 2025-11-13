// src/components/ProductCard.jsx
import React from "react";
import { useFavorite } from "../contexts/FavoriteContext";
import { useCart } from "../contexts/CartContext";
import { Link } from "react-router-dom";

// 商品カードコンポーネント
// 商品の画像、名前、カテゴリー、作成者、価格を表示し、
// お気に入り登録や詳細ページへのリンクも提供
const ProductCard = ({ product }) => {
  const { toggleFavorite, isFavorite } = useFavorite(); // お気に入り機能
  const { addToCart } = useCart(); // カート機能
  const favorite = isFavorite(product._id); // 現在お気に入りかどうか

  return (
    <div className="relative border p-4 rounded shadow hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between">
      {/* ❤️ お気に入りボタン */}
      <button
        onClick={(e) => {
          e.preventDefault(); // 詳細ページへのリンク遷移を阻止
          toggleFavorite(product._id); // お気に入りのON/OFF切替
        }}
        className={`absolute top-2 right-2 text-2xl transition-transform duration-200 ${
          favorite ? "text-red-500 scale-110" : "text-gray-300 hover:scale-110"
        }`}
        aria-label="Favorite"
      >
        {favorite ? "❤️" : "🤍"} {/* お気に入り状態に応じて表示 */}
      </button>

      {/* 🔗 商品詳細ページへのリンク */}
      <Link to={`/products/${product._id}`} className="block">
        {/* 商品画像 */}
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-[400px] object-contain bg-gray-100 dark:bg-gray-800 rounded"
        />
        {/* 商品名 */}
        <h3 className="text-lg font-bold mt-2 text-gray-800 dark:text-white">
          {product.name}
        </h3>
        {/* カテゴリ */}
        <p className="text-gray-600 dark:text-gray-300">{product.category}</p>
        {/* 作成者 */}
        <p className="text-sm text-gray-500 mt-1">
          Created by: {product.createdBy?.name || "Unknown"}
        </p>
        {/* 価格 */}
        <p className="text-indigo-600 font-semibold mt-1">
          ¥{product.price.toLocaleString()}
        </p>
      </Link>
    </div>
  );
};

export default ProductCard;
