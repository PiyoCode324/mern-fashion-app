// src/pages/Login.jsx
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/"); // ログイン成功後はホームへ遷移
    } catch (error) {
      console.error("ログインエラー:", error.code);

      // Firebaseのエラーコードに応じて適切なメッセージを表示
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
      <h2 className="text-2xl font-bold mb-6">ログイン</h2>
      {errorMsg && <p className="text-red-600 mb-4">{errorMsg}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="p-2 border rounded"
        />
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
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
