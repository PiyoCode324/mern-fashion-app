import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/products/${id}`)
      .then((res) => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("商品が見つかりません");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link to="/" className="text-indigo-600 underline mb-4 inline-block">
        ← 商品一覧に戻る
      </Link>
      <div className="border rounded p-4 shadow">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-64 object-cover rounded mb-4"
        />
        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
        <p className="text-gray-600 capitalize mb-2">{product.category}</p>
        <p className="text-indigo-700 text-xl font-semibold mb-4">
          {product.price} 円
        </p>
      </div>
    </div>
  );
}
