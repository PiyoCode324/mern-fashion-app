// src/pages/ConfirmOrder.jsx
import React from "react";
import { useCart } from "../contexts/CartContext"; // カートの状態管理用コンテキストを使用
import { useNavigate } from "react-router-dom"; // ページ遷移用フック
import { toast } from "react-toastify"; // 通知メッセージ表示用ライブラリ
import { loadStripe } from "@stripe/stripe-js"; // Stripe決済用ライブラリ

// Stripeの公開キーを使ってインスタンスを初期化（非同期でロードされる）
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const ConfirmOrder = () => {
  const { cartItems } = useCart(); // カートに入っている商品を取得
  const navigate = useNavigate(); // ページ遷移関数

  // 合計金額を計算（商品単価 × 数量 の合計）
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // 注文確定ボタンを押したときの処理
  const handleConfirm = async () => {
    // カートが空の場合は警告を表示して処理中断
    if (cartItems.length === 0) {
      toast.warn("カートに商品がありません。");
      return;
    }

    try {
      // Stripeオブジェクトを取得
      const stripe = await stripePromise;

      // バックエンドにチェックアウトセッションを作成依頼
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/payment/create-checkout-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: cartItems }), // カート内の商品情報を送信
        }
      );

      // レスポンスが失敗した場合はエラーを投げる
      if (!response.ok) {
        throw new Error("決済セッションの作成に失敗しました。");
      }

      // 作成されたセッション情報を取得
      const session = await response.json();

      // Stripeのチェックアウト画面にリダイレクト
      const result = await stripe.redirectToCheckout({ sessionId: session.id });
      if (result.error) {
        toast.error(result.error.message); // エラーがあれば表示
      }
    } catch (error) {
      console.error("注文確定エラー:", error);
      toast.error("注文の確定中にエラーが発生しました。再度お試しください。");
    }
  };

  // カートが空なら注文確認画面を表示せずにメッセージを出す
  if (cartItems.length === 0) {
    return <p className="p-6">カートに商品がありません。</p>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* ページタイトル */}
      <h2 className="text-2xl font-bold mb-6">🧾 注文確認</h2>

      {/* 商品一覧表示 */}
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

      {/* 合計金額表示 */}
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
