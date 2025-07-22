// src/pages/AddProduct.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";

const AddProduct = () => {
  // Get MongoDB user data and authentication token
  const { user: mongoUser, token } = useAuth();

  // Flag to indicate if an image is currently being uploaded
  const [uploading, setUploading] = useState(false);

  // State for the product form
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    imageUrl: "", // URL is set after uploading to Cloudinary
    price: "",
  });

  const navigate = useNavigate();

  // Handle input field changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle image file upload to Cloudinary
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "mern-fashion-app-unsigned"); // Cloudinary upload preset name

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dagqtxj06/image/upload", // Replace with your Cloudinary cloud name
        formData
      );
      // Set the uploaded image URL to form state
      setForm((prev) => ({ ...prev, imageUrl: res.data.secure_url }));
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("画像のアップロードに失敗しました。");
    } finally {
      setUploading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // If user data hasn't loaded yet, prevent submission
    if (!mongoUser?._id) {
      toast.error(
        "ユーザーデータを読み込み中です。少し待ってから再度お試しください。"
      );
      return;
    }

    try {
      // Prepare data to submit
      const submitData = {
        ...form,
        price: Number(form.price), // Ensure price is a number
        createdBy: mongoUser._id, // Attach creator's ID
      };

      // Send POST request to API with authentication header
      await axios.post(`${import.meta.env.VITE_API_URL}/products`, submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Redirect to home after successful submission
      navigate("/");
    } catch (err) {
      console.error("登録エラー:", err);
      toast.error("商品の登録に失敗しました。");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Link to go back to home */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-block bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
        >
          ホームに戻る
        </Link>
      </div>

      <h2 className="text-xl font-bold mb-4">新しい商品を追加</h2>

      {/* Product submission form */}
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

        {/* Image upload field */}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="w-full"
        />
        {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
        {form.imageUrl && (
          <img
            src={form.imageUrl}
            alt="Preview"
            className="w-full h-auto rounded"
          />
        )}

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
          className="w-full bg-indigo-600 text-white py-2 rounded disabled:opacity-50"
          disabled={uploading}
        >
          登録する
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
