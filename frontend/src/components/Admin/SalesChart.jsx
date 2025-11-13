// src/components/Admin/SalesChart.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";

// Rechartsのコンポーネントをインポート
import {
  BarChart, // 棒グラフ全体のコンテナ
  Bar, // 棒グラフの各棒
  XAxis, // X軸
  YAxis, // Y軸
  CartesianGrid, // グリッド線
  Tooltip, // ホバー時に詳細情報を表示
  ResponsiveContainer, // 親要素の幅に応じて自動でサイズ調整
} from "recharts";

const SalesChart = ({ token }) => {
  // 月別売上データを格納するステート
  const [monthlySales, setMonthlySales] = useState([]);
  // エラーメッセージ用ステート
  const [error, setError] = useState(null);

  useEffect(() => {
    // 月別売上データ取得の非同期関数
    const fetchMonthlySales = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/sales/monthly`, // バックエンドAPI
          {
            headers: { Authorization: `Bearer ${token}` }, // Firebaseトークン認証
          }
        );

        console.log("月別売上データ:", res.data); // データ確認用

        // APIから返却されたデータをフロント用に整形
        const processedData = res.data.map((item) => ({
          // 例: 2025-09
          month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
          totalSales: item.totalSales,
        }));

        setMonthlySales(processedData); // ステートにセット
      } catch (err) {
        console.error("売上データ取得エラー:", err);
        setError("売上データの取得に失敗しました"); // エラー表示
      }
    };

    // トークンがある場合のみ取得
    if (token) fetchMonthlySales();
  }, [token]); // tokenが変わると再実行

  // エラーがあれば赤文字で表示
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-10">
      {/* グラフタイトル */}
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
        月別売上推移
      </h2>

      {/* 横幅100%でレスポンシブに対応 */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={monthlySales} // 表示するデータ
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }} // グラフ余白
          barCategoryGap="30%" // 棒グラフ間の隙間
        >
          <CartesianGrid strokeDasharray="3 3" /> {/* 破線グリッド */}
          <XAxis dataKey="month" /> {/* X軸に月を表示 */}
          <YAxis tickFormatter={(value) => `¥${value.toLocaleString()}`} />
          {/* 金額を¥付きで表示 */}
          <Tooltip formatter={(value) => `¥${value.toLocaleString()}`} />
          {/* ホバー時に金額表示 */}
          <Bar dataKey="totalSales" fill="#8884d8" barSize={15} />
          {/* 棒グラフの色・幅 */}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;
