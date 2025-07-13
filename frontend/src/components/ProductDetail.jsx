import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useFavorite } from "../contexts/FavoriteContext"; // ❤️お気に入り機能用Contextを追加
import { useAuth } from "../contexts/AuthContext"; // 認証情報取得用Context

export default function ProductDetail() {
  // URLパラメータから商品IDを取得
  const { id } = useParams();
  const navigate = useNavigate();

  // 商品情報、読み込み状態、エラー状態を管理するステート
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // お気に入りの状態管理関数を取得
  const { isFavorite, toggleFavorite } = useFavorite();

  // 認証情報とAPI呼び出しに使うトークンを取得
  const { user: currentUser, token } = useAuth();

  // 商品情報の取得
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

  // 商品削除ハンドラー
  const handleDelete = async () => {
    const confirm = window.confirm("本当に削除しますか？");
    if (!confirm) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // 認証ヘッダーにトークンを設定
        },
      });
      alert("商品を削除しました");
      navigate("/"); // 削除後はホームへ遷移
    } catch (err) {
      console.error("削除エラー:", err);
      alert("削除に失敗しました");
    }
  };

  // 読み込み中はローディング表示
  if (loading) return <p>読み込み中...</p>;

  // エラー時はエラーメッセージ表示
  if (error) return <p>{error}</p>;

  // お気に入り状態を判定
  const favorite = isFavorite(product._id);

  // 管理者かつ作成者本人かどうか判定
  const isAdmin = currentUser?.role === "admin";
  const isMine =
    currentUser &&
    product.createdBy &&
    (product.createdBy._id === currentUser._id || isAdmin);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* ホームへ戻るボタン */}
      <Link
        to="/"
        className="inline-block mb-6 px-5 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md font-medium transition"
      >
        🏠 ホームに戻る
      </Link>

      <div className="border rounded p-6 shadow relative">
        {/* ❤️ お気に入りトグルボタン */}
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
          {product.price.toLocaleString()} 円
        </p>
        {product.description && (
          <p className="text-gray-800 whitespace-pre-line mb-6">
            {product.description}
          </p>
        )}

        {/* 作成者本人か管理者なら編集・削除ボタンを表示 */}
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
