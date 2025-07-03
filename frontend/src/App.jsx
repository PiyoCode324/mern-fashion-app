import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import ProductList from "./components/ProductList";
import AddProduct from "./pages/AddProduct";
import ProductDetail from "./components/ProductDetail";
import EditProduct from "./pages/EditProduct";
import Favorites from "./pages/Favorites";

function App() {
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
            to="/add"
            className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
          >
            商品を追加
          </Link>
        </div>
      </header>

      <main className="p-4">
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/add" element={<AddProduct />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/edit/:id" element={<EditProduct />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
