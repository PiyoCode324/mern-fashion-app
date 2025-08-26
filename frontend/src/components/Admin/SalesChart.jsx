// src/components/Admin/SalesChart.jsx
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

const SalesChart = ({ token }) => {
  const [monthlySales, setMonthlySales] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMonthlySales = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/sales/monthly`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // データ整形
        const processedData = res.data.map((item) => ({
          month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
          totalSales: item.totalSales,
        }));
        setMonthlySales(processedData);
      } catch (err) {
        console.error("売上データ取得エラー:", err);
        setError("売上データの取得に失敗しました");
      }
    };

    if (token) fetchMonthlySales();
  }, [token]);

  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-10">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
        月別売上推移
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={monthlySales}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          barCategoryGap="30%"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="totalSales" fill="#8884d8" barSize={15} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;
