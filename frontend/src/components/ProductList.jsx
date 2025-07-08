import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("all");

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/products`)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));
  }, []);

  const categories = ["all", "tops", "bottoms", "accessory", "hat", "bag"];
  const [priceRange, setPriceRange] = useState("all");
  const [keyword, setKeyword] = useState("");

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
      const lowerKeyword = keyword.toLowerCase();
      return (
        product.name.toLowerCase().includes(lowerKeyword) ||
        product.description.toLowerCase().includes(lowerKeyword)
      );
    });

  const priceRanges = [
    { label: "すべての価格", value: "all" },
    { label: "〜¥5,000", value: "0-5000" },
    { label: "¥5,000〜¥10,000", value: "5000-10000" },
    { label: "¥10,000〜", value: "10000-999999" },
  ];

  return (
    <div className="p-4 max-w-5xl mx-auto">
      {/* カテゴリフィルター */}
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

      {/* 価格帯フィルター（カテゴリの下） */}
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

      {/* 検索フォーム */}
      <div className="mb-4">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="商品名や説明で検索"
          className="border p-2 rounded w-full"
        />
      </div>

      {/* 商品一覧 */}
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
