// src/components/ProductList.jsx
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "./ProductCard"; // ⭐ ProductCard を使う

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("all");

  // 📦 バックエンドAPIから商品データを取得
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/products`)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));
  }, []);

  // 🗂️ 商品カテゴリ一覧
  const categories = ["all", "tops", "bottoms", "accessory", "hat", "bag"];

  // 🔍 選択されたカテゴリに基づいて商品をフィルタリング
  const filteredProducts =
    category === "all"
      ? products
      : products.filter((product) => product.category === category);

  return (
    <div className="p-4">
      {/* 🔘 カテゴリフィルターのボタン */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1 rounded border ${
              category === cat ? "bg-indigo-500 text-white" : "bg-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 🛍️ 商品一覧の表示 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <Link key={product._id} to={`/products/${product._id}`}>
            <ProductCard product={product} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
