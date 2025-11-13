// src/utils/saveOrder.js
import { getAuth } from "firebase/auth";

// 🧾 注文データをサーバーに保存するユーティリティ関数
export const saveOrder = async (items, totalAmount) => {
  const auth = getAuth(); // 🔑 Firebase認証オブジェクトを取得
  const user = auth.currentUser; // 👤 現在ログインしているユーザー情報を取得

  // 🔐 ユーザーがログインしていない場合は処理を中断してエラーを投げる
  if (!user) {
    throw new Error("ログインしていません");
  }

  // 🪪 FirebaseのIDトークンを取得（認証済みであることをサーバーに伝える）
  const idToken = await user.getIdToken();

  // 📡 サーバーに注文情報をPOSTリクエストで送信
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/orders/save-order`, // 🔗 環境変数からAPIのURLを取得
    {
      method: "POST", // HTTPメソッドはPOST
      headers: {
        "Content-Type": "application/json", // JSON形式で送信
        Authorization: `Bearer ${idToken}`, // 🔑 認証用のトークンをヘッダーに付与
      },
      body: JSON.stringify({
        items, // 🛒 注文した商品の配列（productId, quantity などを含む）
        totalAmount, // 💰 注文合計金額
      }),
    }
  );

  // ❌ レスポンスが正常でない場合はエラーとして処理
  if (!response.ok) {
    const errorData = await response.json(); // サーバーから返されたエラー内容を取得
    throw new Error(
      errorData.details || errorData.error || "注文保存に失敗しました"
    );
  }

  // ✅ 保存に成功した場合はサーバーからのレスポンスデータを返す
  return await response.json();
};
