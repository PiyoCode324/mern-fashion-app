// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const AdminDashboard = () => {
  // 認証情報を取得（ユーザー情報・トークン・認証処理中フラグ）
  const { user, token, loadingAuth } = useAuth();
  const navigate = useNavigate();

  // 商品一覧・注文一覧・ローディング・エラー状態・在庫編集状態を管理するstate
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stockEdits, setStockEdits] = useState({}); // 在庫編集用の一時保存データ（productIdごとに入力値を保持）

  // --- 管理者判定とリダイレクト ---
  useEffect(() => {
    if (!loadingAuth) {
      // 認証処理が終わったら、ユーザーが管理者でなければトップページへ強制移動
      if (!user || user.role !== "admin") {
        alert("管理者のみアクセス可能です。");
        navigate("/"); // ホームへリダイレクト
      }
    }
  }, [user, loadingAuth, navigate]);

  // --- 商品一覧・注文一覧の取得 ---
  useEffect(() => {
    // トークンがあり、ユーザーが管理者の場合のみAPIからデータ取得
    if (token && user?.role === "admin") {
      const fetchData = async () => {
        try {
          setLoading(true); // ローディング開始
          // 商品一覧と注文一覧を並列で取得
          const [productsRes, ordersRes] = await Promise.all([
            axios.get("/api/products/admin", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("/api/orders", {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);
          setProducts(productsRes.data); // 商品一覧をセット
          setOrders(ordersRes.data); // 注文一覧をセット
          setError(null); // エラークリア
        } catch (err) {
          console.error(err);
          setError("データの取得に失敗しました。"); // エラーメッセージ表示用セット
        } finally {
          setLoading(false); // ローディング終了
        }
      };
      fetchData();
    }
  }, [token, user]);

  // 認証やデータ取得中はローディング表示
  if (loadingAuth || loading) return <div>Loading...</div>;

  // エラーがあればメッセージ表示
  if (error) return <div className="text-red-600">{error}</div>;

  // --- 在庫編集用の入力値を更新 ---
  const handleStockChange = (productId, value) => {
    setStockEdits((prev) => ({
      ...prev,
      [productId]: value, // productIdをキーにして新しい在庫数を保存
    }));
  };

  // --- 在庫保存処理 ---
  const handleSaveStock = async (productId) => {
    const newCount = stockEdits[productId];
    // 在庫数のバリデーション（数値かつ0以上）
    if (isNaN(newCount) || Number(newCount) < 0) {
      alert("有効な在庫数を入力してください（0以上の数値）。");
      return;
    }
    try {
      // APIへPATCHリクエストを送って在庫数を更新
      await axios.patch(
        `/api/products/${productId}/stock`,
        { countInStock: Number(newCount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // 成功したらローカルstateも更新
      setProducts((prev) =>
        prev.map((p) =>
          p._id === productId ? { ...p, countInStock: Number(newCount) } : p
        )
      );
      // stockEditsから該当の編集データを削除（リセット）
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
      {/* ホームへのリンク */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-block bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
        >
          ホームに戻る
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">管理者ダッシュボード</h1>

      {/* --- 商品一覧セクション --- */}
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
                  {/* 商品ID（小さく表示） */}
                  <td className="border border-gray-300 p-2 text-sm">
                    {product._id}
                  </td>
                  {/* 商品名 */}
                  <td className="border border-gray-300 p-2">{product.name}</td>
                  {/* カテゴリー */}
                  <td className="border border-gray-300 p-2">
                    {product.category}
                  </td>
                  {/* 価格（カンマ区切りで表示） */}
                  <td className="border border-gray-300 p-2">
                    ¥{product.price?.toLocaleString() || "0"}
                  </td>
                  {/* 現在の在庫数 */}
                  <td className="border border-gray-300 p-2">
                    {product.countInStock}
                  </td>
                  {/* 在庫管理：在庫数の入力と保存ボタン */}
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
                  {/* 作成者の名前（不明なら「不明」と表示） */}
                  <td className="border border-gray-300 p-2">
                    {product.createdBy?.name || "不明"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* --- 注文一覧セクション --- */}
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
                  {/* 注文ID（小さく表示） */}
                  <td className="border border-gray-300 p-2 text-sm">
                    {order._id}
                  </td>
                  {/* 注文者の名前（userUidがpopulateされている想定） */}
                  <td className="border border-gray-300 p-2">
                    {order.userUid?.name || "（不明なユーザー）"}
                  </td>
                  {/* 合計金額（カンマ区切り） */}
                  <td className="border border-gray-300 p-2">
                    ¥{order.totalPrice?.toLocaleString() || "0"}
                  </td>
                  {/* 注文日時（ローカル時間で表示） */}
                  <td className="border border-gray-300 p-2">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  {/* 注文商品の詳細リスト */}
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
