import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import ProductList from "./components/ProductList";
import AddProduct from "./pages/AddProduct";
import ProductDetail from "./components/ProductDetail";
import EditProduct from "./pages/EditProduct";
import Favorites from "./pages/Favorites";
import Cart from "./pages/Cart";
import { useCart } from "./contexts/CartContext"; // カートContextの追加

function App() {
  const { cartItems } = useCart();
  const itemCount = cartItems.length;

  return (
    <div className="App">
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
            to="/add"
            className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
          >
            ➕ 商品を追加
          </Link>
        </div>
      </header>

      <main className="p-4">
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/add" element={<AddProduct />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/cart" element={<Cart />} /> {/* カートルートの追加 */}
          <Route path="/edit/:id" element={<EditProduct />} />
          <Route path="/products/:id" element={<ProductDetail />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
