// src/components/SalesLineChart.jsx
import { useEffect, useState } from "react";
import { fetchDailySales } from "../api/sales";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";

const SalesLineChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchDailySales().then((res) => {
      const formatted = res.map((item) => ({
        date: dayjs(
          `${item._id.year}-${item._id.month}-${item._id.day}`
        ).format("YYYY-MM-DD"),
        sales: item.totalSales,
        orders: item.orderCount,
      }));
      setData(formatted);
    });
  }, []);

  return (
    <div className="w-full h-[300px] p-4 bg-white rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-2">📊 日別売上推移</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="sales"
            stroke="#8884d8"
            name="売上 (円)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesLineChart;
