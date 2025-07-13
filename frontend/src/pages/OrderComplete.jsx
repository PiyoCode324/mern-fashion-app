// src/pages/OrderComplete.jsx
import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";

const OrderComplete = () => {
  const { clearCart, cartItems, totalPrice } = useCart(); // 🛒 カート情報
  const { firebaseUser, loadingAuth } = useAuth(); // 🔐 Firebase認証情報

  const hasSavedOrder = useRef(false); // ✅ 二重保存を防ぐフラグ

  // 🔽 注文情報の保存処理
  useEffect(() => {
    const saveOrder = async () => {
      if (!firebaseUser || hasSavedOrder.current) return;

      if (cartItems.length === 0 && totalPrice === 0) {
        console.log("カートが空のため保存スキップ");
        return;
      }

      if (typeof totalPrice === "undefined" || totalPrice === null) {
        console.error("totalPriceが不正のため中止");
        return;
      }

      hasSavedOrder.current = true;

      try {
        const idToken = await firebaseUser.getIdToken(); // 🔐 Firebaseトークン取得

        const response = await fetch("/api/orders/save-order", {
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
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "注文保存に失敗しました");
        }

        console.log("注文保存成功");
        clearCart(); // 🧹 カートを空にする
      } catch (err) {
        console.error("注文保存中エラー:", err);
      }
    };

    // 🔁 ログイン状態の変化に応じて保存実行
    if (!loadingAuth && firebaseUser && !hasSavedOrder.current) {
      saveOrder();
    }
  }, [firebaseUser, loadingAuth, cartItems, totalPrice]);

  // ✅ 完了画面表示
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
