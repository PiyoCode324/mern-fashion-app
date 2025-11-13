// src/App.jsx
// 必要なライブラリとコンポーネントのインポート
import React, { useEffect, useRef } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import ProductList from "./components/ProductList";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import Favorites from "./pages/Favorites";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ProductDetail from "./components/ProductDetail";
import PrivateRoute from "./components/PrivateRoute";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { useAuth } from "./contexts/AuthContext";
import { getFreshToken } from "./utils/getFreshToken";
import Layout from "./components/Layout";
import Profile from "./pages/Profile";
import ConfirmOrder from "./pages/ConfirmOrder";
import OrderComplete from "./pages/OrderComplete";
import MyOrders from "./pages/MyOrders";
import AdminDashboard from "./pages/AdminDashboard";
import axios from "axios";
import { LoadingProvider } from "./contexts/LoadingContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminProductList from "./components/Admin/AdminProductList"; // 管理者用商品一覧

function App() {
  const navigate = useNavigate();

  // 🔐 AuthContextから認証情報を取得
  const {
    user: mongoUser, // MongoDBに保存されているユーザー情報
    loading: authLoading, // Firebase認証状態のロード中フラグ
    isNewFirebaseUser, // Firebaseには存在するがMongoDBにまだ未登録のユーザー
    userName, // 表示用ユーザー名（FirebaseのdisplayNameなど）
  } = useAuth();

  console.log("useAuth userName:", userName, "authLoading:", authLoading);

  // 🔁 重複登録防止用のフラグ（React StrictMode対策）
  const isRegistering = useRef(false);

  // 🔓 ログアウト処理
  const handleLogout = async () => {
    try {
      await signOut(auth); // Firebaseからサインアウト
      console.log("ログアウト成功");
      navigate("/login"); // ログインページにリダイレクト
    } catch (error) {
      console.error("ログアウト失敗:", error);
    }
  };

  // ✅ Firebase新規ユーザーをMongoDBに登録（初回ログイン時のみ）
  useEffect(() => {
    if (!authLoading && isNewFirebaseUser && !isRegistering.current) {
      const registerUserToBackend = async () => {
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) return;

        isRegistering.current = true; // 重複呼び出し防止
        try {
          const token = await getFreshToken(); // 最新Firebaseトークンを取得

          await axios.post(
            `${import.meta.env.VITE_API_URL}/users`, // MongoDB用APIエンドポイント
            {
              uid: firebaseUser.uid,
              name:
                userName || // 変更済みの名前
                firebaseUser.displayName || // Firebase displayName
                firebaseUser.email.split("@")[0], // メールの@前を名前として代用
              email: firebaseUser.email,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`, // 🔑 認証トークンをヘッダーに付与
              },
            }
          );

          console.log("バックエンドユーザー登録成功");
        } catch (err) {
          if (err.response && err.response.status === 409) {
            console.warn("ユーザーは既に登録されています");
          } else {
            console.error("バックエンドユーザー登録エラー:", err);
          }
        }

        // StrictModeではフラグをリセットせず、重複登録を防止
      };

      registerUserToBackend();
    }
  }, [authLoading, isNewFirebaseUser]);

  // 表示用ユーザー名と権限（デフォルトはゲスト）
  const displayName = userName || "ゲスト";
  const userRole = mongoUser?.role || "guest";

  // 🧱 アプリ全体のルーティングとレイアウト
  return (
    <LoadingProvider>
      <Layout
        userName={displayName} // ナビゲーションに表示する名前
        userRole={userRole} // 権限(admin, userなど)
        handleLogout={handleLogout} // Layoutにログアウト関数を渡す
      >
        <Routes>
          {/* 🏠 ホーム（商品一覧） */}
          <Route path="/" element={<ProductList />} />

          {/* ➕ 商品追加（認証必須） */}
          <Route
            path="/add"
            element={
              <PrivateRoute>
                <AddProduct />
              </PrivateRoute>
            }
          />

          {/* 🧑‍💼 プロフィールページ（認証必須） */}
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          {/* 🛒 カートページ（認証必須） */}
          <Route
            path="/cart"
            element={
              <PrivateRoute>
                <Cart />
              </PrivateRoute>
            }
          />

          {/* ✅ 注文確認ページ（認証必須） */}
          <Route
            path="/confirm"
            element={
              <PrivateRoute>
                <ConfirmOrder />
              </PrivateRoute>
            }
          />

          {/* 🎉 注文完了ページ（認証必須） */}
          <Route
            path="/complete"
            element={
              <PrivateRoute>
                <OrderComplete />
              </PrivateRoute>
            }
          />

          {/* 🧾 自分の注文履歴（認証必須） */}
          <Route
            path="/my-orders"
            element={
              <PrivateRoute>
                <MyOrders />
              </PrivateRoute>
            }
          />

          {/* 🛠️ 管理者ダッシュボード（認証必須） */}
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          {/* 🛒 管理者用商品一覧（認証必須） */}
          <Route
            path="/admin/products"
            element={
              <PrivateRoute>
                <AdminProductList />
              </PrivateRoute>
            }
          />

          {/* 📝 商品編集ページ（認証必須） */}
          <Route
            path="/edit/:id"
            element={
              <PrivateRoute>
                <EditProduct />
              </PrivateRoute>
            }
          />

          {/* ❤️ お気に入りページ（認証不要） */}
          <Route path="/favorites" element={<Favorites />} />

          {/* 🆕 新規登録ページ（認証不要） */}
          <Route path="/signup" element={<SignUp />} />

          {/* 🔐 ログインページ（認証不要） */}
          <Route path="/login" element={<Login />} />

          {/* 🔍 商品詳細ページ（認証不要） */}
          <Route path="/products/:id" element={<ProductDetail />} />
        </Routes>
      </Layout>
      <ToastContainer /> {/* トースト通知コンポーネント */}
    </LoadingProvider>
  );
}

export default App;
