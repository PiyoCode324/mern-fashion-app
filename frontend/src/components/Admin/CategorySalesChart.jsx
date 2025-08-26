// src/components/Admin/CategorySalesChart.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#a1c4fd"];

const CategorySalesChart = ({ token }) => {
  const [categorySales, setCategorySales] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategorySales = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/sales/category-sales`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCategorySales(res.data);
      } catch (err) {
        console.error("カテゴリー別売上取得エラー:", err);
        setError("カテゴリー別売上の取得に失敗しました");
      }
    };

    if (token) fetchCategorySales();
  }, [token]);

  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-10">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
        カテゴリー別売上割合
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={categorySales}
            dataKey="totalSales"
            nameKey="category"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ name, percent }) =>
              `${name} (${(percent * 100).toFixed(0)}%)`
            }
          >
            {categorySales.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategorySalesChart;
