// src/components/ProductCard.jsx
import React from "react";
// import { Link } from "react-router-dom"; // ★ここから Link のインポートを削除
import { useFavorite } from "../contexts/FavoriteContext";

const ProductCard = ({ product }) => {
  const { toggleFavorite, isFavorite } = useFavorite();
  const favorite = isFavorite(product._id);

  return (
    // ★この div が ProductList.jsx の <Link> の子要素になる
    <div className="relative border p-4 rounded shadow hover:shadow-lg transition-shadow duration-300">
      {/* ❤️ ハートボタンは、e.preventDefault() で親のリンククリックを防いでいるので問題なし */}
      <button
        onClick={(e) => {
          e.preventDefault(); // これが重要！親の <Link> がクリックされるのを防ぐ
          toggleFavorite(product._id);
        }}
        className={`absolute top-2 right-2 text-2xl transition-transform duration-200 ${
          favorite ? "text-red-500 scale-110" : "text-gray-300 hover:scale-110"
        }`}
        aria-label="お気に入り"
      >
        {favorite ? "❤️" : "🤍"}
      </button>

      {/* ★ここにあった <Link> を削除し、中身だけを残す */}
      <img
        src={product.imageUrl}
        alt={product.name}
        className="w-full h-48 object-cover rounded"
      />
      <h3 className="text-lg font-bold mt-2">{product.name}</h3>
      <p className="text-gray-600">{product.category}</p>
      <p className="text-indigo-600 font-semibold mt-1">¥{product.price}</p>
      {/* カートに入れるボタンなど、他の独立したボタンはここに残してOK */}
    </div>
  );
};

export default ProductCard;
