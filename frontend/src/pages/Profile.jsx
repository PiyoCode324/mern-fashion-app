// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user, token, setUserName } = useAuth(); // setUserNameを追加
  const [name, setName] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setOriginalName(user.name); // 元の名前を保持（未変更チェック用）
    }
  }, [user]);

  const handleUpdate = async () => {
    if (!name.trim()) {
      setMessage("名前は空にできません。");
      return;
    }
    if (name === originalName) {
      setMessage("変更内容がありません。");
      return;
    }

    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/users/${user.uid}`,
        { name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("名前更新成功", res.data);
      setMessage("名前を更新しました！");
      setOriginalName(name);
      setUserName(name); // ここでAuthContextのuserNameを更新
      console.log("AuthContextのuserNameを更新:", name);
    } catch (error) {
      console.error("名前の更新に失敗しました:", error);
      setMessage("名前の更新に失敗しました。");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      {/* ホームに戻るボタン */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-block bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
        >
          ホームに戻る
        </Link>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          名前
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <button
        onClick={handleUpdate}
        className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition"
      >
        ✏️ 名前を更新
      </button>

      <div className="mt-6">
        <Link
          to="/my-orders"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 inline-block"
        >
          🧾 注文履歴を見る
        </Link>
      </div>

      {message && (
        <p className="mt-4 text-sm text-gray-700 font-medium">{message}</p>
      )}
    </div>
  );
};

export default Profile;
