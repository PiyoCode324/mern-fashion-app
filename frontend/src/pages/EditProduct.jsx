// src/pages/EditProduct.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const EditProduct = () => {
  // ルートパラメータから商品IDを取得
  const { id } = useParams();
  const navigate = useNavigate();

  // 認証トークンと現在のログインユーザー情報を取得
  const { token } = useAuth();
  const { user: currentUser } = useAuth();

  // フォーム状態管理（商品情報）
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    imageUrl: "",
    price: "",
  });

  // ローディング・エラー・アップロード中の状態管理
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  // 商品情報を取得し、編集権限チェックを行う
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/products/${id}`)
      .then((res) => {
        setForm(res.data);

        // 編集権限：商品作成者のみ編集可能
        if (res.data.createdBy._id !== currentUser._id) {
          alert("この商品は編集できません");
          navigate("/"); // 権限なければトップへリダイレクト
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        setError("商品情報の取得に失敗しました");
        setLoading(false);
      });
  }, [id, currentUser, navigate]);

  // 入力フォームの変更をstateに反映
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Cloudinaryへの画像アップロード処理
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "mern-fashion-app-unsigned"); // Cloudinaryのpreset名

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dagqtxj06/image/upload",
        formData
      );
      // アップロード成功したら画像URLをフォームにセット
      setForm((prev) => ({ ...prev, imageUrl: res.data.secure_url }));
    } catch (err) {
      console.error("画像アップロードエラー:", err);
      alert("画像のアップロードに失敗しました");
    } finally {
      setUploading(false);
    }
  };

  // フォーム送信で商品情報を更新する
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/products/${id}`, form, {
        headers: {
          Authorization: `Bearer ${token}`, // 認証トークンを送信
        },
      });
      // 更新成功後はホームへ遷移
      navigate("/");
    } catch (err) {
      console.error("更新エラー:", err);
      alert("商品更新に失敗しました。");
    }
  };

  // 読み込み中・エラー時の表示
  if (loading) return <p>読み込み中...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 sm:p-8">
      {/* ホームに戻るボタン */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-block bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
        >
          ホームに戻る
        </Link>
      </div>

      {/* 編集画面タイトル */}
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center sm:text-left">
        商品を編集
      </h2>

      {/* 編集フォーム */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 商品名 */}
        <input
          type="text"
          name="name"
          placeholder="商品名"
          value={form.name}
          onChange={handleChange}
          className="w-full p-3 sm:p-4 border rounded text-base sm:text-lg"
          required
        />

        {/* カテゴリ選択 */}
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

        {/* 商品説明 */}
        <textarea
          name="description"
          placeholder="説明"
          value={form.description}
          onChange={handleChange}
          className="w-full p-3 sm:p-4 border rounded text-base sm:text-lg min-h-[120px]"
        />

        {/* 画像ファイルアップロード */}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="w-full"
        />
        {/* アップロード中表示 */}
        {uploading && (
          <p className="text-sm text-gray-500">アップロード中...</p>
        )}
        {/* アップロード済み画像プレビュー */}
        {form.imageUrl && (
          <img
            src={form.imageUrl}
            alt="プレビュー"
            className="w-full max-h-[400px] object-contain rounded"
          />
        )}

        {/* 価格入力 */}
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

        {/* 更新ボタン（アップロード中は無効） */}
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
