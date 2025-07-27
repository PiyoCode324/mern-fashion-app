// src/pages/Login.jsx
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { showError } from "../utils/showToast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({}); // バリデーションエラー管理
  const navigate = useNavigate();

  // メール形式チェック用の簡易正規表現
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validate = () => {
    const newErrors = {};
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
    // エラーがなければtrue
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return; // バリデーションNGなら送信しない

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (error) {
      console.error("Login error:", error.code);
      switch (error.code) {
        case "auth/user-not-found":
          showError("このメールアドレスのアカウントは存在しません。");
          break;
        case "auth/wrong-password":
          showError("パスワードが正しくありません。");
          break;
        case "auth/invalid-email":
          showError("メールアドレスの形式が正しくありません。");
          break;
        case "auth/too-many-requests":
          showError(
            "ログイン試行が多すぎます。しばらくしてから再試行してください。"
          );
          break;
        default:
          showError("ログインに失敗しました。もう一度お試しください。");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-6">ログイン</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div>
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`p-2 border rounded w-full
    bg-white text-gray-800 placeholder-gray-400
    dark:bg-gray-700 dark:text-white dark:placeholder-gray-300
    ${
      errors.email
        ? "border-red-500 dark:border-red-400"
        : "border-gray-300 dark:border-gray-600"
    }`}
          />

          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`p-2 border rounded w-full
    bg-white text-gray-800 placeholder-gray-400
    dark:bg-gray-700 dark:text-white dark:placeholder-gray-300
    ${
      errors.password
        ? "border-red-500 dark:border-red-400"
        : "border-gray-300 dark:border-gray-600"
    }`}
          />

          {errors.password && (
            <p className="text-red-600 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          className="bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 dark:hover:bg-indigo-500"
        >
          ログイン
        </button>

        <p className="text-sm">
          アカウントをお持ちでない方は{" "}
          <Link to="/signup" className="text-blue-600 hover:underline">
            こちら
          </Link>{" "}
          から登録してください。
        </p>
      </form>
    </div>
  );
};

export default Login;
