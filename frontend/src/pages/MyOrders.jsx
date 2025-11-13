// src/pages/MyOrders.jsx

import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth"; // Firebase 認証情報取得用
import { Link } from "react-router-dom"; // リンクコンポーネント
import Spinner from "../components/common/Spinner"; // 読み込み中スピナー
import { useAuth } from "../contexts/AuthContext"; // 認証情報（トークンなど）取得用
import axios from "axios"; // HTTP リクエスト用

const MyOrders = () => {
  // 注文データのステート
  const [orders, setOrders] = useState([]);
  // 読み込み中かどうかのステート
  const [loading, setLoading] = useState(true);
  // すでにレビュー済みの商品のIDセット
  const [reviewedProductIds, setReviewedProductIds] = useState(new Set());
  // レビュー入力フォームの状態を商品ごとに管理
  const [formStates, setFormStates] = useState({});
  const { token } = useAuth(); // 認証トークン

  // 注文データ取得用 useEffect
  useEffect(() => {
    const fetchOrders = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      // 未ログイン時は処理中断
      if (!user) {
        console.log("ログインしていません");
        setLoading(false);
        return;
      }

      // Firebase の ID トークン取得
      const idToken = await user.getIdToken();

      try {
        // 自分の注文履歴 API を呼び出す
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/orders/my-orders`,
          {
            headers: {
              Authorization: `Bearer ${idToken}`, // 認証ヘッダー
            },
          }
        );
        const data = await res.json();
        setOrders(data); // 注文データをステートにセット

        // すでにレビュー済みの商品のIDをセットに追加
        const reviewed = new Set();
        data.forEach((order) => {
          order.items.forEach((item) => {
            // その商品に自分のレビューがある場合
            if (item.productId?.reviews?.some((r) => r.user === user.uid)) {
              reviewed.add(item.productId._id);
            }
          });
        });
        setReviewedProductIds(reviewed);
      } catch (err) {
        console.error("注文取得失敗:", err);
      } finally {
        setLoading(false); // 読み込み終了
      }
    };

    fetchOrders();
  }, []);

  // レビュー入力変更時の処理
  const handleChange = (productId, field, value) => {
    setFormStates((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  };

  // レビュー投稿処理
  const handleSubmitReview = async (productId) => {
    const form = formStates[productId];

    // 入力チェック
    if (!form || !form.rating || !form.comment) {
      alert("評価とコメントを入力してください。");
      return;
    }

    try {
      // API へレビュー投稿
      await axios.post(
        `${import.meta.env.VITE_API_URL}/products/${productId}/reviews`,
        {
          rating: form.rating,
          comment: form.comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // 認証ヘッダー
          },
        }
      );
      alert("レビューを投稿しました！");
      // レビュー済みの商品IDに追加
      setReviewedProductIds((prev) => new Set(prev).add(productId));
      // フォームリセット
      setFormStates((prev) => ({
        ...prev,
        [productId]: { rating: "", comment: "" },
      }));
    } catch (err) {
      console.error("レビュー投稿失敗:", err);
      alert("投稿に失敗しました");
    }
  };

  // 読み込み中はスピナー表示
  if (loading) return <Spinner />;

  return (
    <div className="text-gray-800 dark:text-gray-100">
      {/* プロフィールに戻るリンク */}
      <div className="mb-6">
        <Link
          to="/profile"
          className="inline-block bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 px-4 py-2 rounded"
        >
          プロフィールに戻る
        </Link>
      </div>

      {/* 注文履歴タイトル */}
      <h2 className="text-xl font-bold mb-4">注文履歴</h2>

      {orders.length === 0 ? (
        // 注文がない場合
        <p>注文は見つかりませんでした。</p>
      ) : (
        // 注文リスト表示
        orders.map((order) => (
          <div
            key={order._id}
            className="border border-gray-300 dark:border-gray-600 p-4 mb-6 rounded-md shadow dark:bg-gray-800"
          >
            {/* 注文日時 */}
            <p className="text-sm text-gray-500 dark:text-gray-400">
              注文日時: {new Date(order.createdAt).toLocaleString()}
            </p>
            {/* 合計金額 */}
            <p>合計金額: ¥{order.totalPrice.toLocaleString()}</p>
            {/* 注文ステータス */}
            <p className="mt-1 text-sm">
              <span className="font-semibold">ステータス:</span>{" "}
              <span
                className={`inline-block px-2 py-1 rounded text-xs ${
                  order.status === "未処理"
                    ? "bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
                    : order.status === "処理中"
                    ? "bg-yellow-200 dark:bg-yellow-700 text-yellow-800 dark:text-yellow-100"
                    : order.status === "発送済み"
                    ? "bg-green-200 dark:bg-green-700 text-green-800 dark:text-green-100"
                    : order.status === "キャンセル"
                    ? "bg-red-200 dark:bg-red-700 text-red-800 dark:text-red-100"
                    : ""
                }`}
              >
                {order.status}
              </span>
            </p>

            {/* 注文商品リスト */}
            <ul className="ml-4 mt-2 space-y-4">
              {order.items.map((item, index) => {
                const product = item.productId;
                const productId = product?._id;
                const alreadyReviewed = reviewedProductIds.has(productId);

                return (
                  <li
                    key={index}
                    className="border-t border-gray-300 dark:border-gray-600 pt-4"
                  >
                    {/* 商品画像と名前 */}
                    <div className="flex items-center gap-2 mb-2">
                      {product?.imageUrl && (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          loading="lazy"
                          className="w-12 h-12 object-cover rounded border dark:border-gray-500"
                        />
                      )}
                      <span>
                        {product?.name || "商品名不明"} × {item.quantity}
                      </span>
                    </div>

                    {/* レビュー入力フォーム（未レビューの場合のみ） */}
                    {!alreadyReviewed && productId && (
                      <div className="mt-2 space-y-2">
                        {/* 評価セレクト */}
                        <select
                          className="border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded px-2 py-1 w-24"
                          value={formStates[productId]?.rating || ""}
                          onChange={(e) =>
                            handleChange(productId, "rating", e.target.value)
                          }
                        >
                          <option value="">評価</option>
                          <option value="5">★★★★★</option>
                          <option value="4">★★★★☆</option>
                          <option value="3">★★★☆☆</option>
                          <option value="2">★★☆☆☆</option>
                          <option value="1">★☆☆☆☆</option>
                        </select>

                        {/* コメント入力 */}
                        <textarea
                          className="w-full border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded p-2"
                          rows="2"
                          placeholder="コメントを書く..."
                          value={formStates[productId]?.comment || ""}
                          onChange={(e) =>
                            handleChange(productId, "comment", e.target.value)
                          }
                        />

                        {/* 投稿ボタン */}
                        <button
                          onClick={() => handleSubmitReview(productId)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded"
                        >
                          レビュー投稿
                        </button>
                      </div>
                    )}

                    {/* すでにレビュー済みの場合 */}
                    {alreadyReviewed && (
                      <p className="text-green-600 dark:text-green-400 text-sm mt-1">
                        ✅ レビュー済み
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))
      )}
    </div>
  );
};

export default MyOrders;
