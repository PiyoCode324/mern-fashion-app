// src/pages/AddProduct.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";

const AddProduct = () => {
  // AuthContext から MongoDB ユーザー情報と認証トークンを取得
  const { user: mongoUser, token } = useAuth();
  // 画像アップロード中かどうかを管理するステート
  const [uploading, setUploading] = useState(false);

  // 商品フォームの初期値を管理するステート
  const [form, setForm] = useState({
    name: "",        // 商品名
    category: "",    // カテゴリ
    description: "", // 説明文
    imageUrl: "",    // Cloudinary にアップロードした画像URL
    price: "",       // 価格
  });

  // ページ遷移用のフック
  const navigate = useNavigate();

  // フォーム入力の変更を処理する関数
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 画像ファイルを Cloudinary にアップロードする関数
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true); // アップロード中フラグをON
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "mern-fashion-app-unsigned");

    try {
      // Cloudinary のアップロード API を呼び出す
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dagqtxj06/image/upload",
        formData
      );
      // 取得した URL をフォームデータに反映
      setForm((prev) => ({ ...prev, imageUrl: res.data.secure_url }));
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("画像のアップロードに失敗しました。");
    } finally {
      setUploading(false); // アップロード終了
    }
  };

  // フォーム送信時の処理（商品登録）
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ユーザー情報がまだ取得できていない場合
    if (!mongoUser?._id) {
      toast.error(
        "ユーザーデータを読み込み中です。少し待ってから再度お試しください。"
      );
      return;
    }

    try {
      // 送信する商品データを作成
      const submitData = {
        ...form,
        price: Number(form.price),     // 価格を数値に変換
        createdBy: mongoUser._id,      // MongoDB ユーザーIDを紐付け
      };

      // バックエンド API に商品登録リクエストを送信
      await axios.post(`${import.meta.env.VITE_API_URL}/products`, submitData, {
        headers: {
          Authorization: `Bearer ${token}`, // Firebaseトークンをヘッダーに付与
        },
      });

      // 登録完了後にホームにリダイレクト
      navigate("/");
    } catch (err) {
      console.error("登録エラー:", err);
      toast.error("商品の登録に失敗しました。");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white dark:bg-gray-800 rounded shadow">
      {/* 戻るリンク */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-block bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 px-4 py-2 rounded"
        >
          ホームに戻る
        </Link>
      </div>

      <h2 className="text-xl font-bold mb-4 dark:text-gray-100">
        新しい商品を追加
      </h2>

      {/* 商品追加フォーム */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 商品名入力 */}
        <input
          type="text"
          name="name"
          placeholder="商品名"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          required
        />

        {/* カテゴリ選択 */}
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          required
        >
          <option value="">カテゴリ</option>
          <option value="tops">トップス</option>
          <option value="bottoms">ボトムス</option>
          <option value="accessory">アクセサリー</option>
          <option value="hat">帽子</option>
          <option value="bag">バッグ</option>
        </select>

        {/* 説明文入力 */}
        <textarea
          name="description"
          placeholder="説明"
          value={form.description}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />

        {/* 画像アップロード */}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="w-full text-gray-900 dark:text-gray-100"
        />
        {uploading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            アップロード中...
          </p>
        )}
        {/* 画像プレビュー */}
        {form.imageUrl && (
          <img
            src={form.imageUrl}
            alt="Preview"
            className="w-full h-[400px] object-contain bg-gray-100 dark:bg-gray-700 rounded"
          />
        )}

        {/* 価格入力 */}
        <input
          type="number"
          name="price"
          placeholder="価格"
          value={form.price}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          required
          min="0"
        />

        {/* 登録ボタン */}
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded disabled:opacity-50"
          disabled={uploading} // アップロード中はボタン無効化
        >
          登録する
        </button>
      </form>
    </div>
  );
};

export default AddProduct;


