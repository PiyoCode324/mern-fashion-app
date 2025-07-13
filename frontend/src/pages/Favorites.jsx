// src/pages/Favorite.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useFavorite } from "../contexts/FavoriteContext";

const Favorites = () => {
  // お気に入り商品のIDリストをコンテキストから取得
  const { favorites } = useFavorite();

  // お気に入り商品の詳細データを保持
  const [products, setProducts] = useState([]);
  // ローディング状態管理
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // favorites が未定義なら処理を中断
    if (!favorites) return;

    // お気に入りが空の場合はproductsを空配列にしてローディング終了
    if (favorites.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    // すべての商品データを取得し、お気に入りIDリストに含まれる商品だけを抽出
    axios
      .get(`${import.meta.env.VITE_API_URL}/products`)
      .then((res) => {
        const filtered = res.data.filter((product) =>
          favorites.includes(product._id)
        );
        setProducts(filtered);
      })
      .catch((err) => {
        console.error("Error fetching products for favorites:", err);
        setProducts([]); // エラー時は空配列に設定
      })
      .finally(() => {
        setLoading(false);
      });
  }, [favorites]);

  return (
    <div className="p-4">
      {/* ホームに戻るリンク */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-block bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
        >
          ホームに戻る
        </Link>
      </div>

      {/* お気に入り一覧タイトル */}
      <h2 className="text-2xl font-bold mb-4">❤️ お気に入り一覧</h2>

      {loading ? (
        // ローディング表示
        <p>お気に入りの商品を読み込み中です...</p>
      ) : (
        <>
          {favorites.length === 0 ? (
            // お気に入り登録がない場合の表示
            <p>お気に入りが登録されていません。</p>
          ) : products.length === 0 ? (
            // お気に入りIDはあるが該当商品がない場合の表示（例: 商品削除済みなど）
            <p>該当するお気に入りの商品が見つかりませんでした。</p>
          ) : (
            // 商品カード一覧をグリッドで表示
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((product) => (
                <Link key={product._id} to={`/products/${product._id}`}>
                  <ProductCard product={product} />
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Favorites;
