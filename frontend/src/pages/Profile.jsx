// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user, token, setUserName } = useAuth();
  const [name, setName] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [message, setMessage] = useState("");
  const [nameError, setNameError] = useState(""); // 名前入力のエラー管理

  // 🛍️ State for user's product listings
  const [myProducts, setMyProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState(null);

  // 初期名セット
  useEffect(() => {
    if (user) {
      setName(user.name);
      setOriginalName(user.name);
      setNameError("");
      setMessage("");
    }
  }, [user]);

  // ユーザーの商品一覧取得
  useEffect(() => {
    const fetchMyProducts = async () => {
      if (!token) return;
      try {
        setLoadingProducts(true);
        const res = await axios.get("/api/products/mine", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMyProducts(res.data);
        setProductError(null);
      } catch (err) {
        console.error("自分の商品一覧取得エラー:", err);
        setProductError("商品一覧の取得に失敗しました。");
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchMyProducts();
  }, [token]);

  // 名前バリデーション関数
  const validateName = (input) => {
    if (!input.trim()) {
      setNameError("名前は空にできません。");
      return false;
    }
    setNameError("");
    return true;
  };

  // 名前更新処理
  const handleUpdate = async () => {
    if (!validateName(name)) {
      setMessage("");
      return;
    }
    if (name === originalName) {
      setMessage("変更内容がありません。");
      return;
    }

    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/users/${user.uid}`,
        { name },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("名前更新成功", res.data);
      setMessage("名前を更新しました！");
      setOriginalName(name);
      setUserName(name);
    } catch (error) {
      console.error("名前の更新に失敗しました:", error);
      setMessage("名前の更新に失敗しました。");
    }
  };

  // 在庫編集関連
  const [stockEdits, setStockEdits] = useState({});
  const [updatingId, setUpdatingId] = useState(null);

  const handleSaveStock = async (productId) => {
    const newStock = Number(stockEdits[productId]);
    if (isNaN(newStock) || newStock < 0) {
      alert("在庫数は0以上の整数で入力してください");
      return;
    }

    try {
      setUpdatingId(productId);
      await axios.patch(
        `/api/products/${productId}/stock`,
        { countInStock: newStock },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("在庫を更新しました");
      setMyProducts((prev) =>
        prev.map((p) =>
          p._id === productId ? { ...p, countInStock: newStock } : p
        )
      );
    } catch (err) {
      console.error(err);
      alert("在庫の更新に失敗しました");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      {/* 🔙 ホームへ戻るリンク */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-block bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
        >
          ホームに戻る
        </Link>
      </div>

      {/* 名前編集フォーム */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          名前
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            validateName(e.target.value);
            setMessage("");
          }}
          className={`w-full border rounded px-3 py-2 ${
            nameError ? "border-red-500" : "border-gray-300"
          }`}
        />
        {nameError && <p className="text-red-600 text-sm mt-1">{nameError}</p>}
      </div>

      <button
        onClick={handleUpdate}
        className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition"
      >
        ✏️ 名前を更新
      </button>

      {/* 更新結果メッセージ */}
      {message && (
        <p className="mt-4 text-sm text-gray-700 font-medium">{message}</p>
      )}

      {/* 注文履歴リンク */}
      <div className="mt-6 mb-6">
        <Link
          to="/my-orders"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 inline-block"
        >
          🧾 注文履歴を見る
        </Link>
      </div>

      {/* 自分の商品一覧と在庫編集 */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">自分の商品一覧</h2>
        {loadingProducts ? (
          <p>読み込み中...</p>
        ) : productError ? (
          <p className="text-red-600">{productError}</p>
        ) : myProducts.length === 0 ? (
          <p>登録した商品はありません。</p>
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
              {myProducts.map((product) => (
                <tr key={product._id} className="text-center">
                  <td className="border border-gray-300 p-2">{product.name}</td>
                  <td className="border border-gray-300 p-2">
                    {product.category}
                  </td>
                  <td className="border border-gray-300 p-2">
                    ¥{product.price.toLocaleString()}
                  </td>
                  {product.createdBy === user._id && (
                    <td className="border p-2 text-center">
                      <div className="flex items-center justify-center">
                        <input
                          type="number"
                          className="w-20 border rounded p-1 text-center"
                          value={
                            stockEdits[product._id] ?? product.countInStock
                          }
                          onChange={(e) =>
                            setStockEdits({
                              ...stockEdits,
                              [product._id]: e.target.value,
                            })
                          }
                        />
                        <button
                          onClick={() => handleSaveStock(product._id)}
                          disabled={updatingId === product._id}
                          className="ml-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          保存
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default Profile;
