// src/components/ProductList.jsx
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import React, { useEffect, useState } from "react";
import axios from "axios";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("all");

  // 📦 Fetch product data from the backend API
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/products`)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));
  }, []);

  // 🗂️ Define available product categories
  const categories = ["all", "tops", "bottoms", "accessory", "hat", "bag"];

  // 🔍 Filter products by selected category
  const filteredProducts =
    category === "all"
      ? products
      : products.filter((product) => product.category === category);

  return (
    <div className="p-4">
      {/* 🔘 Category filter buttons */}
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

      {/* 🛍️ Display the list of filtered products */}
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
