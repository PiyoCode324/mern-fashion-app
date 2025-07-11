// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const { user, token, loadingAuth } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 管理者以外はリダイレクト
  useEffect(() => {
    if (!loadingAuth) {
      if (!user || user.role !== "admin") {
        alert("管理者のみアクセス可能です。");
        navigate("/"); // ホームへリダイレクト
      }
    }
  }, [user, loadingAuth, navigate]);

  // 商品一覧・注文一覧取得
  useEffect(() => {
    if (token && user?.role === "admin") {
      const fetchData = async () => {
        try {
          setLoading(true);
          const [productsRes, ordersRes] = await Promise.all([
            axios.get("/api/products", {
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

  if (loadingAuth || loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">管理者ダッシュボード</h1>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">商品一覧</h2>
        {products.length === 0 ? (
          <p>商品が登録されていません。</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">商品名</th>
                <th className="border border-gray-300 p-2">カテゴリ</th>
                <th className="border border-gray-300 p-2">価格</th>
                <th className="border border-gray-300 p-2">在庫数</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="text-center">
                  <td className="border border-gray-300 p-2">{product.name}</td>
                  <td className="border border-gray-300 p-2">
                    {product.category}
                  </td>
                  <td className="border border-gray-300 p-2">
                    ¥{product.price}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {product.countInStock}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

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
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="text-center">
                  <td className="border border-gray-300 p-2">{order._id}</td>
                  <td className="border border-gray-300 p-2">
                    {order.userName}
                  </td>
                  <td className="border border-gray-300 p-2">
                    ¥{order.totalPrice}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {new Date(order.createdAt).toLocaleString()}
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
