// src/pages/ConfirmOrder.jsx
import React from "react";
import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";

import { loadStripe } from "@stripe/stripe-js";
// Stripeの公開可能キーでStripeオブジェクトを初期化
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const ConfirmOrder = () => {
  // カート内のアイテムを取得
  const { cartItems } = useCart();
  const navigate = useNavigate();

  // カート内商品の合計金額を計算（価格 × 数量の合計）
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // 注文確定ボタン押下時の処理
  const handleConfirm = async () => {
    // Stripeオブジェクトを取得
    const stripe = await stripePromise;

    // バックエンドにチェックアウトセッションを作成依頼（POST）
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/payment/create-checkout-session`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cartItems }), // カート内容を送信
      }
    );

    // レスポンスからセッション情報を取得
    const session = await response.json();

    // Stripeのチェックアウト画面へリダイレクト
    await stripe.redirectToCheckout({ sessionId: session.id });
  };

  // カートが空の場合は注文確認画面を表示せずメッセージのみ表示
  if (cartItems.length === 0) {
    return <p className="p-6">カートに商品がありません。</p>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* 注文確認タイトル */}
      <h2 className="text-2xl font-bold mb-6">🧾 注文確認</h2>

      {/* カート内商品の一覧表示 */}
      <ul className="divide-y divide-gray-200 mb-6">
        {cartItems.map((item) => (
          <li key={item._id} className="py-4">
            <p className="font-medium">{item.name}</p>
            <p className="text-sm text-gray-600">数量: {item.quantity}</p>
            <p className="text-sm text-gray-600">
              小計: ¥{(item.price * item.quantity).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>

      {/* 合計金額の表示 */}
      <p className="text-lg font-semibold mb-4">
        合計金額: ¥{totalAmount.toLocaleString()}
      </p>

      {/* 注文確定ボタン */}
      <button
        onClick={handleConfirm}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        注文を確定する
      </button>
    </div>
  );
};

export default ConfirmOrder;
