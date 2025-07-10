// src/pages/MyOrders.jsx
import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.log("ログインしていません");
        return;
      }

      const idToken = await user.getIdToken();

      const res = await fetch("/api/orders/my-orders", {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!res.ok) {
        console.error("注文取得に失敗しました");
        return;
      }

      const data = await res.json();
      setOrders(data);
      setLoading(false);
    };

    fetchOrders();
  }, []);

  if (loading) return <p>読み込み中...</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">注文履歴</h2>
      {orders.length === 0 ? (
        <p>注文履歴はありません。</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="border p-4 mb-4 rounded-md shadow">
            <p className="text-sm text-gray-500">
              注文日時: {new Date(order.createdAt).toLocaleString()}
            </p>
            <p>合計金額: ¥{order.totalAmount}</p>
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
