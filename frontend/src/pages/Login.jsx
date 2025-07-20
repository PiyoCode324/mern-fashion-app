// src/pages/Login.jsx
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  // Form state: email, password, error message
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(""); // Clear previous errors

    try {
      // Sign in using Firebase email/password authentication
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/"); // Redirect to home on success
    } catch (error) {
      console.error("Login error:", error.code);

      // Show user-friendly error messages based on Firebase error codes
      switch (error.code) {
        case "auth/user-not-found":
          setErrorMsg("このメールアドレスのアカウントは存在しません。");
          break;
        case "auth/wrong-password":
          setErrorMsg("パスワードが正しくありません。");
          break;
        case "auth/invalid-email":
          setErrorMsg("メールアドレスの形式が正しくありません。");
          break;
        case "auth/too-many-requests":
          setErrorMsg(
            "ログイン試行が多すぎます。しばらくしてから再試行してください。"
          );
          break;
        default:
          setErrorMsg("ログインに失敗しました。もう一度お試しください。");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 border rounded shadow">
      {/* Page title */}
      <h2 className="text-2xl font-bold mb-6">ログイン</h2>

      {/* Error message */}
      {errorMsg && <p className="text-red-600 mb-4">{errorMsg}</p>}

      {/* Login form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Email input */}
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="p-2 border rounded"
        />

        {/* Password input */}
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="p-2 border rounded"
        />

        {/* Login button */}
        <button
          type="submit"
          className="bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
        >
          ログイン
        </button>

        {/* Signup link */}
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
