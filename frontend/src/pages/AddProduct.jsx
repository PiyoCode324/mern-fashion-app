// src/pages/AddProduct.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Add Product Page Components
const AddProduct = () => {
  // Manages the form state (default is blank)
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    imageUrl: "",
    price: "",
  });

  const navigate = useNavigate(); // For page transitions

  // Update state when form input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // What happens when a form is submitted
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    try {
      // Convert the 'price' string to a number (Mongoose uses Number type).
      const submitData = {
        ...form,
        price: Number(form.price),
      };

      // Sending product data in a POST request
      await axios.post(`${import.meta.env.VITE_API_URL}/products`, submitData);

      // After successful registration, user will be redirected to the product list page.
      navigate("/");
    } catch (err) {
      console.error("登録エラー:", err);
      alert("商品登録に失敗しました。");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">新しい商品を追加</h2>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Enter the product name */}
        <input
          type="text"
          name="name"
          placeholder="商品名"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        {/* Select a category */}
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

        {/* Product Description */}
        <textarea
          name="description"
          placeholder="説明"
          value={form.description}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        {/* Enter image URL */}
        <input
          type="text"
          name="imageUrl"
          placeholder="画像URL"
          value={form.imageUrl}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        {/* Entering prices */}
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

        {/* Registration button */}
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
