// src/components/ProductCard.jsx
import React from "react";
import { useFavorite } from "../contexts/FavoriteContext";
import { useCart } from "../contexts/CartContext";

const ProductCard = ({ product }) => {
  // Retrieve functions for managing favorites
  const { toggleFavorite, isFavorite } = useFavorite();
  // Retrieve function for adding items to the cart
  const { addToCart } = useCart();
  // Determine if the product is currently marked as a favorite
  const favorite = isFavorite(product._id);

  return (
    <div className="relative border p-4 rounded shadow hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between">
      {/* ❤️ Button to toggle favorite status */}
      <button
        onClick={(e) => {
          e.preventDefault(); // Prevent parent link click behavior
          toggleFavorite(product._id); // Toggle the favorite status of the product
        }}
        className={`absolute top-2 right-2 text-2xl transition-transform duration-200 ${
          favorite ? "text-red-500 scale-110" : "text-gray-300 hover:scale-110"
        }`}
        aria-label="Favorite"
      >
        {favorite ? "❤️" : "🤍"}
      </button>

      <div>
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy" // Lazy-load image for better performance
          className="w-full h-48 object-cover rounded"
        />
        <h3 className="text-lg font-bold mt-2">{product.name}</h3>
        <p className="text-gray-600">{product.category}</p>
        <p className="text-sm text-gray-500 mt-1">
          Created by: {product.createdBy?.name || "Unknown"}
        </p>
        <p className="text-indigo-600 font-semibold mt-1">
          ¥{product.price.toLocaleString()}
        </p>
      </div>

      {/* 🛒 Button to add product to cart */}
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
