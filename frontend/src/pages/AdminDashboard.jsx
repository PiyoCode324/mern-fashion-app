// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const AdminDashboard = () => {
  // 認証情報（ユーザー情報、トークン、認証ロード状態）を取得
  const { user, token, loadingAuth } = useAuth();
  const navigate = useNavigate();

  // 商品リスト、注文リスト、読み込み状態、エラー、在庫編集用入力値を管理
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stockEdits, setStockEdits] = useState({}); // 商品IDをキーにした一時的な在庫入力値

  // 管理者以外はホームへリダイレクト
  useEffect(() => {
    if (!loadingAuth) {
      if (!user || user.role !== "admin") {
        alert("管理者のみアクセス可能です。");
        navigate("/");
      }
    }
  }, [user, loadingAuth, navigate]);

  // トークンと管理者ユーザーがいる場合に商品・注文データを取得
  useEffect(() => {
    if (token && user?.role === "admin") {
      const fetchData = async () => {
        try {
          setLoading(true);
          const [productsRes, ordersRes] = await Promise.all([
            axios.get("/api/products/admin", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("/api/orders", {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);
          setProducts(productsRes.data);
          setOrders(ordersRes.data);
          setError(null);
        } catch (err) {
          console.error(err);
          setError("データの取得に失敗しました。");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [token, user]);

  // 認証処理またはデータ取得中はローディング表示
  if (loadingAuth || loading) return <div>読み込み中...</div>;

  // エラー表示
  if (error) return <div className="text-red-600">{error}</div>;

  // 在庫入力値更新
  const handleStockChange = (productId, value) => {
    setStockEdits((prev) => ({
      ...prev,
      [productId]: value,
    }));
  };

  // 在庫保存処理
  const handleSaveStock = async (productId) => {
    const newCount = stockEdits[productId];
    if (isNaN(newCount) || Number(newCount) < 0) {
      alert("有効な在庫数を入力してください（0以上の数値）。");
      return;
    }
    try {
      await axios.patch(
        `/api/products/${productId}/stock`,
        { countInStock: Number(newCount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProducts((prev) =>
        prev.map((p) =>
          p._id === productId ? { ...p, countInStock: Number(newCount) } : p
        )
      );
      setStockEdits((prev) => {
        const newState = { ...prev };
        delete newState[productId];
        return newState;
      });
      alert("在庫を更新しました！");
    } catch (err) {
      console.error(
        "在庫更新エラー:",
        err.response?.data?.message || err.message
      );
      alert(
        `在庫の更新に失敗しました: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  // 注文ステータス更新処理
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.patch(
        `/api/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 状態を即座に反映
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );

      alert("注文ステータスを更新しました！");
    } catch (err) {
      console.error("ステータス更新エラー:", err.response?.data || err.message);
      alert(
        `ステータス更新に失敗しました: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* ホームへ戻るリンク */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-block bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
        >
          ホームに戻る
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">管理者ダッシュボード</h1>

      {/* 商品一覧セクション */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">商品一覧</h2>
        {products.length === 0 ? (
          <p>商品が登録されていません。</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">ID</th>
                <th className="border border-gray-300 p-2">商品名</th>
                <th className="border border-gray-300 p-2">カテゴリー</th>
                <th className="border border-gray-300 p-2">価格</th>
                <th className="border border-gray-300 p-2">現在の在庫</th>
                <th className="border border-gray-300 p-2">在庫管理</th>
                <th className="border border-gray-300 p-2">作成者</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="text-center">
                  <td className="border border-gray-300 p-2 text-sm">
                    {product._id}
                  </td>
                  <td className="border border-gray-300 p-2">{product.name}</td>
                  <td className="border border-gray-300 p-2">
                    {product.category}
                  </td>
                  <td className="border border-gray-300 p-2">
                    ¥{product.price?.toLocaleString() || "0"}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {product.countInStock}
                  </td>
                  <td className="border border-gray-300 p-2">
                    <input
                      type="number"
                      min="0"
                      value={stockEdits[product._id] ?? product.countInStock}
                      onChange={(e) =>
                        handleStockChange(product._id, e.target.value)
                      }
                      className="w-20 p-1 border rounded text-center"
                    />
                    <button
                      onClick={() => handleSaveStock(product._id)}
                      className="ml-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                    >
                      保存
                    </button>
                  </td>
                  <td className="border border-gray-300 p-2">
                    {product.createdBy?.name || "不明"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* 注文一覧セクション */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">注文一覧</h2>
        {orders.length === 0 ? (
          <p>注文がありません。</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">注文ID</th>
                <th className="border border-gray-300 p-2">ユーザー名</th>
                <th className="border border-gray-300 p-2">合計金額</th>
                <th className="border border-gray-300 p-2">注文日時</th>
                <th className="border border-gray-300 p-2">商品詳細</th>
                <th className="border border-gray-300 p-2">ステータス</th>{" "}
                {/* 追加 */}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="text-center">
                  <td className="border border-gray-300 p-2 text-sm">
                    {order._id}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {order.userUid?.name || "（不明なユーザー）"}
                  </td>
                  <td className="border border-gray-300 p-2">
                    ¥{order.totalPrice?.toLocaleString() || "0"}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  <td className="border border-gray-300 p-2 text-left">
                    {order.items?.map((item) => (
                      <div key={item._id}>
                        {item.productId?.name || "不明な商品"} x {item.quantity}{" "}
                        (¥
                        {item.price?.toLocaleString()})
                      </div>
                    ))}
                  </td>
                  <td className="border border-gray-300 p-2">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order._id, e.target.value)
                      }
                      className="p-1 border rounded"
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
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
