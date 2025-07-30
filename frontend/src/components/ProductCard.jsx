// src/components/ProductCard.jsx
import React from "react";
import { useFavorite } from "../contexts/FavoriteContext";
import { useCart } from "../contexts/CartContext";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  const { toggleFavorite, isFavorite } = useFavorite();
  const { addToCart } = useCart();
  const favorite = isFavorite(product._id);

  return (
    <div className="relative border p-4 rounded shadow hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between">
      {/* ❤️ お気に入りボタン */}
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleFavorite(product._id);
        }}
        className={`absolute top-2 right-2 text-2xl transition-transform duration-200 ${
          favorite ? "text-red-500 scale-110" : "text-gray-300 hover:scale-110"
        }`}
        aria-label="Favorite"
      >
        {favorite ? "❤️" : "🤍"}
      </button>

      {/* 🔗 商品詳細へのリンク */}
      <Link to={`/products/${product._id}`} className="block">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-[400px] object-contain bg-gray-100 dark:bg-gray-800 rounded"
        />
        <h3 className="text-lg font-bold mt-2 text-gray-800 dark:text-white">
          {product.name}
        </h3>
        <p className="text-gray-600 dark:text-gray-300">{product.category}</p>
        <p className="text-sm text-gray-500 mt-1">
          Created by: {product.createdBy?.name || "Unknown"}
        </p>
        <p className="text-indigo-600 font-semibold mt-1">
          ¥{product.price.toLocaleString()}
        </p>
      </Link>
    </div>
  );
};

export default ProductCard;
