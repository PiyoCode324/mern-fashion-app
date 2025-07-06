import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth(); // 🔐 認証トークン取得
  const { user: currentUser } = useAuth();

  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    imageUrl: "",
    price: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false); // 🔄 アップロード中

  // 商品データ取得
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/products/${id}`)
      .then((res) => {
        setForm(res.data);

        // 作成者チェック
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔽 Cloudinary アップロード機能
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "mern-fashion-app-unsigned"); // ← Cloudinaryのpreset名

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dagqtxj06/image/upload",
        formData
      );
      setForm((prev) => ({ ...prev, imageUrl: res.data.secure_url }));
    } catch (err) {
      console.error("画像アップロードエラー:", err);
      alert("画像のアップロードに失敗しました");
    } finally {
      setUploading(false);
    }
  };

  // 商品更新
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

        {/* 🔽 Cloudinaryアップロード */}
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
          更新する
        </button>
      </form>
    </div>
  );
};

export default EditProduct;
