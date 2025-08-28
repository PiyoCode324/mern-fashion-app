// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import AdminOrderTable from "../components/Admin/AdminOrderTable";
import AdminFilters from "../components/Admin/AdminFilters";
import AdminProductList from "../components/Admin/AdminProductList";
import AdminUserTable from "../components/Admin/AdminUserTable";
import Spinner from "../components/common/Spinner";
import SalesChart from "../components/Admin/SalesChart";
import TopProductsChart from "../components/Admin/TopProductsChart";
import CategorySalesChart from "../components/Admin/CategorySalesChart";

const AdminDashboard = () => {
  const { user, token, loadingAuth } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stockEdits, setStockEdits] = useState({});
  const [filters, setFilters] = useState({
    status: "",
    username: "",
  });

  useEffect(() => {
    if (!loadingAuth) {
      if (!user || user.role !== "admin") {
        alert("管理者のみアクセス可能です。");
        navigate("/");
      }
    }
  }, [user, loadingAuth, navigate]);

  useEffect(() => {
    if (token && user?.role === "admin") {
      const fetchData = async () => {
        try {
          setLoading(true);
          const [productsRes, ordersRes, usersRes] = await Promise.all([
            axios.get(`${import.meta.env.VITE_API_URL}/products/admin`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${import.meta.env.VITE_API_URL}/orders`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${import.meta.env.VITE_API_URL}/users`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);
          setProducts(productsRes.data);
          setOrders(ordersRes.data);
          setUsers(usersRes.data);
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

  const onRoleChange = async (userId, newRole) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
      alert("権限を更新しました！");
    } catch (err) {
      console.error("権限更新エラー:", err.response?.data || err.message);
      alert("権限の更新に失敗しました。");
    }
  };

  if (loadingAuth || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
        {/* またはテキストだけでもOK */}
        {/* <div className="text-gray-800 dark:text-white">読み込み中...</div> */}
      </div>
    );
  }
  if (error)
    return <div className="text-red-600 dark:text-red-400">{error}</div>;

  const handleStockChange = (productId, value) => {
    setStockEdits((prev) => ({
      ...prev,
      [productId]: value,
    }));
  };

  const handleSaveStock = async (productId) => {
    const newCount = stockEdits[productId];
    if (isNaN(newCount) || Number(newCount) < 0) {
      alert("有効な在庫数を入力してください（0以上の数値）。");
      return;
    }
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/products/${productId}/stock`,
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

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
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

  const handleFilterApply = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
        params: filters,
      });
      setOrders(res.data);
    } catch (err) {
      console.error("注文フィルタ取得エラー:", err);
      alert("注文の取得に失敗しました。");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("本当にこのユーザーを削除しますか？")) return;

    try {
      const idToken = token || (user && (await user.getIdToken()));
      await axios.delete(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
    } catch (err) {
      console.error("削除エラー:", err);
      alert("削除に失敗しました。");
    }
  };

  return (
    <div className="px-4 py-6 max-w-screen-lg mx-auto w-full text-gray-800 dark:text-white dark:bg-gray-900">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-block bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1.5 text-sm rounded dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
        >
          ホームに戻る
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        管理者ダッシュボード
      </h1>

      <section className="mb-10">
        <AdminProductList products={products} />
      </section>

      <section className="mb-10">
        {products.length === 0 ? (
          <p>商品が登録されていません。</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 dark:border-gray-600 whitespace-nowrap">
              {/* ★ここを修正します。`{" "}` を削除するか、タグを密着させます。 */}
              {/* <table ...>{" "}<thead>...</table> の {" "} を削除 */}
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700 text-sm text-gray-800 dark:text-white">
                  <th className="border p-2 w-36 dark:border-gray-600">ID</th>
                  <th className="border p-2 dark:border-gray-600">商品名</th>
                  <th className="border p-2 dark:border-gray-600">
                    カテゴリー
                  </th>
                  <th className="border p-2 dark:border-gray-600">価格</th>
                  <th className="border p-2 dark:border-gray-600">在庫</th>
                  <th className="border p-2 w-40 dark:border-gray-600">
                    在庫管理
                  </th>
                  <th className="border p-2 dark:border-gray-600">作成者</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="text-center text-sm">
                    <td className="border p-2 break-all dark:border-gray-600">
                      {product._id}
                    </td>
                    <td className="border p-2 dark:border-gray-600">
                      {product.name}
                    </td>
                    <td className="border p-2 dark:border-gray-600">
                      {product.category}
                    </td>
                    <td className="border p-2 dark:border-gray-600">
                      ¥{product.price?.toLocaleString()}
                    </td>
                    <td className="border p-2 dark:border-gray-600">
                      {product.countInStock}
                    </td>
                    <td className="border p-2 dark:border-gray-600">
                      <input
                        type="number"
                        min="0"
                        value={stockEdits[product._id] ?? product.countInStock}
                        onChange={(e) =>
                          handleStockChange(product._id, e.target.value)
                        }
                        className="w-16 p-1 border rounded text-center text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
                      />
                      <button
                        onClick={() => handleSaveStock(product._id)}
                        className="ml-1 bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                      >
                        保存
                      </button>
                    </td>
                    <td className="border p-2 dark:border-gray-600">
                      <div className="whitespace-normal break-words">
                        {product.createdBy?.name || "不明"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <AdminFilters
        filters={filters}
        setFilters={setFilters}
        onFilterApply={handleFilterApply}
      />

      {/* AdminOrderTableとAdminUserTableも同様に内部でテーブルをoverflow-x-autoで囲むことを検討してください。 */}
      <AdminOrderTable orders={orders} token={token} setOrders={setOrders} />

      <AdminUserTable
        users={users}
        onRoleChange={onRoleChange}
        onDelete={handleDelete}
      />

      {/* SalesChart */}
      <section className="mb-10 overflow-x-auto">
        <div className="min-w-[350px]">
          <SalesChart token={token} />
        </div>
      </section>

      {/* TopProductsChart */}
      <section className="mb-10 overflow-x-auto">
        <div className="min-w-[350px]">
          <TopProductsChart token={token} />
        </div>
      </section>

      {/* CategorySalesChart */}
      <section className="mb-10 overflow-x-auto">
        <div className="min-w-[350px]">
          <CategorySalesChart token={token} />
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
