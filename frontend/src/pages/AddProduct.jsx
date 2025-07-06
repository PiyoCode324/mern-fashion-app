// src/pages/AddProduct.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const AddProduct = () => {
  const { user: mongoUser, token } = useAuth();
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    imageUrl: "",
    price: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔒 ユーザー情報が未取得のとき送信しない
    if (!mongoUser?._id) {
      alert("ユーザー情報の取得中です。しばらくしてから再度お試しください。");
      return;
    }

    try {
      const submitData = {
        ...form,
        price: Number(form.price),
        createdBy: mongoUser._id,
      };

      console.log("📦 送信データ:", submitData); // ← デバッグ用
      console.log("🧑 mongoUser:", mongoUser);
      console.log("🆔 createdBy:", mongoUser?._id);
      console.log("🔑 トークン:", token?.slice(0, 30) + "..."); // ← 長いので省略表示

      await axios.post(`${import.meta.env.VITE_API_URL}/products`, submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate("/");
    } catch (err) {
      console.error("登録エラー:", err);
      alert("商品登録に失敗しました。");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">新しい商品を追加</h2>

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
          className="w-full p-2 border rounded mb-4"
          required
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
          min="0"
        />

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded"
        >
          登録する
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
