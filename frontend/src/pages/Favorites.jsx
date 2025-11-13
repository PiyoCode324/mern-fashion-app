// src/pages/Favorite.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useFavorite } from "../contexts/FavoriteContext";

const Favorites = () => {
  // useFavorite カスタムフックからお気に入り商品のID配列を取得
  const { favorites } = useFavorite();

  // お気に入り商品の詳細情報を格納するステート
  const [products, setProducts] = useState([]);
  // データ読み込み中かどうかを管理するステート
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // favorites が undefined の場合は処理を中断
    if (!favorites) return;

    // favorites 配列が空の場合、products を空にして読み込み状態を解除
    if (favorites.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true); // データ取得開始時にローディング状態にする

    // 全商品のデータを取得して、お気に入りに含まれるものだけを抽出
    axios
      .get(`${import.meta.env.VITE_API_URL}/products`)
      .then((res) => {
        // 取得した商品リストから favorites に含まれるものだけフィルター
        const filtered = res.data.filter((product) =>
          favorites.includes(product._id)
        );
        setProducts(filtered); // フィルターした結果を products にセット
      })
      .catch((err) => {
        // データ取得失敗時はコンソールにエラーを表示し、products を空にリセット
        console.error("Error fetching favorite products:", err);
        setProducts([]);
      })
      .finally(() => {
        // 成功・失敗いずれも処理完了後にローディングを解除
        setLoading(false);
      });
  }, [favorites]); // favorites が更新されるたびに実行

  return (
    <div className="p-4">
      {/* ホームページへのリンク */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-block bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
        >
          ホームに戻る
        </Link>
      </div>

      {/* ページタイトル */}
      <h2 className="text-2xl font-bold mb-4">❤️ お気に入り一覧</h2>

      {loading ? (
        // ローディング中の表示
        <p>お気に入りの商品を読み込み中です...</p>
      ) : (
        <>
          {favorites.length === 0 ? (
            // お気に入りが登録されていない場合の表示
            <p>お気に入りが登録されていません。</p>
          ) : products.length === 0 ? (
            // favorites にIDはあるが、該当する商品が存在しない場合（削除済みなど）
            <p>該当するお気に入りの商品が見つかりませんでした。</p>
          ) : (
            // お気に入り商品が存在する場合は ProductCard をグリッド表示
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
