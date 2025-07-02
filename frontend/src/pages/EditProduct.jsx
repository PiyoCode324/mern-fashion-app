// src/pages/EditProduct.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    imageUrl: "",
    price: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 商品データの取得
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/products/${id}`)
      .then((res) => {
        setForm(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("商品情報の取得に失敗しました");
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/products/${id}`, form);
      navigate("/"); // 商品一覧に戻る
    } catch (err) {
      console.error("更新エラー:", err);
      alert("商品更新に失敗しました。");
    }
  };

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">商品を編集</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="商品名"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="">カテゴリ</option>
          <option value="tops">トップス</option>
          <option value="bottoms">ボトムス</option>
          <option value="accessory">アクセサリー</option>
          <option value="hat">帽子</option>
          <option value="bag">バッグ</option>
        </select>
        <textarea
          name="description"
          placeholder="説明"
          value={form.description}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="imageUrl"
          placeholder="画像URL"
          value={form.imageUrl}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="number"
          name="price"
          placeholder="価格"
          value={form.price}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded"
        >
          更新する
        </button>
      </form>
    </div>
  );
};

export default EditProduct;
