// src/components/ProductDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useFavorite } from "../contexts/FavoriteContext";
import { useAuth } from "../contexts/AuthContext";

export default function ProductDetail() {
  // Get product ID from the URL parameter
  const { id } = useParams();
  const navigate = useNavigate();

  // States for product data, loading status, and error message
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Access favorite functionality
  const { isFavorite, toggleFavorite } = useFavorite();

  // Get current user info and auth token
  const { user: currentUser, token } = useAuth();

  // Fetch product details
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/products/${id}`)
      .then((res) => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("商品が見つかりません");
        setLoading(false);
      });
  }, [id]);

  // Handle product deletion
  const handleDelete = async () => {
    const confirm = window.confirm("本当に削除しますか？");
    if (!confirm) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Pass the token in the authorization header
        },
      });
      alert("商品を削除しました");
      navigate("/"); // Redirect to home after deletion
    } catch (err) {
      console.error("削除エラー:", err);
      alert("削除に失敗しました");
    }
  };

  // Show loading message
  if (loading) return <p>読み込み中...</p>;

  // Show error message
  if (error) return <p>{error}</p>;

  // Check if the product is favorited
  const favorite = isFavorite(product._id);

  // Check if the current user is the creator or an admin
  const isAdmin = currentUser?.role === "admin";
  const isMine =
    currentUser &&
    product.createdBy &&
    (product.createdBy._id === currentUser._id || isAdmin);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Back to Home button */}
      <Link
        to="/"
        className="inline-block mb-6 px-5 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md font-medium transition"
      >
        🏠 ホームに戻る
      </Link>

      <div className="border rounded p-6 shadow relative">
        {/* ❤️ Favorite toggle button */}
        <button
          onClick={() => toggleFavorite(product._id)}
          className={`absolute top-4 right-4 text-3xl transition-transform duration-300 ${
            favorite
              ? "text-red-500 scale-125"
              : "text-gray-300 hover:scale-110"
          }`}
          aria-label="お気に入り"
          title={favorite ? "お気に入り解除" : "お気に入り登録"}
        >
          {favorite ? "❤️" : "🤍"}
        </button>

        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="w-full h-64 object-cover rounded mb-6"
        />
        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
        <p className="text-gray-600 capitalize mb-2">{product.category}</p>
        {product.createdBy?.name && (
          <p className="text-sm text-gray-500 mb-2">
            作成者: {product.createdBy.name}
          </p>
        )}
        <p className="text-indigo-700 text-xl font-semibold mb-6">
          ¥{product.price.toLocaleString()}
        </p>
        {product.description && (
          <p className="text-gray-800 whitespace-pre-line mb-6">
            {product.description}
          </p>
        )}

        {/* Show edit and delete buttons only if the user is the creator or an admin */}
        {isMine && (
          <div className="flex gap-4">
            <Link
              to={`/edit/${product._id}`}
              className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-center font-medium transition"
            >
              ✏️ 編集する
            </Link>

            <button
              onClick={handleDelete}
              className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-medium transition"
            >
              🗑️ 削除する
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
