// src/pages/OrderComplete.jsx
import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";

const OrderComplete = () => {
  const { clearCart, cartItems, totalPrice } = useCart(); // 🛒 Cart information
  const { firebaseUser, loadingAuth } = useAuth(); // 🔐 Firebase authentication

  const hasSavedOrder = useRef(false); // ✅ Prevent duplicate submission

  // 🔽 Save order information
  useEffect(() => {
    const saveOrder = async () => {
      if (!firebaseUser || hasSavedOrder.current) return;

      if (cartItems.length === 0 && totalPrice === 0) {
        console.log("Cart is empty, skipping save");
        return;
      }

      if (typeof totalPrice === "undefined" || totalPrice === null) {
        console.error("Invalid totalPrice, skipping save");
        return;
      }

      hasSavedOrder.current = true;

      try {
        const idToken = await firebaseUser.getIdToken(); // 🔐 Retrieve Firebase ID token

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/orders/save-order`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({
              items: cartItems.map((item) => ({
                productId: item._id,
                quantity: item.quantity,
              })),
              totalAmount: totalPrice,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to save order");
        }

        console.log("Order saved successfully");
        clearCart(); // 🧹 Clear cart
      } catch (err) {
        console.error("Error saving order:", err);
      }
    };

    // 🔁 Save when user is authenticated
    if (!loadingAuth && firebaseUser && !hasSavedOrder.current) {
      saveOrder();
    }
  }, [firebaseUser, loadingAuth, cartItems, totalPrice]);

  // ✅ Display completion screen
  return (
    <div className="p-6 max-w-xl mx-auto text-center">
      <h2 className="text-2xl font-bold mb-4 text-green-600">
        ✅ ご注文が完了しました！
      </h2>
      <p className="mb-6">
        ご注文ありがとうございます。商品の発送まで今しばらくお待ちください。
      </p>
      <Link to="/" className="text-blue-600 hover:underline">
        ホームに戻る
      </Link>
    </div>
  );
};

export default OrderComplete;
