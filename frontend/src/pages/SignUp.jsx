// src/pages/SignUp.jsx
import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const SignUp = () => {
  // 🧾 入力フィールド用ステート
  const [name, setName] = useState(""); // 名前
  const [email, setEmail] = useState(""); // メールアドレス
  const [password, setPassword] = useState(""); // パスワード
  const [error, setError] = useState(""); // エラーメッセージ
  const navigate = useNavigate(); // 🔁 遷移用

  // 🚀 サインアップ処理
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");

    // ⚠️ クライアント側バリデーション
    if (password.length < 6) {
      setError("パスワードは6文字以上で入力してください。");
      return;
    }

    try {
      // ✅ Firebaseでアカウント作成
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // ✏️ FirebaseのdisplayNameに名前を登録
      await updateProfile(userCredential.user, { displayName: name });

      const user = userCredential.user;
      const token = await user.getIdToken(); // 🔑 Firebaseトークン取得

      // 📨 バックエンドにユーザー情報を保存
      await axios.post(
        "/api/users",
        {
          uid: user.uid,
          name: user.displayName || "No name",
          email: user.email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 🎉 登録完了後はホームへ
      navigate("/");
    } catch (err) {
      console.error("登録エラー:", err);

      // ⚠️ エラー処理（Firebaseエラー + APIエラー）
      if (err.response?.status === 409) {
        setError(err.response.data.message);
      } else if (err.code === "auth/email-already-in-use") {
        setError("このメールアドレスは既に使用されています。");
      } else {
        setError("登録に失敗しました。もう一度お試しください。");
        toast.error(
          "サーバーエラーが発生しました。しばらくしてから再度お試しください。"
        );
      }
    }
  };

  // 🖼️ UIレンダリング
  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">新規登録</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSignUp} className="space-y-4">
        {/* 🙍‍♀️ 名前入力 */}
        <div>
          <label className="block">名前</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        {/* 📧 メールアドレス入力 */}
        <div>
          <label className="block">メールアドレス</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        {/* 🔑 パスワード入力 */}
        <div>
          <label className="block">パスワード</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-gray-300 p-2 rounded"
          />
          {/* ⛔ パスワードの長さチェック */}
          {password && password.length < 6 && (
            <p className="text-red-500 text-sm mt-1">
              パスワードは6文字以上で入力してください。
            </p>
          )}
        </div>

        {/* ✅ 登録ボタン */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          登録する
        </button>
      </form>
    </div>
  );
};

export default SignUp;
