// src/pages/Favorite.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useFavorite } from "../contexts/FavoriteContext";

const Favorites = () => {
  // Get favorite product IDs from context
  const { favorites } = useFavorite();

  // Store detailed favorite product data
  const [products, setProducts] = useState([]);
  // Manage loading state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If favorites is undefined, do nothing
    if (!favorites) return;

    // If no favorites, clear products and stop loading
    if (favorites.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    // Fetch all products and filter by favorite IDs
    axios
      .get(`${import.meta.env.VITE_API_URL}/products`)
      .then((res) => {
        const filtered = res.data.filter((product) =>
          favorites.includes(product._id)
        );
        setProducts(filtered);
      })
      .catch((err) => {
        console.error("Error fetching favorite products:", err);
        setProducts([]); // Reset to empty on error
      })
      .finally(() => {
        setLoading(false);
      });
  }, [favorites]);

  return (
    <div className="p-4">
      {/* Back to home link */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-block bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
        >
          ホームに戻る
        </Link>
      </div>

      {/* Favorites title */}
      <h2 className="text-2xl font-bold mb-4">❤️ お気に入り一覧</h2>

      {loading ? (
        // Loading message
        <p>お気に入りの商品を読み込み中です...</p>
      ) : (
        <>
          {favorites.length === 0 ? (
            // Message when no favorites are set
            <p>お気に入りが登録されていません。</p>
          ) : products.length === 0 ? (
            // Message when no matching products are found (e.g. deleted)
            <p>該当するお気に入りの商品が見つかりませんでした。</p>
          ) : (
            // Display product cards in grid
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((product) => (
                <Link key={product._id} to={`/products/${product._id}`}>
                  <ProductCard product={product} />
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Favorites;
