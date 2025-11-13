// src/pages/SignUp.jsx
import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase"; // Firebase初期化
import { useNavigate } from "react-router-dom"; // ページ遷移
import axios from "axios"; // API通信
import { toast } from "react-toastify"; // トースト通知

const SignUp = () => {
  // 🔹 入力フォーム用ステート
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({}); // バリデーションエラー

  const navigate = useNavigate(); // 登録後に遷移用

  // 🔹 メール形式チェック用簡易正規表現
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // 🔹 バリデーション関数
  const validate = () => {
    const newErrors = {};

    if (!name.trim()) newErrors.name = "名前は必須です。";

    if (!email) {
      newErrors.email = "メールアドレスは必須です。";
    } else if (!validateEmail(email)) {
      newErrors.email = "メールアドレスの形式が正しくありません。";
    }

    if (!password) {
      newErrors.password = "パスワードは必須です。";
    } else if (password.length < 6) {
      newErrors.password = "パスワードは6文字以上で入力してください。";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0; // エラーがなければtrue
  };

  // 🔹 登録処理
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      // 1️⃣ Firebase Auth でアカウント作成
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // 2️⃣ Firebaseユーザー名を更新
      await updateProfile(userCredential.user, { displayName: name });

      const user = userCredential.user;
      const token = await user.getIdToken(); // JWT取得

      // 3️⃣ 自分のバックエンドにもユーザー情報を保存
      await axios.post(
        `${import.meta.env.VITE_API_URL}/users`,
        {
          uid: user.uid,
          name: user.displayName || "No name",
          email: user.email,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("登録に成功しました！");
      navigate("/"); // ホームへ遷移
    } catch (err) {
      console.error("登録エラー:", err);

      // 🔹 エラー処理
      if (err.response?.status === 409) {
        toast.error(err.response.data.message || "既に登録されています。");
      } else if (err.code === "auth/email-already-in-use") {
        toast.error("このメールアドレスは既に使用されています。");
      } else {
        toast.error("登録に失敗しました。もう一度お試しください。");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">新規登録</h2>

      <form onSubmit={handleSignUp} className="space-y-4" noValidate>
        {/* 🔹 名前入力 */}
        <div>
          <label className="block">名前</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full border p-2 rounded ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* 🔹 メール入力 */}
        <div>
          <label className="block">メールアドレス</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full border p-2 rounded ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* 🔹 パスワード入力 */}
        <div>
          <label className="block">パスワード</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full border p-2 rounded ${
              errors.password ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.password && (
            <p className="text-red-600 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        {/* 🔹 登録ボタン */}
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
