// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import AdminOrderTable from "../components/Admin/AdminOrderTable";
import AdminFilters from "../components/Admin/AdminFilters";
import AdminProductList from "../components/Admin/AdminProductList";
import AdminUserTable from "../components/Admin/AdminUserTable";

const AdminDashboard = () => {
  // 認証情報（ユーザー情報、トークン、認証ロード状態）を取得
  const { user, token, loadingAuth } = useAuth();
  const navigate = useNavigate();

  // 各種stateはすべてトップで呼び出し
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

  // 管理者以外はホームへリダイレクト（useEffectはトップで）
  useEffect(() => {
    if (!loadingAuth) {
      if (!user || user.role !== "admin") {
        alert("管理者のみアクセス可能です。");
        navigate("/");
      }
    }
  }, [user, loadingAuth, navigate]);

  // 商品・注文・ユーザー一覧取得
  useEffect(() => {
    if (token && user?.role === "admin") {
      const fetchData = async () => {
        try {
          setLoading(true);
          const [productsRes, ordersRes, usersRes] = await Promise.all([
            axios.get("/api/products/admin", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("/api/orders", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("/api/users", {
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

  // 管理者権限トグル変更関数
  const onRoleChange = async (userId, newRole) => {
    try {
      await axios.patch(
        `/api/users/${userId}/role`,
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

  // ローディングまたは認証ロード中は表示
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

  // 注文フィルター適用
  const handleFilterApply = async () => {
    try {
      const res = await axios.get("/api/orders", {
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
      // すでにtokenがあるならそれを使う。ないならuserから取得
      const idToken = token || (user && (await user.getIdToken()));

      await axios.delete(`/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 削除後、ユーザー一覧から取り除く
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
    } catch (err) {
      console.error("削除エラー:", err);
      alert("削除に失敗しました。");
    }
  };

  return (
    <div className="px-4 py-6 max-w-screen-lg mx-auto w-full">
      {/* ホームへ戻るリンク */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-block bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1.5 text-sm rounded"
        >
          ホームに戻る
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">管理者ダッシュボード</h1>

      <section className="mb-10">
        <AdminProductList products={products} />
      </section>

      {/* 商品一覧セクション */}
      <section className="mb-10">
        {products.length === 0 ? (
          <p>商品が登録されていません。</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300 table-fixed">
            <thead>
              <tr className="bg-gray-200 text-sm">
                <th className="border p-2 w-36">ID</th>
                <th className="border p-2">商品名</th>
                <th className="border p-2">カテゴリー</th>
                <th className="border p-2">価格</th>
                <th className="border p-2">在庫</th>
                <th className="border p-2 w-40">在庫管理</th>
                <th className="border p-2">作成者</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="text-center text-sm">
                  <td className="border p-2 break-all">{product._id}</td>
                  <td className="border p-2">{product.name}</td>
                  <td className="border p-2">{product.category}</td>
                  <td className="border p-2">
                    ¥{product.price?.toLocaleString()}
                  </td>
                  <td className="border p-2">{product.countInStock}</td>
                  <td className="border p-2">
                    <input
                      type="number"
                      min="0"
                      value={stockEdits[product._id] ?? product.countInStock}
                      onChange={(e) =>
                        handleStockChange(product._id, e.target.value)
                      }
                      className="w-16 p-1 border rounded text-center text-sm"
                    />
                    <button
                      onClick={() => handleSaveStock(product._id)}
                      className="ml-1 bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                    >
                      保存
                    </button>
                  </td>
                  <td className="border p-2">
                    <div className="whitespace-normal break-words">
                      {product.createdBy?.name || "不明"}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <AdminFilters
        filters={filters}
        setFilters={setFilters}
        onFilterApply={handleFilterApply}
      />

      {/* 注文一覧セクション */}
      <AdminOrderTable orders={orders} token={token} setOrders={setOrders} />

      {/* ユーザー一覧セクション */}
      <AdminUserTable
        users={users}
        onRoleChange={onRoleChange}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default AdminDashboard;
