// src/pages/MyOrders.jsx
import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { Link } from "react-router-dom";

const MyOrders = () => {
  const [orders, setOrders] = useState([]); // 🧾 ユーザーの注文履歴
  const [loading, setLoading] = useState(true); // 🔄 ローディング状態

  // 🔽 注文履歴の取得処理（初回マウント時）
  useEffect(() => {
    const fetchOrders = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.log("ログインしていません");
        return;
      }

      const idToken = await user.getIdToken(); // 🔐 Firebaseトークン取得

      const res = await fetch("/api/orders/my-orders", {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!res.ok) {
        console.error("注文取得に失敗しました");
        return;
      }

      const data = await res.json(); // ✅ 注文データ取得成功
      setOrders(data);
      setLoading(false);
    };

    fetchOrders();
  }, []);

  // 🔄 ローディング中の表示
  if (loading) return <p>読み込み中...</p>;

  return (
    <div>
      {/* 🔙 プロフィールに戻るボタン */}
      <div className="mb-6">
        <Link
          to="/profile"
          className="inline-block bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
        >
          プロフィールに戻る
        </Link>
      </div>

      <h2 className="text-xl font-bold mb-4">注文履歴</h2>

      {/* 📦 注文一覧表示 */}
      {orders.length === 0 ? (
        <p>注文履歴はありません。</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="border p-4 mb-4 rounded-md shadow">
            <p className="text-sm text-gray-500">
              注文日時: {new Date(order.createdAt).toLocaleString()}
            </p>
            <p>合計金額: ¥{order.totalPrice.toLocaleString()}</p>

            {/* 🧾 商品の明細 */}
            <ul className="ml-4 mt-2">
              {order.items.map((item, index) => (
                <li key={index}>
                  {item.productId?.name || "商品名なし"} × {item.quantity}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
};

export default MyOrders;
