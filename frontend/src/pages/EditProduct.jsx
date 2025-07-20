// src/pages/EditProduct.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const EditProduct = () => {
  // Get product ID from route
  const { id } = useParams();
  const navigate = useNavigate();

  // Get authentication token and user info
  const { token } = useAuth();
  const { user: currentUser } = useAuth();

  // Form state for product fields
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    imageUrl: "",
    price: "",
  });

  // State for loading, error, and image upload
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Fetch product details and check edit permissions
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/products/${id}`)
      .then((res) => {
        setForm(res.data);

        // Only the product creator can edit
        if (res.data.createdBy._id !== currentUser._id) {
          alert("この商品は編集できません");
          navigate("/");
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        setError("商品情報の取得に失敗しました");
        setLoading(false);
      });
  }, [id, currentUser, navigate]);

  // Update form state on input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Upload image to Cloudinary
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "mern-fashion-app-unsigned"); // Cloudinary preset

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dagqtxj06/image/upload",
        formData
      );
      // Set uploaded image URL
      setForm((prev) => ({ ...prev, imageUrl: res.data.secure_url }));
    } catch (err) {
      console.error("Image upload error:", err);
      alert("画像のアップロードに失敗しました");
    } finally {
      setUploading(false);
    }
  };

  // Submit updated product data
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/products/${id}`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      navigate("/");
    } catch (err) {
      console.error("Update error:", err);
      alert("商品更新に失敗しました。");
    }
  };

  // Show loading or error message
  if (loading) return <p>読み込み中...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 sm:p-8">
      {/* Back to Home */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-block bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
        >
          ホームに戻る
        </Link>
      </div>

      {/* Page title */}
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center sm:text-left">
        商品を編集
      </h2>

      {/* Edit product form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name input */}
        <input
          type="text"
          name="name"
          placeholder="商品名"
          value={form.name}
          onChange={handleChange}
          className="w-full p-3 sm:p-4 border rounded text-base sm:text-lg"
          required
        />

        {/* Category select */}
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full p-3 sm:p-4 border rounded text-base sm:text-lg"
          required
        >
          <option value="">カテゴリ</option>
          <option value="tops">トップス</option>
          <option value="bottoms">ボトムス</option>
          <option value="accessory">アクセサリー</option>
          <option value="hat">帽子</option>
          <option value="bag">バッグ</option>
        </select>

        {/* Description textarea */}
        <textarea
          name="description"
          placeholder="説明"
          value={form.description}
          onChange={handleChange}
          className="w-full p-3 sm:p-4 border rounded text-base sm:text-lg min-h-[120px]"
        />

        {/* Image upload */}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="w-full"
        />

        {/* Uploading message */}
        {uploading && (
          <p className="text-sm text-gray-500">アップロード中...</p>
        )}

        {/* Preview uploaded image */}
        {form.imageUrl && (
          <img
            src={form.imageUrl}
            alt="プレビュー"
            className="w-full max-h-[400px] object-contain rounded"
          />
        )}

        {/* Price input */}
        <input
          type="number"
          name="price"
          placeholder="価格"
          value={form.price}
          onChange={handleChange}
          className="w-full p-3 sm:p-4 border rounded text-base sm:text-lg"
          required
          min="0"
        />

        {/* Submit button */}
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-3 rounded disabled:opacity-50 text-lg font-semibold"
          disabled={uploading}
        >
          更新する
        </button>
      </form>
    </div>
  );
};

export default EditProduct;
