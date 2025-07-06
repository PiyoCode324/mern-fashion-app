import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useFavorite } from "../contexts/FavoriteContext"; // ❤️追加

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { isFavorite, toggleFavorite } = useFavorite(); // ❤️追加

  // 商品情報を取得
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

  const handleDelete = async () => {
    const confirm = window.confirm("本当に削除しますか？");
    if (!confirm) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/products/${id}`);
      alert("商品を削除しました");
      navigate("/");
    } catch (err) {
      console.error("削除エラー:", err);
      alert("削除に失敗しました");
    }
  };

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p>{error}</p>;

  const favorite = isFavorite(product._id); // ❤️追加

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link to="/" className="text-indigo-600 underline mb-4 inline-block">
        ← 商品一覧に戻る
      </Link>
      <div className="border rounded p-4 shadow relative">
        {/* ❤️ ハートボタン */}
        <button
          onClick={() => toggleFavorite(product._id)}
          className={`absolute top-4 right-4 text-2xl transition-transform duration-300 ${
            favorite
              ? "text-red-500 scale-110"
              : "text-gray-300 hover:scale-110"
          }`}
          aria-label="お気に入り"
        >
          {favorite ? "❤️" : "🤍"}
        </button>

        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-64 object-cover rounded mb-4"
        />
        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
        <p className="text-gray-600 capitalize mb-2">{product.category}</p>
        {product.createdBy?.name && (
          <p className="text-sm text-gray-500 mb-2">
            作成者: {product.createdBy.name}
          </p>
        )}
        <p className="text-indigo-700 text-xl font-semibold mb-4">
          {product.price} 円
        </p>
        {product.description && (
          <p className="text-gray-800 whitespace-pre-line">
            {product.description}
          </p>
        )}
        <Link
          to={`/edit/${product._id}`}
          className="text-sm text-indigo-600 underline mt-2 inline-block"
        >
          編集する
        </Link>
        <button
          onClick={handleDelete}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          削除する
        </button>
      </div>
    </div>
  );
}
