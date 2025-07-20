// src/pages/ConfirmOrder.jsx
import React from "react";
import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";

import { loadStripe } from "@stripe/stripe-js";
// Initialize Stripe with your public key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const ConfirmOrder = () => {
  // Get items from cart
  const { cartItems } = useCart();
  const navigate = useNavigate();

  // Calculate total price (price × quantity)
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Handle order confirmation
  const handleConfirm = async () => {
    // Get Stripe object
    const stripe = await stripePromise;

    // Create a Checkout Session (POST to backend)
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/payment/create-checkout-session`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cartItems }), // Send cart data
      }
    );

    // Get session info from the response
    const session = await response.json();

    // Redirect to Stripe Checkout
    await stripe.redirectToCheckout({ sessionId: session.id });
  };

  // Show message if cart is empty
  if (cartItems.length === 0) {
    return <p className="p-6">カートに商品がありません。</p>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Page title */}
      <h2 className="text-2xl font-bold mb-6">🧾 注文確認</h2>

      {/* Cart item list */}
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

      {/* Total amount */}
      <p className="text-lg font-semibold mb-4">
        合計金額: ¥{totalAmount.toLocaleString()}
      </p>

      {/* Confirm order button */}
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
