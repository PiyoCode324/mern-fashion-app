// src/components/ProductCard.jsx
import React from "react";
import { useFavorite } from "../contexts/FavoriteContext";
import { useCart } from "../contexts/CartContext"; // ← カートContextを追加

const ProductCard = ({ product }) => {
  const { toggleFavorite, isFavorite } = useFavorite();
  const { addToCart } = useCart(); // ← カートに追加する関数を使用
  const favorite = isFavorite(product._id);

  return (
    <div className="relative border p-4 rounded shadow hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between">
      {/* ❤️ お気に入りボタン */}
      <button
        onClick={(e) => {
          e.preventDefault(); // 親リンククリック防止
          toggleFavorite(product._id);
        }}
        className={`absolute top-2 right-2 text-2xl transition-transform duration-200 ${
          favorite ? "text-red-500 scale-110" : "text-gray-300 hover:scale-110"
        }`}
        aria-label="お気に入り"
      >
        {favorite ? "❤️" : "🤍"}
      </button>

      <div>
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-48 object-cover rounded"
        />
        <h3 className="text-lg font-bold mt-2">{product.name}</h3>
        <p className="text-gray-600">{product.category}</p>
        <p className="text-indigo-600 font-semibold mt-1">
          ¥{product.price.toLocaleString()}
        </p>
      </div>

      {/* 🛒 カートに追加ボタン */}
      <button
        onClick={() => addToCart(product)}
        className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
      >
        🛒 カートに追加
      </button>
    </div>
  );
};

export default ProductCard;
