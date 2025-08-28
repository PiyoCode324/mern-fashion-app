// src/components/Admin/TopProductsChart.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const TopProductsChart = ({ token }) => {
  const [topProducts, setTopProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/sales/top-products`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTopProducts(res.data);
      } catch (err) {
        console.error("人気商品取得エラー:", err);
        setError("人気商品の取得に失敗しました");
      }
    };

    if (token) fetchTopProducts();
  }, [token]);

  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-10">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
        売れ筋商品ランキング
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={topProducts} layout="vertical" margin={{ left: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            tickFormatter={(value) => value.toLocaleString()}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={150}
            tick={{ fontSize: 12 }}
          />
          <Tooltip formatter={(value) => value.toLocaleString()} />
          <Bar dataKey="totalSold" fill="#82ca9d" barSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopProductsChart;
