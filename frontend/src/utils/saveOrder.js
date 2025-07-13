// src/utils/saveOrder.js
import { getAuth } from "firebase/auth";

// 🧾 注文データをサーバーに保存するユーティリティ関数
export const saveOrder = async (items, totalAmount) => {
  const auth = getAuth();
  const user = auth.currentUser;

  // 🔐 ログインしているか確認
  if (!user) {
    throw new Error("ログインしていません");
  }

  // 🪪 FirebaseのIDトークンを取得
  const idToken = await user.getIdToken();

  // 📡 注文情報をバックエンドに送信
  const response = await fetch("/api/orders/save-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`, // 🔑 認証トークンをヘッダーに追加
    },
    body: JSON.stringify({
      items, // 🛒 商品リスト
      totalAmount, // 💰 合計金額
    }),
  });

  // ❌ レスポンスが失敗した場合のエラーハンドリング
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "注文保存に失敗しました");
  }

  // ✅ 保存成功時のレスポンスデータを返す
  return await response.json();
};
