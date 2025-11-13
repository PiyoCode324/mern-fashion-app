// src/components/ProductList.jsx
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";
import { useAuth } from "../contexts/AuthContext"; // 認証情報を管理するコンテキスト
import Spinner from "./common/Spinner"; // ローディング中に表示するスピナー

const ProductList = () => {
  // 商品一覧データを保持するステート
  const [products, setProducts] = useState([]);
  // カテゴリーフィルター（デフォルトは "all"）
  const [category, setCategory] = useState("all");
  // 価格帯フィルター（デフォルトは "all"）
  const [priceRange, setPriceRange] = useState("all");
  // キーワード検索用のステート
  const [keyword, setKeyword] = useState("");
  // 商品取得中のローディング状態
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Firebase 認証ユーザー情報とそのロード状態を取得
  const { firebaseUser, loadingAuth } = useAuth();

  // 商品一覧を API から取得する処理（ユーザーの認証状態に依存）
  useEffect(() => {
    const fetchProducts = async () => {
      // 認証情報のロード中であれば処理を待機
      if (loadingAuth) {
        return;
      }

      try {
        setLoadingProducts(true); // 取得開始 → スピナー表示

        let headers = {};
        if (firebaseUser) {
          // ログインしている場合、ID トークンを取得しリクエストヘッダーに付与
          const token = await firebaseUser.getIdToken();
          headers = {
            Authorization: `Bearer ${token}`,
          };
        } else {
          // 非ログイン時の挙動（例: 公開商品だけ取得）
          console.log(
            "ユーザーがログインしていません。認証なしで商品を取得します。"
          );
        }

        // 商品一覧をバックエンド API から取得
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/products`,
          {
            headers: headers,
          }
        );
        setProducts(res.data); // 取得した商品をステートに保存
      } catch (err) {
        console.error("商品の取得に失敗しました:", err);
      } finally {
        setLoadingProducts(false); // 完了後スピナーを非表示
      }
    };

    fetchProducts();
  }, [firebaseUser, loadingAuth]);

  // カテゴリ一覧（ボタンで切り替え）
  const categories = ["all", "tops", "bottoms", "accessory", "hat", "bag"];

  // 商品一覧に複数のフィルターを適用
  const filteredProducts = products
    // カテゴリーフィルター
    .filter((product) =>
      category === "all" ? true : product.category === category
    )
    // 価格帯フィルター
    .filter((product) => {
      if (priceRange === "all") return true;
      const [min, max] = priceRange.split("-").map(Number);
      return product.price >= min && product.price <= max;
    })
    // キーワード検索（商品名または説明に部分一致）
    .filter((product) => {
      if (keyword.trim() === "") return true;
      const lowerKeyword = keyword.toLowerCase();
      return (
        product.name.toLowerCase().includes(lowerKeyword) ||
        product.description.toLowerCase().includes(lowerKeyword)
      );
    });

  // 価格帯選択肢リスト
  const priceRanges = [
    { label: "すべての価格", value: "all" },
    { label: "〜¥5,000", value: "0-5000" },
    { label: "¥5,000〜¥10,000", value: "5000-10000" },
    { label: "¥10,000〜", value: "10000-999999" },
  ];

  return (
    <div className="p-4 max-w-5xl mx-auto">
      {/* 🔹 カテゴリーフィルター */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)} // 選択カテゴリを更新
            className={`px-3 py-1 rounded border transition ${
              category === cat
                ? "bg-indigo-500 text-white" // 選択中のボタンはハイライト
                : "bg-white text-gray-800 dark:bg-gray-700 dark:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 🔹 価格帯フィルター */}
      <div className="mb-4">
        <select
          value={priceRange}
          onChange={(e) => setPriceRange(e.target.value)} // 価格範囲を更新
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

      {/* 🔹 キーワード検索 */}
      <div className="mb-4">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)} // 入力値を更新
          placeholder="商品名や説明で検索"
          className="border p-2 rounded w-full bg-white text-gray-800 dark:bg-gray-700 dark:text-white dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-300"
        />
      </div>

      {/* 🔹 ローディング中はスピナー表示、それ以外は商品カードを表示 */}
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
