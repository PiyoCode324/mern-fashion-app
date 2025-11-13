// src/components/ProductDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useFavorite } from "../contexts/FavoriteContext";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import Spinner from "./common/Spinner";
import { showSuccess } from "../utils/showToast";

export default function ProductDetail() {
  const { id } = useParams(); // URL パラメータから商品 ID を取得
  const navigate = useNavigate(); // ページ遷移用フック

  // 商品情報・レビュー・ローディング状態などを保持するステート
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // お気に入り機能のカスタムフック
  const { isFavorite, toggleFavorite } = useFavorite();
  // 認証情報（ユーザーとトークン）を取得
  const { user: currentUser, token } = useAuth();
  // カート操作用フック
  const { addToCart } = useCart();

  // レビュー投稿用の入力ステート
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hasPurchased, setHasPurchased] = useState(false); // 購入済み判定（仮で true）

  // 商品詳細を取得する副作用
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/products/${id}`)
      .then((res) => {
        setProduct(res.data); // 商品データをセット
        setReviews(res.data.reviews || []); // レビュー一覧をセット
        setHasPurchased(true); // 本来は購入履歴から判定すべき
        setLoading(false);
      })
      .catch(() => {
        setError("商品が見つかりません"); // エラー時のメッセージ
        setLoading(false);
      });
  }, [id]);

  // 商品削除処理（管理者または投稿者のみ実行可能）
  const handleDelete = async () => {
    if (!window.confirm("本当に削除しますか？")) return; // 確認ダイアログ
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("商品を削除しました"); // 成功メッセージ
      navigate("/"); // ホームへリダイレクト
    } catch (err) {
      console.error(err);
      alert("削除に失敗しました"); // エラーメッセージ
    }
  };

  // レビュー投稿処理
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/products/${id}/reviews`,
        { rating, comment }, // 投稿内容
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("レビューを投稿しました！");
      // フォームを初期化
      setRating(5);
      setComment("");
      // 最新レビューを再取得
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/products/${id}`
      );
      setReviews(res.data.reviews || []);
    } catch (err) {
      console.error(err);
      alert("レビュー投稿に失敗しました");
    }
  };

  // ローディング中はスピナーを表示
  if (loading) return <Spinner />;
  // エラーがある場合はエラーメッセージを表示
  if (error) return <p className="text-red-500 dark:text-red-400">{error}</p>;

  // お気に入り状態を判定
  const favorite = isFavorite(product._id);
  // 管理者判定
  const isAdmin = currentUser?.role === "admin";
  // 投稿者本人または管理者かどうかを判定
  const isMine =
    currentUser &&
    product.createdBy &&
    (product.createdBy._id === currentUser._id || isAdmin);

  // カート追加処理
  const handleAddToCart = () => {
    addToCart(product);
    showSuccess("🛒 カートに追加しました！");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto dark:bg-gray-900">
      {/* ホームに戻るリンク */}
      <Link
        to="/"
        className="inline-block mb-6 px-5 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 rounded-md font-medium transition"
      >
        🏠 ホームに戻る
      </Link>

      {/* 商品詳細カード */}
      <div className="border rounded p-6 shadow-lg dark:border-gray-700 bg-white dark:bg-gray-800 relative">
        {/* お気に入りボタン */}
        <button
          onClick={() => toggleFavorite(product._id)}
          className={`absolute top-4 right-4 text-3xl transition-transform duration-300 ${
            favorite
              ? "text-red-500 scale-125"
              : "text-gray-400 hover:scale-110"
          }`}
          aria-label="お気に入り"
          title={favorite ? "お気に入り解除" : "お気に入り登録"}
        >
          {favorite ? "❤️" : "🤍"}
        </button>

        {/* 商品画像 */}
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-[400px] object-contain bg-gray-100 dark:bg-gray-700 rounded"
        />
        {/* 商品名 */}
        <h1 className="text-3xl font-bold mt-4 dark:text-gray-100">
          {product.name}
        </h1>
        {/* カテゴリー */}
        <p className="text-gray-600 dark:text-gray-300 capitalize mb-2">
          {product.category}
        </p>
        {/* 作成者情報 */}
        {product.createdBy?.name && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            作成者: {product.createdBy.name}
          </p>
        )}
        {/* 価格 */}
        <p className="text-indigo-700 dark:text-indigo-300 text-xl font-semibold mb-6">
          ¥{product.price.toLocaleString()}
        </p>
        {/* 説明文 */}
        {product.description && (
          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line mb-6">
            {product.description}
          </p>
        )}

        {/* カート追加ボタン */}
        <div className="mb-4">
          <button
            onClick={handleAddToCart}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-2 px-4 transition"
          >
            🛒 カートに追加
          </button>
        </div>

        {/* 投稿者本人 or 管理者向けの編集・削除ボタン */}
        {isMine && (
          <div className="flex gap-4">
            <Link
              to={`/edit/${product._id}`}
              className="flex-1 px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-center font-medium transition"
            >
              ✏️ 編集する
            </Link>
            <button
              onClick={handleDelete}
              className="flex-1 px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-medium transition"
            >
              🗑️ 削除する
            </button>
          </div>
        )}
      </div>

      {/* レビュー一覧 */}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">
          レビュー
        </h2>
        {reviews.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            レビューはまだありません。
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div
                key={r._id}
                className="p-4 rounded bg-gray-100 dark:bg-gray-800"
              >
                {/* 星評価を ★/☆ で表示 */}
                <p className="text-yellow-500">
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </p>
                {/* コメント本文 */}
                <p className="mt-1 dark:text-gray-200">{r.comment}</p>
                {/* 投稿者情報 */}
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  投稿者: {r.user?.name || "匿名"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* レビュー投稿フォーム（購入済みかつ未投稿の場合のみ表示） */}
      {hasPurchased &&
        !reviews.some((r) => r.user?._id === currentUser._id) && (
          <form onSubmit={handleReviewSubmit} className="mt-8 space-y-4">
            <h3 className="text-xl font-semibold dark:text-gray-100">
              レビューを書く
            </h3>
            {/* 評価選択 */}
            <label className="block dark:text-gray-200">
              評価（1〜5）:
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="block w-full mt-1 p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} - {["最高", "良い", "普通", "悪い", "最悪"][5 - n]}
                  </option>
                ))}
              </select>
            </label>
            {/* コメント入力 */}
            <label className="block dark:text-gray-200">
              コメント:
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="4"
                className="block w-full mt-1 p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </label>
            {/* 投稿ボタン */}
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
            >
              投稿する
            </button>
          </form>
        )}
    </div>
  );
}
