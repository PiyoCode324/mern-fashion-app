import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import ProductList from "./components/ProductList";
import AddProduct from "./pages/AddProduct";
import ProductDetail from "./components/ProductDetail"; // 必要なら移動
import EditProduct from "./pages/EditProduct";

function App() {
  return (
    <div className="App">
      <header className="p-4 flex justify-between items-center bg-gray-100">
        <h1 className="text-2xl font-bold">商品一覧</h1>
        <Link
          to="/add"
          className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
        >
          商品を追加
        </Link>
      </header>

      <main className="p-4">
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/add" element={<AddProduct />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/edit/:id" element={<EditProduct />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
