// src/pages/SignUp.jsx
import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const SignUp = () => {
  // 🧾 Input Field State
  const [name, setName] = useState(""); // user name
  const [email, setEmail] = useState(""); // email address
  const [password, setPassword] = useState(""); // password
  const [error, setError] = useState(""); // error message
  const navigate = useNavigate(); // For page navigation

  // 🚀 Handle user registration
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");

    // ⚠️ Client-side validation
    if (password.length < 6) {
      setError("パスワードは6文字以上で入力してください。");
      return;
    }

    try {
      // ✅ Create account with Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // ✏️ Set user display name in Firebase
      await updateProfile(userCredential.user, { displayName: name });

      const user = userCredential.user;
      const token = await user.getIdToken(); // Get Firebase ID token

      // 📨 Save user info to backend
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

      // 🎉 After registration, redirect to home page
      navigate("/");
    } catch (err) {
      console.error("登録エラー:", err);

      // ⚠️ Handle Firebase and API errors
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

  // 🖼️ Render UI
  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">新規登録</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSignUp} className="space-y-4">
        {/* 🙍‍♀️ Name input */}
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

        {/* 📧 Email input */}
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

        {/* 🔑 Password input */}
        <div>
          <label className="block">パスワード</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-gray-300 p-2 rounded"
          />
          {/* ⛔ Password length validation */}
          {password && password.length < 6 && (
            <p className="text-red-500 text-sm mt-1">
              パスワードは6文字以上で入力してください。
            </p>
          )}
        </div>

        {/* ✅ Submit registration */}
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
