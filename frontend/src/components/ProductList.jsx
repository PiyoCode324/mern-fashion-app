// src/components/ProductList.jsx
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";
import { useAuth } from "../contexts/AuthContext"; // AuthContextをインポート

const ProductList = () => {
  // 商品一覧を格納するステート
  const [products, setProducts] = useState([]);
  // カテゴリの絞り込みステート（初期値は"all"）
  const [category, setCategory] = useState("all");
  // Firebase認証のユーザー情報と認証読み込み状態を取得
  const { firebaseUser, loadingAuth } = useAuth();

  // 商品取得処理（firebaseUserや認証読み込み状態の変化に応じて実行）
  useEffect(() => {
    const fetchProducts = async () => {
      // 認証情報の読み込みが完了していなければ処理を待つ
      if (loadingAuth) {
        return;
      }

      try {
        let headers = {};
        if (firebaseUser) {
          // ログイン済みユーザーなら最新のIDトークンを取得し、認証ヘッダーに設定
          const token = await firebaseUser.getIdToken();
          headers = {
            Authorization: `Bearer ${token}`,
          };
        } else {
          // 未ログインの場合の挙動（例：認証不要の商品だけ表示など）
          console.log(
            "ユーザーがログインしていません。認証なしで商品を取得します。"
          );
          // 認証不要商品限定の処理をここに追加可能
        }

        // APIから商品一覧を取得（認証ヘッダー付き）
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/products`,
          {
            headers: headers,
          }
        );
        setProducts(res.data);
      } catch (err) {
        console.error("商品の取得に失敗しました:", err);
        // 401などのエラーに応じてログイン画面へのリダイレクトや通知を検討
      }
    };

    fetchProducts();
  }, [firebaseUser, loadingAuth]);

  // 商品カテゴリの一覧
  const categories = ["all", "tops", "bottoms", "accessory", "hat", "bag"];
  // 価格帯の絞り込みステート
  const [priceRange, setPriceRange] = useState("all");
  // キーワード検索用ステート
  const [keyword, setKeyword] = useState("");

  // 取得した商品リストに対して複数のフィルターを適用
  const filteredProducts = products
    // カテゴリでフィルタリング（allはすべてを表示）
    .filter((product) =>
      category === "all" ? true : product.category === category
    )
    // 価格帯でフィルタリング（allはすべての価格を含む）
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

  // 価格帯の選択肢リスト
  const priceRanges = [
    { label: "すべての価格", value: "all" },
    { label: "〜¥5,000", value: "0-5000" },
    { label: "¥5,000〜¥10,000", value: "5000-10000" },
    { label: "¥10,000〜", value: "10000-999999" },
  ];

  return (
    <div className="p-4 max-w-5xl mx-auto">
      {/* カテゴリーフィルター */}
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

      {/* 価格帯フィルター */}
      <div className="mb-4">
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
      </div>

      {/* キーワード検索フォーム */}
      <div className="mb-4">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="商品名や説明で検索"
          className="border p-2 rounded w-full"
        />
      </div>

      {/* フィルター後の商品一覧を表示 */}
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
