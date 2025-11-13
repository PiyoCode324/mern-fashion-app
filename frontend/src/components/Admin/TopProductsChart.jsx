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

// 管理者用の売れ筋商品ランキングチャートコンポーネント
const TopProductsChart = ({ token }) => {
  // topProducts: APIから取得した人気商品データを保持
  const [topProducts, setTopProducts] = useState([]);
  // エラーメッセージを保持
  const [error, setError] = useState(null);

  // 初回レンダリング時および token 変更時にデータ取得
  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        // APIリクエスト: 売れ筋商品データを取得
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/sales/top-products`,
          {
            // Firebase IDトークンを Authorization ヘッダーにセット
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTopProducts(res.data); // 成功時に state を更新
      } catch (err) {
        console.error("人気商品取得エラー:", err);
        setError("人気商品の取得に失敗しました"); // エラー表示用
      }
    };

    // token がある場合のみデータ取得
    if (token) fetchTopProducts();
  }, [token]);

  // エラー発生時は赤文字で表示
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-10">
      {/* タイトル */}
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
        売れ筋商品ランキング
      </h2>

      {/* レスポンシブ対応のグラフコンテナ */}
      <ResponsiveContainer width="100%" height={300}>
        {/* 横向きの棒グラフ */}
        <BarChart data={topProducts} layout="vertical" margin={{ left: 60 }}>
          {/* グリッド線 */}
          <CartesianGrid strokeDasharray="3 3" />

          {/* X軸（売上数） */}
          <XAxis
            type="number" // 数値軸
            tickFormatter={(value) => value.toLocaleString()} // 数値を3桁区切りで表示
          />

          {/* Y軸（商品名） */}
          <YAxis
            type="category" // カテゴリ軸
            dataKey="name" // 商品名を表示
            width={150} // Y軸の幅を固定
            tick={{ fontSize: 12 }} // 文字サイズ
          />

          {/* ツールチップ：ホバー時に売上数を表示 */}
          <Tooltip formatter={(value) => value.toLocaleString()} />

          {/* 棒グラフ本体 */}
          <Bar dataKey="totalSold" fill="#82ca9d" barSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopProductsChart;
