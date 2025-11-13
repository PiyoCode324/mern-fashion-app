// src/components/admin/AdminProductList.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import ProductCard from "../ProductCard";
import { useAuth } from "../../contexts/AuthContext";

const AdminProductList = () => {
  // 🔹 商品一覧データを保持
  const [products, setProducts] = useState([]);
  // 🔹 選択されたカテゴリ（初期値は「all」）
  const [category, setCategory] = useState("all");
  // 🔹 選択された価格帯（初期値は「all」）
  const [priceRange, setPriceRange] = useState("all");
  // 🔹 キーワード検索用
  const [keyword, setKeyword] = useState("");

  // 🔹 Firebase認証情報を取得
  const { firebaseUser, loadingAuth } = useAuth();

  // コンポーネントがマウントされた時 & 認証情報が更新された時に商品一覧を取得
  useEffect(() => {
    const fetchProducts = async () => {
      if (loadingAuth) return; // ローディング中は実行しない

      try {
        let headers = {};
        // 🔹 ログイン済みユーザーなら、トークンを取得してリクエストに添付
        if (firebaseUser) {
          const token = await firebaseUser.getIdToken();
          headers = {
            Authorization: `Bearer ${token}`,
          };
        }

        // 🔹 商品一覧を取得（管理者専用API想定）
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

  // 🔹 フィルタリング処理
  const filteredProducts = products
    // カテゴリで絞り込み
    .filter((product) =>
      category === "all" ? true : product.category === category
    )
    // 価格帯で絞り込み
    .filter((product) => {
      if (priceRange === "all") return true;
      const [min, max] = priceRange.split("-").map(Number);
      return product.price >= min && product.price <= max;
    })
    // キーワードで絞り込み（名前 or 説明文）
    .filter((product) => {
      if (keyword.trim() === "") return true;
      const lower = keyword.toLowerCase();
      return (
        product.name.toLowerCase().includes(lower) ||
        product.description.toLowerCase().includes(lower)
      );
    });

  // 🔹 カテゴリ選択肢
  const categories = ["all", "tops", "bottoms", "accessory", "hat", "bag"];
  // 🔹 価格帯選択肢
  const priceRanges = [
    { label: "すべての価格", value: "all" },
    { label: "〜¥5,000", value: "0-5000" },
    { label: "¥5,000〜¥10,000", value: "5000-10000" },
    { label: "¥10,000〜", value: "10000-999999" },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto text-gray-800 dark:text-white">
      {/* 見出し */}
      <h2 className="text-2xl font-bold mb-6">🛠 商品一覧（管理者）</h2>

      {/* フィルタリング操作エリア */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* カテゴリフィルタ */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded border dark:border-gray-600 ${
                category === cat
                  ? "bg-indigo-600 text-white" // 選択中
                  : "bg-white dark:bg-gray-800 dark:text-white" // 未選択
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 価格フィルタ */}
        <select
          value={priceRange}
          onChange={(e) => setPriceRange(e.target.value)}
          className="border p-2 rounded dark:bg-gray-800 dark:text-white dark:border-gray-600"
        >
          {priceRanges.map((range) => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>

        {/* キーワード検索 */}
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="商品名・説明で検索"
          className="border p-2 rounded w-64 dark:bg-gray-800 dark:text-white dark:border-gray-600"
        />
      </div>

      {/* 商品リスト表示エリア */}
      {/* 横スクロール対応 */}
      <div className="overflow-x-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div key={product._id} className="relative">
              {/* 商品カード */}
              <ProductCard product={product} />
              {/* 編集ボタン（管理者専用） */}
              <div className="absolute top-2 right-2 flex gap-2">
                <Link
                  to={`/edit/${product._id}`}
                  className="bg-yellow-400 text-white px-2 py-1 rounded text-sm"
                >
                  編集
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminProductList;
