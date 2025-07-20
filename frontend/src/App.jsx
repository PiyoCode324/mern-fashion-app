// src/App.jsx
// Importing required libraries and components
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

function App() {
  const navigate = useNavigate();

  // 🔐 Get authentication information (from AuthContext)
  const {
    user: mongoUser, // User data stored in MongoDB
    loading: authLoading, // Whether Firebase authentication state is loading
    isNewFirebaseUser, // Users who exist in Firebase but not yet in MongoDB
    userName, // Display name (e.g., Firebase displayName)
  } = useAuth();

  // 🔁 Flag to prevent duplicate registration (for StrictMode)
  const isRegistering = useRef(false);

  // 🔓 Logout process (sign out from Firebase)
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("ログアウト成功");
      navigate("/login"); // Redirect to the login page
    } catch (error) {
      console.error("ログアウト失敗:", error);
    }
  };

  // ✅ Register new Firebase users into MongoDB on first login
  useEffect(() => {
    if (!authLoading && isNewFirebaseUser && !isRegistering.current) {
      const registerUserToBackend = async () => {
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) return;

        isRegistering.current = true; // Prevent duplicate calls
        try {
          const token = await getFreshToken(); // Get Firebase token

          await axios.post(
            "/api/users", // 🔗 API endpoint for MongoDB
            {
              uid: firebaseUser.uid,
              name:
                userName || // Optionally changed name
                firebaseUser.displayName || // Firebase display name
                firebaseUser.email.split("@")[0], // Fallback: prefix of email
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

        // Flag is not reset to prevent duplicate calls in React Strict Mode
      };

      registerUserToBackend();
    }
  }, [authLoading, isNewFirebaseUser]);

  // Display username and role (guest by default)
  const displayName = userName || "ゲスト";
  const userRole = mongoUser?.role || "guest";

  // 🧱 Define app-wide routing and layout
  return (
    <Layout
      userName={displayName} // 👤 Name shown in navigation
      userRole={userRole} // 🛡️ Role: admin, user, etc.
      handleLogout={handleLogout} // 🔓 Pass logout function to Layout
    >
      <Routes>
        {/* 🏠 Home (product list) */}
        <Route path="/" element={<ProductList />} />

        {/* ➕ Add product (requires authentication) */}
        <Route
          path="/add"
          element={
            <PrivateRoute>
              <AddProduct />
            </PrivateRoute>
          }
        />

        {/* 🧑‍💼 Profile page (requires authentication) */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        {/* 🛒 Cart page (requires authentication) */}
        <Route
          path="/cart"
          element={
            <PrivateRoute>
              <Cart />
            </PrivateRoute>
          }
        />

        {/* ✅ Order confirmation (requires authentication) */}
        <Route
          path="/confirm"
          element={
            <PrivateRoute>
              <ConfirmOrder />
            </PrivateRoute>
          }
        />

        {/* 🎉 Order completion (requires authentication) */}
        <Route
          path="/complete"
          element={
            <PrivateRoute>
              <OrderComplete />
            </PrivateRoute>
          }
        />

        {/* 🧾 My orders list (requires authentication) */}
        <Route
          path="/my-orders"
          element={
            <PrivateRoute>
              <MyOrders />
            </PrivateRoute>
          }
        />

        {/* 🛠️ Admin dashboard (requires authentication) */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* 📝 Edit product (requires authentication) */}
        <Route
          path="/edit/:id"
          element={
            <PrivateRoute>
              <EditProduct />
            </PrivateRoute>
          }
        />

        {/* ❤️ Favorites page (no authentication required) */}
        <Route path="/favorites" element={<Favorites />} />

        {/* 🆕 Sign-up page (no authentication required) */}
        <Route path="/signup" element={<SignUp />} />

        {/* 🔐 Login page (no authentication required) */}
        <Route path="/login" element={<Login />} />

        {/* 🔍 Product details (no authentication required) */}
        <Route path="/products/:id" element={<ProductDetail />} />
      </Routes>
    </Layout>
  );
}

export default App;
