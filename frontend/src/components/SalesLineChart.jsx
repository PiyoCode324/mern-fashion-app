// src/components/SalesLineChart.jsx

import { useEffect, useState } from "react";
import { fetchDailySales } from "../api/sales"; // 📌 APIから日別売上データを取得する関数
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"; // 📊 Rechartsライブラリから必要なコンポーネントをインポート
import dayjs from "dayjs"; // 📅 日付フォーマット用ライブラリ

const SalesLineChart = () => {
  // 売上データを保持する state
  const [data, setData] = useState([]);

  // コンポーネントがマウントされたときに売上データを取得
  useEffect(() => {
    fetchDailySales().then((res) => {
      // APIから取得した日付情報をフォーマットし、売上や注文数を整形
      const formatted = res.map((item) => ({
        // `_id`に含まれる year, month, day を結合して日付文字列に変換
        date: dayjs(
          `${item._id.year}-${item._id.month}-${item._id.day}`
        ).format("YYYY-MM-DD"), // 例: 2025-09-10
        sales: item.totalSales, // その日の売上合計
        orders: item.orderCount, // その日の注文数
      }));
      setData(formatted); // 整形済みデータを state に保存
    });
  }, []); // [] → 初回レンダリング時のみ実行

  return (
    <div className="w-full h-[300px] p-4 bg-white rounded-xl shadow">
      {/* グラフタイトル */}
      <h2 className="text-xl font-semibold mb-2">📊 日別売上推移</h2>

      {/* ResponsiveContainer → 親要素に合わせてグラフのサイズが自動調整される */}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          {/* グラフの背景に格子線を表示 */}
          <CartesianGrid strokeDasharray="3 3" />
          {/* 横軸（X軸） → 日付を表示 */}
          <XAxis dataKey="date" />
          {/* 縦軸（Y軸） → 売上金額を表示 */}
          <YAxis />
          {/* ホバー時に詳細データを表示 */}
          <Tooltip />
          {/* 実際の売上データを線で描画 */}
          <Line
            type="monotone" // 線の描画スタイル（曲線）
            dataKey="sales" // 売上データを参照
            stroke="#8884d8" // 線の色
            name="売上 (円)" // 凡例に表示される名前
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesLineChart;
