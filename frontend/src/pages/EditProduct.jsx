// src/pages/EditProduct.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import Spinner from "../components/common/Spinner";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { token, user: currentUser } = useAuth();

  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    imageUrl: "",
    price: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/products/${id}`)
      .then((res) => {
        setForm(res.data);

        if (
          res.data.createdBy._id !== currentUser._id &&
          currentUser.role !== "admin"
        ) {
          toast.dismiss();
          toast.error("この商品は編集できません");
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "mern-fashion-app-unsigned");

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dagqtxj06/image/upload",
        formData
      );
      setForm((prev) => ({ ...prev, imageUrl: res.data.secure_url }));
    } catch (err) {
      console.error("Image upload error:", err);
      toast.error("画像のアップロードに失敗しました");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/products/${id}`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (currentUser.role === "admin") {
        navigate("/admin/products");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error("商品更新に失敗しました。");
    }
  };

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-500 dark:text-red-400">{error}</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 sm:p-8 bg-white dark:bg-gray-900 rounded shadow-md">
      {/* Back to Home */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-block bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 px-4 py-2 rounded transition-colors"
        >
          ホームに戻る
        </Link>
      </div>

      {/* Page title */}
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center sm:text-left text-gray-900 dark:text-gray-100">
        商品を編集
      </h2>

      {/* Edit product form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="text"
          name="name"
          placeholder="商品名"
          value={form.name}
          onChange={handleChange}
          className="w-full p-3 sm:p-4 border border-gray-300 dark:border-gray-700 rounded text-base sm:text-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
          required
        />

        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full p-3 sm:p-4 border border-gray-300 dark:border-gray-700 rounded text-base sm:text-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
          required
        >
          <option value="" className="text-gray-700 dark:text-gray-300">
            カテゴリ
          </option>
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
          className="w-full p-3 sm:p-4 border border-gray-300 dark:border-gray-700 rounded text-base sm:text-lg min-h-[120px] text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="w-full text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
        />
        {uploading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            アップロード中...
          </p>
        )}

        {form.imageUrl && (
          <img
            src={form.imageUrl}
            alt="プレビュー"
            className="w-full max-h-[400px] object-contain rounded"
          />
        )}

        <input
          type="number"
          name="price"
          placeholder="価格"
          value={form.price}
          onChange={handleChange}
          className="w-full p-3 sm:p-4 border border-gray-300 dark:border-gray-700 rounded text-base sm:text-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
          required
          min="0"
        />

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white py-3 rounded disabled:opacity-50 text-lg font-semibold transition-colors"
          disabled={uploading}
        >
          更新する
        </button>
      </form>
    </div>
  );
};

export default EditProduct;
