// src/pages/ConfirmOrder.jsx
import React from "react";
import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const ConfirmOrder = () => {
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleConfirm = async () => {
    if (cartItems.length === 0) {
      toast.warn("カートに商品がありません。");
      return;
    }

    try {
      const stripe = await stripePromise;
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/payment/create-checkout-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: cartItems }),
        }
      );

      if (!response.ok) {
        throw new Error("決済セッションの作成に失敗しました。");
      }

      const session = await response.json();

      const result = await stripe.redirectToCheckout({ sessionId: session.id });
      if (result.error) {
        toast.error(result.error.message);
      }
    } catch (error) {
      console.error("注文確定エラー:", error);
      toast.error("注文の確定中にエラーが発生しました。再度お試しください。");
    }
  };

  if (cartItems.length === 0) {
    return <p className="p-6">カートに商品がありません。</p>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">🧾 注文確認</h2>

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

      <p className="text-lg font-semibold mb-4">
        合計金額: ¥{totalAmount.toLocaleString()}
      </p>

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
