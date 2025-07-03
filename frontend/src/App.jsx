import React from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import ProductList from "./components/ProductList";
import AddProduct from "./pages/AddProduct";
import ProductDetail from "./components/ProductDetail";
import EditProduct from "./pages/EditProduct";
import Favorites from "./pages/Favorites";
import Cart from "./pages/Cart";
import { CartProvider, useCart } from "./contexts/CartContext";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute"; // ⭐ 追加

function Header({ handleLogout }) {
  const { cartItems } = useCart();
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="p-4 flex justify-between items-center bg-gray-100">
      <h1 className="text-2xl font-bold">商品一覧</h1>
      <div className="flex gap-4">
        <Link
          to="/favorites"
          className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
        >
          ❤️ お気に入り一覧
        </Link>

        <Link
          to="/cart"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 relative"
        >
          🛒 カート
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
              {itemCount}
            </span>
          )}
        </Link>

        <Link
          to="/login"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          ログイン
        </Link>

        <button onClick={handleLogout} className="text-sm text-red-500">
          ログアウト
        </button>

        <Link
          to="/add"
          className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
        >
          ➕ 商品を追加
        </Link>
      </div>
    </header>
  );
}

function App() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("ログアウト成功");
      navigate("/login");
    } catch (error) {
      console.error("ログアウト失敗:", error);
    }
  };

  return (
    <AuthProvider>
      <CartProvider>
        <div className="App">
          <Header handleLogout={handleLogout} />

          <main className="p-4">
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
                path="/edit/:id"
                element={
                  <PrivateRoute>
                    <EditProduct />
                  </PrivateRoute>
                }
              />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/login" element={<Login />} />
              <Route path="/products/:id" element={<ProductDetail />} />
            </Routes>
          </main>
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
