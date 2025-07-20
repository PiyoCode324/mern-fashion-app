// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const AdminDashboard = () => {
  // Get authentication details (user info, token, and loading state)
  const { user, token, loadingAuth } = useAuth();
  const navigate = useNavigate();

  // States for managing product list, order list, loading status, error messages, and stock edit inputs
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stockEdits, setStockEdits] = useState({}); // Temporary values for editing stock (keyed by productId)

  // --- Admin check and redirection ---
  useEffect(() => {
    if (!loadingAuth) {
      // After authentication completes, redirect non-admin users to the home page
      if (!user || user.role !== "admin") {
        alert("管理者のみアクセス可能です。");
        navigate("/"); // Redirect to Home
      }
    }
  }, [user, loadingAuth, navigate]);

  // --- Fetch product and order lists ---
  useEffect(() => {
    // Fetch data only if token is available and user is an admin
    if (token && user?.role === "admin") {
      const fetchData = async () => {
        try {
          setLoading(true); // Start loading
          // Fetch products and orders in parallel
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
          setError(null); // Clear any previous error
        } catch (err) {
          console.error(err);
          setError("データの取得に失敗しました。");
        } finally {
          setLoading(false); // End loading
        }
      };
      fetchData();
    }
  }, [token, user]);

  // Show loading screen during authentication or data fetching
  if (loadingAuth || loading) return <div>Loading...</div>;

  // Display an error message if one occurs
  if (error) return <div className="text-red-600">{error}</div>;

  // --- Update stock input values ---
  const handleStockChange = (productId, value) => {
    setStockEdits((prev) => ({
      ...prev,
      [productId]: value, // Save new stock value using productId as key
    }));
  };

  // --- Handle stock update ---
  const handleSaveStock = async (productId) => {
    const newCount = stockEdits[productId];
    // Validate stock value (must be a number and 0 or more)
    if (isNaN(newCount) || Number(newCount) < 0) {
      alert("有効な在庫数を入力してください（0以上の数値）。");
      return;
    }
    try {
      // Send PATCH request to update stock on the server
      await axios.patch(
        `/api/products/${productId}/stock`,
        { countInStock: Number(newCount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update local product state on success
      setProducts((prev) =>
        prev.map((p) =>
          p._id === productId ? { ...p, countInStock: Number(newCount) } : p
        )
      );
      // Remove edited value from stockEdits
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

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Link to Home */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-block bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
        >
          ホームに戻る
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">管理者ダッシュボード</h1>

      {/* --- Product List Section --- */}
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
                  {/* Product ID (displayed in smaller text) */}
                  <td className="border border-gray-300 p-2 text-sm">
                    {product._id}
                  </td>
                  {/* Product name */}
                  <td className="border border-gray-300 p-2">{product.name}</td>
                  {/* Category */}
                  <td className="border border-gray-300 p-2">
                    {product.category}
                  </td>
                  {/* Price (formatted with commas) */}
                  <td className="border border-gray-300 p-2">
                    ¥{product.price?.toLocaleString() || "0"}
                  </td>
                  {/* Current stock */}
                  <td className="border border-gray-300 p-2">
                    {product.countInStock}
                  </td>
                  {/* Stock management: input and save button */}
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
                  {/* Creator name (display "Unknown" if not available) */}
                  <td className="border border-gray-300 p-2">
                    {product.createdBy?.name || "不明"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* --- Order List Section --- */}
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
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="text-center">
                  {/* Order ID (displayed in smaller text) */}
                  <td className="border border-gray-300 p-2 text-sm">
                    {order._id}
                  </td>
                  {/* Name of the user who placed the order */}
                  <td className="border border-gray-300 p-2">
                    {order.userUid?.name || "（不明なユーザー）"}
                  </td>
                  {/* Total price (formatted with commas) */}
                  <td className="border border-gray-300 p-2">
                    ¥{order.totalPrice?.toLocaleString() || "0"}
                  </td>
                  {/* Order date/time (converted to local time) */}
                  <td className="border border-gray-300 p-2">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  {/* Detailed list of ordered items */}
                  <td className="border border-gray-300 p-2 text-left">
                    {order.items?.map((item) => (
                      <div key={item._id}>
                        {item.productId?.name || "不明な商品"} x {item.quantity}{" "}
                        (¥{item.price?.toLocaleString()})
                      </div>
                    ))}
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
