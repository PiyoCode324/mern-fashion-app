// src/components/admin/AdminProductList.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import ProductCard from "../ProductCard";
import { useAuth } from "../../contexts/AuthContext"; // 認証Context
import ProductDetail from "../ProductDetail";

const AdminProductList = () => {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [keyword, setKeyword] = useState("");

  const { firebaseUser, loadingAuth } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      if (loadingAuth) return;

      try {
        let headers = {};
        if (firebaseUser) {
          const token = await firebaseUser.getIdToken();
          headers = {
            Authorization: `Bearer ${token}`,
          };
        }

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/products`,
          { headers }
        );
        setProducts(res.data);
      } catch (err) {
        console.error("❌ 管理者：商品の取得に失敗:", err);
      }
    };

    fetchProducts();
  }, [firebaseUser, loadingAuth]);

  // カテゴリや価格・キーワードでのフィルタ処理
  const filteredProducts = products
    .filter((product) =>
      category === "all" ? true : product.category === category
    )
    .filter((product) => {
      if (priceRange === "all") return true;
      const [min, max] = priceRange.split("-").map(Number);
      return product.price >= min && product.price <= max;
    })
    .filter((product) => {
      if (keyword.trim() === "") return true;
      const lower = keyword.toLowerCase();
      return (
        product.name.toLowerCase().includes(lower) ||
        product.description.toLowerCase().includes(lower)
      );
    });

  const categories = ["all", "tops", "bottoms", "accessory", "hat", "bag"];
  const priceRanges = [
    { label: "すべての価格", value: "all" },
    { label: "〜¥5,000", value: "0-5000" },
    { label: "¥5,000〜¥10,000", value: "5000-10000" },
    { label: "¥10,000〜", value: "10000-999999" },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">🛠 商品一覧（管理者）</h2>

      {/* フィルタ操作エリア */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* カテゴリ */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded border ${
                category === cat ? "bg-indigo-600 text-white" : "bg-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 価格 */}
        <select
          value={priceRange}
          onChange={(e) => setPriceRange(e.target.value)}
          className="border p-2 rounded"
        >
          {priceRanges.map((range) => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>

        {/* キーワード */}
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="商品名・説明で検索"
          className="border p-2 rounded w-64"
        />
      </div>

      {/* 商品リスト */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <div key={product._id} className="relative">
            <ProductCard product={product} />
            <div className="absolute top-2 right-2 flex gap-2">
              <Link
                to={`/admin/products/edit/${product._id}`}
                className="bg-yellow-400 text-white px-2 py-1 rounded text-sm"
              >
                編集
              </Link>
            </div>

            <div className="absolute top-2 right-2 flex gap-2">
              <Link
                to={`/edit/${product._id}`}
                className="bg-yellow-400 text-white px-2 py-1 rounded text-sm"
              >
                編集
              </Link>

              {/* 削除ボタンなどは必要に応じて */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProductList;
