// src/App.jsx
// 必要なライブラリやコンポーネントのインポート
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
import PrivateRoute from "./components/PrivateRoute"; // 🔒 認証保護用のコンポーネント
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { useAuth } from "./contexts/AuthContext"; // 🔐 認証情報コンテキスト
import { getFreshToken } from "./utils/getFreshToken"; // 🔄 Firebaseの最新トークン取得
import Layout from "./components/Layout"; // 🧱 共通レイアウト（ナビゲーションなど）
import Profile from "./pages/Profile"; // ✅ プロフィールページ
import ConfirmOrder from "./pages/ConfirmOrder"; // ✅ 注文確認ページ
import OrderComplete from "./pages/OrderComplete"; // ✅ 注文完了ページ
import MyOrders from "./pages/MyOrders"; // ✅ 自分の注文一覧ページ
import AdminDashboard from "./pages/AdminDashboard"; // ✅ 管理者用ダッシュボード
import axios from "axios";

function App() {
  const navigate = useNavigate();

  // 🔐 認証に関する情報を取得（AuthContextから）
  const {
    user: mongoUser, // MongoDBに保存されているユーザーデータ
    loading: authLoading, // Firebaseの認証状態を読み込み中かどうか
    isNewFirebaseUser, // Firebaseには存在するがMongoDBには未登録のユーザー
    userName, // 表示用の名前（FirebaseのdisplayNameなど）
  } = useAuth();

  // 🔁 重複登録を防ぐフラグ（StrictMode対策用）
  const isRegistering = useRef(false);

  // 🔓 ログアウト処理（Firebaseからサインアウト）
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("ログアウト成功");
      navigate("/login"); // ログインページにリダイレクト
    } catch (error) {
      console.error("ログアウト失敗:", error);
    }
  };

  // ✅ 新規Firebaseユーザーが初回ログイン時にMongoDBへ登録される処理
  useEffect(() => {
    if (!authLoading && isNewFirebaseUser && !isRegistering.current) {
      const registerUserToBackend = async () => {
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) return;

        isRegistering.current = true; // 2回呼ばれないようにする

        try {
          const token = await getFreshToken(); // Firebaseトークン取得

          await axios.post(
            "/api/users", // 🔗 MongoDB用のAPIエンドポイント
            {
              uid: firebaseUser.uid,
              name:
                userName || // 任意で変更された名前
                firebaseUser.displayName || // Firebaseの表示名
                firebaseUser.email.split("@")[0], // なければメールの@前を使用
              email: firebaseUser.email,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
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

        // React Strict ModeでuseEffectが2回呼ばれるのを防ぐため、フラグは戻さない
      };

      registerUserToBackend();
    }
  }, [authLoading, isNewFirebaseUser]);

  // 表示用のユーザー名とロール（ゲストを初期値に）
  const displayName = userName || "ゲスト";
  const userRole = mongoUser?.role || "guest";

  // 🧱 アプリ全体のルーティングとレイアウト定義
  return (
    <Layout
      userName={displayName} // 👤 ナビゲーションで表示される名前
      userRole={userRole} // 🛡️ 管理者・ユーザーなどの役割
      handleLogout={handleLogout} // 🔓 ログアウト処理をLayoutに渡す
    >
      <Routes>
        {/* 🏠 ホーム（商品一覧） */}
        <Route path="/" element={<ProductList />} />

        {/* ➕ 商品追加（認証必要） */}
        <Route
          path="/add"
          element={
            <PrivateRoute>
              <AddProduct />
            </PrivateRoute>
          }
        />

        {/* 🧑‍💼 プロフィールページ（認証必要） */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        {/* 🛒 カートページ（認証必要） */}
        <Route
          path="/cart"
          element={
            <PrivateRoute>
              <Cart />
            </PrivateRoute>
          }
        />

        {/* ✅ 注文確認（認証必要） */}
        <Route
          path="/confirm"
          element={
            <PrivateRoute>
              <ConfirmOrder />
            </PrivateRoute>
          }
        />

        {/* 🎉 注文完了（認証必要） */}
        <Route
          path="/complete"
          element={
            <PrivateRoute>
              <OrderComplete />
            </PrivateRoute>
          }
        />

        {/* 🧾 自分の注文一覧（認証必要） */}
        <Route
          path="/my-orders"
          element={
            <PrivateRoute>
              <MyOrders />
            </PrivateRoute>
          }
        />

        {/* 🛠️ 管理者ダッシュボード（認証必要） */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* 📝 商品編集（認証必要） */}
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
  );
}

export default App;
