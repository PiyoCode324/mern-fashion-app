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
import Profile from "./pages/Profile"; // ✅ これを追加
import ConfirmOrder from "./pages/ConfirmOrder";
import OrderComplete from "./pages/OrderComplete";
import MyOrders from "./pages/MyOrders"; // ✅ これを追加
import AdminDashboard from "./pages/AdminDashboard";
import axios from "axios";

function App() {
  const navigate = useNavigate();
  const {
    user: mongoUser,
    loading: authLoading,
    isNewFirebaseUser,
    userName, // ✅ これを追加！
  } = useAuth();
  const isRegistering = useRef(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("ログアウト成功");
      navigate("/login");
    } catch (error) {
      console.error("ログアウト失敗:", error);
    }
  };

  useEffect(() => {
    if (!authLoading && isNewFirebaseUser && !isRegistering.current) {
      const registerUserToBackend = async () => {
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) return;

        isRegistering.current = true;
        try {
          const token = await getFreshToken();

          await axios.post(
            "/api/users",
            {
              uid: firebaseUser.uid,
              name:
                userName ||
                firebaseUser.displayName ||
                firebaseUser.email.split("@")[0],
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
        // StrictMode対策でフラグは戻さない
      };

      registerUserToBackend();
    }
  }, [authLoading, isNewFirebaseUser]);

  const displayName = userName || "ゲスト";
  const userRole = mongoUser?.role || "guest"; // 👈 これを追加

  return (
    <Layout
      userName={displayName}
      userRole={userRole} // 👈 追加！
      handleLogout={handleLogout}
    >
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route
          path="/add"
          element={
            <PrivateRoute>
              <AddProduct />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        <Route
          path="/cart"
          element={
            <PrivateRoute>
              <Cart />
            </PrivateRoute>
          }
        />
        <Route
          path="/confirm"
          element={
            <PrivateRoute>
              <ConfirmOrder />
            </PrivateRoute>
          }
        />
        <Route
          path="/complete"
          element={
            <PrivateRoute>
              <OrderComplete />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-orders"
          element={
            <PrivateRoute>
              <MyOrders />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/edit/:id"
          element={
            <PrivateRoute>
              <EditProduct />
            </PrivateRoute>
          }
        />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/products/:id" element={<ProductDetail />} />
      </Routes>
    </Layout>
  );
}

export default App;
