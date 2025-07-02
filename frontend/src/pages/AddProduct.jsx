// src/pages/AddProduct.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddProduct = () => {
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    // 変更点: image を imageUrl に変更
    imageUrl: "",
    price: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // priceを数値に変換して送信
      const submitData = {
        ...form,
        price: Number(form.price),
      };

      // 環境変数VITE_API_URLが正しく設定されていることを確認してください
      await axios.post(`${import.meta.env.VITE_API_URL}/products`, submitData);
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
          name="imageUrl" // 変更点: name を imageUrl に変更
          placeholder="画像URL"
          value={form.imageUrl} // 変更点: value も imageUrl に変更
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
