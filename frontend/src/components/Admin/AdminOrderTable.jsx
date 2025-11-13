// src/components/Admin/AdminOrderTable.jsx
import React from "react";
import axios from "axios";

const AdminOrderTable = ({ orders, token, setOrders }) => {
  // 注文ステータスを変更する処理
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      // APIリクエストで注文ステータスを更新
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/orders/${orderId}/status`,
        { status: newStatus }, // 更新内容（新しいステータス）
        { headers: { Authorization: `Bear2er ${token}` } } // 認証トークンをヘッダーに付与
      );

      // ステートを更新してUIを即座に反映
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );

      alert("注文ステータスを更新しました！");
    } catch (err) {
      // エラー内容をログに出力
      console.error("ステータス更新エラー:", err.response?.data || err.message);
      // ユーザーにもエラーを通知
      alert(
        `ステータス更新に失敗しました: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  return (
    <section className="text-gray-800 dark:text-white">
      {/* 見出し */}
      <h2 className="text-2xl font-semibold mb-4">注文一覧</h2>

      {/* 注文が存在しない場合 */}
      {orders.length === 0 ? (
        <p>注文がありません。</p>
      ) : (
        // 横スクロールを可能にするラッパー
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 dark:border-gray-600 whitespace-nowrap">
            {/* テーブルヘッダー */}
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                <th className="border border-gray-300 dark:border-gray-600 p-2">
                  注文ID
                </th>
                <th className="border border-gray-300 dark:border-gray-600 p-2">
                  ユーザー名
                </th>
                <th className="border border-gray-300 dark:border-gray-600 p-2">
                  合計金額
                </th>
                <th className="border border-gray-300 dark:border-gray-600 p-2">
                  注文日時
                </th>
                <th className="border border-gray-300 dark:border-gray-600 p-2">
                  商品詳細
                </th>
                <th className="border border-gray-300 dark:border-gray-600 p-2">
                  ステータス
                </th>
              </tr>
            </thead>

            {/* テーブル本体 */}
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="text-center">
                  {/* 注文ID */}
                  <td className="border border-gray-300 dark:border-gray-600 p-2 text-sm">
                    {order._id}
                  </td>

                  {/* ユーザー名（存在しない場合は代替表示） */}
                  <td className="border border-gray-300 dark:border-gray-600 p-2">
                    {order.userUid?.name || "（不明なユーザー）"}
                  </td>

                  {/* 合計金額（数値をカンマ区切りで表示） */}
                  <td className="border border-gray-300 dark:border-gray-600 p-2">
                    ¥{order.totalPrice?.toLocaleString() || "0"}
                  </td>

                  {/* 注文日時（日本時間でフォーマット済み） */}
                  <td className="border border-gray-300 dark:border-gray-600 p-2">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>

                  {/* 商品詳細（注文内の全アイテムを列挙） */}
                  <td className="border border-gray-300 dark:border-gray-600 p-2 text-left">
                    {order.items?.map((item, index) => (
                      <div key={item._id || `${order._id}-${index}`}>
                        {item.productId?.name || "不明な商品"} x {item.quantity}{" "}
                        ( ¥{item.price?.toLocaleString()} )
                      </div>
                    ))}
                  </td>

                  {/* ステータス（セレクトボックスで変更可能） */}
                  <td className="border border-gray-300 dark:border-gray-600 p-2">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order._id, e.target.value)
                      }
                      className="p-1 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    >
                      <option value="未処理">未処理</option>
                      <option value="処理中">処理中</option>
                      <option value="発送済み">発送済み</option>
                      <option value="キャンセル">キャンセル</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default AdminOrderTable;




