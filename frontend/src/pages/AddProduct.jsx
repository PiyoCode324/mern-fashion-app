import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const AddProduct = () => {
  const { user: mongoUser, token } = useAuth();
  const [uploading, setUploading] = useState(false); // アップロード中フラグ

  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    imageUrl: "", // ← ここはCloudinaryで自動設定
    price: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔽 Cloudinaryアップロード
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "mern-fashion-app-unsigned"); // ← Cloudinaryで作成したpreset名
    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dagqtxj06/image/upload", // ← cloud_nameに変更
        formData
      );
      setForm((prev) => ({ ...prev, imageUrl: res.data.secure_url }));
    } catch (err) {
      console.error("アップロードエラー:", err);
      alert("画像のアップロードに失敗しました");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

        {/* 🔽 画像アップロード */}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="w-full"
        />
        {uploading && (
          <p className="text-sm text-gray-500">アップロード中...</p>
        )}
        {form.imageUrl && (
          <img
            src={form.imageUrl}
            alt="プレビュー"
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
