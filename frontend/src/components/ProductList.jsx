// src/components/ProductList.jsx
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";
import { useAuth } from "../contexts/AuthContext"; // AuthContextをインポート
import Spinner from "./common/Spinner"; // スピナーをインポート

const ProductList = () => {
  // State for storing product list
  const [products, setProducts] = useState([]);
  // Category filter state (default is "all")
  const [category, setCategory] = useState("all");
  // Price range narrowing state
  const [priceRange, setPriceRange] = useState("all");
  // Keyword search state
  const [keyword, setKeyword] = useState("");
  // ローディング状態（商品取得時）
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Get Firebase authentication user information and authentication loading status
  const { firebaseUser, loadingAuth } = useAuth();

  // Product retrieval process (executed according to changes in firebaseUser and authentication loading status)
  useEffect(() => {
    const fetchProducts = async () => {
      // If the authentication information has not been loaded, wait for the process to finish.
      if (loadingAuth) {
        return;
      }

      try {
        setLoadingProducts(true); // ローディング開始

        let headers = {};
        if (firebaseUser) {
          // If the user is logged in, get the latest ID token and set it in the authorization header.
          const token = await firebaseUser.getIdToken();
          headers = {
            Authorization: `Bearer ${token}`,
          };
        } else {
          // Behavior when not logged in (e.g. displaying only products that do not require authentication)
          console.log(
            "ユーザーがログインしていません。認証なしで商品を取得します。"
          );
        }

        // Get product list from API (with authentication header)
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/products`,
          {
            headers: headers,
          }
        );
        setProducts(res.data);
      } catch (err) {
        console.error("商品の取得に失敗しました:", err);
      } finally {
        setLoadingProducts(false); // ローディング完了
      }
    };

    fetchProducts();
  }, [firebaseUser, loadingAuth]);

  // Product Category List
  const categories = ["all", "tops", "bottoms", "accessory", "hat", "bag"];

  // Apply multiple filters to the retrieved product list
  const filteredProducts = products
    // Filter by category (all shows all)
    .filter((product) =>
      category === "all" ? true : product.category === category
    )
    // Filter by price range (all includes all prices)
    .filter((product) => {
      if (priceRange === "all") return true;
      const [min, max] = priceRange.split("-").map(Number);
      return product.price >= min && product.price <= max;
    })
    // Keyword search (partial match on product name or description)
    .filter((product) => {
      if (keyword.trim() === "") return true;
      const lowerKeyword = keyword.toLowerCase();
      return (
        product.name.toLowerCase().includes(lowerKeyword) ||
        product.description.toLowerCase().includes(lowerKeyword)
      );
    });

  // Price range options list
  const priceRanges = [
    { label: "すべての価格", value: "all" },
    { label: "〜¥5,000", value: "0-5000" },
    { label: "¥5,000〜¥10,000", value: "5000-10000" },
    { label: "¥10,000〜", value: "10000-999999" },
  ];

  return (
    <div className="p-4 max-w-5xl mx-auto">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1 rounded border transition ${
              category === cat
                ? "bg-indigo-500 text-white"
                : "bg-white text-gray-800 dark:bg-gray-700 dark:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Price range filter */}
      <div className="mb-4">
        <select
          value={priceRange}
          onChange={(e) => setPriceRange(e.target.value)}
          className="border p-2 rounded bg-white text-gray-800 dark:bg-gray-700 dark:text-white dark:border-gray-600"
        >
          {priceRanges.map((range) => (
            <option
              key={range.value}
              value={range.value}
              className="bg-white text-black dark:bg-gray-800 dark:text-white"
            >
              {range.label}
            </option>
          ))}
        </select>
      </div>

      {/* Keyword search form */}
      <div className="mb-4">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="商品名や説明で検索"
          className="border p-2 rounded w-full bg-white text-gray-800 dark:bg-gray-700 dark:text-white dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-300"
        />
      </div>

      {/* スピナー表示 or 商品リスト表示 */}
      {loadingProducts ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
