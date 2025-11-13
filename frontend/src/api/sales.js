// src/api/sales.js

// 📌 このファイルでは「売上データ取得」に関するAPI呼び出し処理をまとめている。
//    役割：バックエンドの /api/sales エンドポイントと通信して、
//         日別売上などのデータをフロント側に取得して渡す。

import axios from "axios";
// ✅ axiosはHTTPクライアントライブラリ。
//    簡単にバックエンドAPIと通信（GET, POST, PUT, DELETEなど）ができる。

// 📌 日別売上データを取得する関数
export const fetchDailySales = async () => {
  // バックエンドの `/api/sales/daily` エンドポイントへリクエストを送信。
  // import.meta.env.VITE_API_URL → Viteで定義した環境変数。
  // 例: http://localhost:5000/api や https://本番URL/api など。
  // ✅ フロントエンドは「どの環境でも同じコード」で動かせるように、
  //    ベースURLは環境変数に切り替えている。
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/sales/daily`); // 🔁 /sales/dailyにGETリクエスト

  // バックエンドからのレスポンス（res.data）を返す。
  // ここには日別の売上データ（例：日付ごとの合計売上や件数）が含まれる。
  return res.data;
};
