// src/pages/AddProduct.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const AddProduct = () => {
  // MongoDBのユーザー情報と認証トークンを取得
  const { user: mongoUser, token } = useAuth();

  // 画像アップロード中かどうかを管理するフラグ
  const [uploading, setUploading] = useState(false);

  // 商品情報フォームの状態
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    imageUrl: "", // Cloudinaryのアップロード後にURLをセット
    price: "",
  });

  const navigate = useNavigate();

  // フォームの入力変更ハンドラー
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 画像ファイルアップロード処理（Cloudinary）
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "mern-fashion-app-unsigned"); // Cloudinaryで設定したpreset名

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dagqtxj06/image/upload", // cloud_nameを適宜変更
        formData
      );
      // アップロード成功した画像のURLをformにセット
      setForm((prev) => ({ ...prev, imageUrl: res.data.secure_url }));
    } catch (err) {
      console.error("アップロードエラー:", err);
      alert("画像のアップロードに失敗しました");
    } finally {
      setUploading(false);
    }
  };

  // フォーム送信時の処理
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ユーザー情報がまだ取得できていない場合の保険
    if (!mongoUser?._id) {
      alert("ユーザー情報の取得中です。しばらくしてから再度お試しください。");
      return;
    }

    try {
      // 送信データを整形
      const submitData = {
        ...form,
        price: Number(form.price), // 価格は数値化
        createdBy: mongoUser._id,  // 作成者IDをセット
      };

      // APIへPOSTリクエスト（認証ヘッダー付き）
      await axios.post(`${import.meta.env.VITE_API_URL}/products`, submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // 登録成功後にトップページへ遷移
      navigate("/");
    } catch (err) {
      console.error("登録エラー:", err);
      alert("商品登録に失敗しました。");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      {/* ホームに戻るリンク */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-block bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
        >
          ホームに戻る
        </Link>
      </div>

      <h2 className="text-xl font-bold mb-4">新しい商品を追加</h2>

      {/* 商品追加フォーム */}
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

        {/* 画像アップロード用インプット */}
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
