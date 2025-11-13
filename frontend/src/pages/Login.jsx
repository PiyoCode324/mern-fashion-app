// src/pages/Login.jsx
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth"; // Firebase 認証用関数
import { auth } from "../firebase"; // Firebase 初期化済み auth オブジェクト
import { useNavigate, Link } from "react-router-dom"; // 画面遷移とリンク
import { showError } from "../utils/showToast"; // トーストでエラー表示するユーティリティ

const Login = () => {
  // フォーム入力のステート
  const [email, setEmail] = useState(""); // メールアドレス
  const [password, setPassword] = useState(""); // パスワード
  const [errors, setErrors] = useState({}); // バリデーションエラー管理

  const navigate = useNavigate(); // 成功時の画面遷移用

  // メール形式チェック用の簡易正規表現
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // 入力バリデーション関数
  const validate = () => {
    const newErrors = {};

    // メールアドレスのチェック
    if (!email) {
      newErrors.email = "メールアドレスは必須です。";
    } else if (!validateEmail(email)) {
      newErrors.email = "メールアドレスの形式が正しくありません。";
    }

    // パスワードのチェック
    if (!password) {
      newErrors.password = "パスワードは必須です。";
    } else if (password.length < 6) {
      newErrors.password = "パスワードは6文字以上で入力してください。";
    }

    setErrors(newErrors); // エラーをステートにセット
    return Object.keys(newErrors).length === 0; // エラーなしなら true
  };

  // フォーム送信時の処理
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return; // バリデーションNGなら処理中断

    try {
      // Firebase 認証でログイン
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/"); // 成功したらホームへ遷移
    } catch (error) {
      console.error("Login error:", error.code);

      // Firebase のエラーコードに応じてトースト表示
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
      {/* ページタイトル */}
      <h2 className="text-2xl font-bold mb-6">ログイン</h2>

      {/* ログインフォーム */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {/* メール入力 */}
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
          {/* メール入力エラー表示 */}
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* パスワード入力 */}
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
          {/* パスワード入力エラー表示 */}
          {errors.password && (
            <p className="text-red-600 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        {/* 送信ボタン */}
        <button
          type="submit"
          className="bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 dark:hover:bg-indigo-500"
        >
          ログイン
        </button>

        {/* サインアップリンク */}
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
