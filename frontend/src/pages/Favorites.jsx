import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useFavorite } from "../contexts/FavoriteContext";

const Favorites = () => {
  const { favorites } = useFavorite();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // favorites の状態に応じて処理を分岐
    if (!favorites) return;

    if (favorites.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
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
        setProducts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [favorites]);

  return (
    <div className="p-4">
      <Link to="/" className="inline-block mb-4 text-blue-600 hover:underline">
        ← ホームに戻る
      </Link>

      <h2 className="text-2xl font-bold mb-4">❤️ お気に入り一覧</h2>

      {loading ? (
        <p>お気に入りの商品を読み込み中です...</p>
      ) : (
        <>
          {favorites.length === 0 ? (
            <p>お気に入りが登録されていません。</p>
          ) : products.length === 0 ? (
            <p>該当するお気に入りの商品が見つかりませんでした。</p>
          ) : (
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
