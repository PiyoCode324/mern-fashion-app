// src/components/Admin/CategorySalesChart.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";

// Rechartsのコンポーネントをインポート
import {
  PieChart, // 円グラフ全体のコンテナ
  Pie, // 円グラフの実際の円
  Tooltip, // ホバー時に詳細情報を表示するツールチップ
  Cell, // 各円グラフのセグメント（色指定など）
  ResponsiveContainer, // 親要素の幅に応じて自動でサイズ調整
  Legend, // 凡例
} from "recharts";

// 円グラフの各カテゴリに対応するカラー配列
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#a1c4fd"];

const CategorySalesChart = ({ token }) => {
  // カテゴリー別売上データを格納するステート
  const [categorySales, setCategorySales] = useState([]);
  // エラーメッセージを格納するステート
  const [error, setError] = useState(null);

  useEffect(() => {
    // カテゴリー別売上データを取得する非同期関数
    const fetchCategorySales = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/sales/category-sales`, // バックエンドAPIのURL
          {
            headers: { Authorization: `Bearer ${token}` }, // Firebaseトークン認証
          }
        );
        // 成功した場合、データをステートにセット
        setCategorySales(res.data);
      } catch (err) {
        console.error("カテゴリー別売上取得エラー:", err);
        setError("カテゴリー別売上の取得に失敗しました"); // エラー発生時
      }
    };

    // トークンがある場合のみデータ取得
    if (token) fetchCategorySales();
  }, [token]); // tokenが変わるたびに再実行

  // エラーがあれば赤文字で表示
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-10">
      {/* グラフタイトル */}
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
        カテゴリー別売上割合
      </h2>

      {/* 横幅100%でレスポンシブに対応するコンテナ */}
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={categorySales} // 円グラフに描画するデータ配列
            dataKey="totalSales" // 値として使うプロパティ
            nameKey="category" // 名前として使うプロパティ
            cx="50%" // X座標の中心
            cy="50%" // Y座標の中心
            outerRadius={100} // 円の半径
            labelLine={false} // ラベル線を非表示
            // 円内に割合をパーセント表示
            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
          >
            {/* 各セグメントの色を設定 */}
            {categorySales.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]} // COLORS配列をループ
              />
            ))}
          </Pie>
          {/* ホバー時に金額を¥付きで表示 */}
          <Tooltip formatter={(value) => `¥${value.toLocaleString()}`} />
          {/* 凡例を表示 */}
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategorySalesChart;
