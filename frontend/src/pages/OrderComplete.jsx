// src/pages/OrderComplete.jsx
import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom"; // ページ遷移用リンク
import { useCart } from "../contexts/CartContext"; // カート情報取得用
import { useAuth } from "../contexts/AuthContext"; // Firebase 認証情報取得用

const OrderComplete = () => {
  // カート情報の取得
  const { clearCart, cartItems, totalPrice } = useCart(); // 🛒 カートの中身・合計金額・クリア関数
  const { firebaseUser, loadingAuth } = useAuth(); // 🔐 Firebase認証ユーザー情報・認証ロード状態

  // 重複保存防止フラグ
  const hasSavedOrder = useRef(false); // ✅ useRefでコンポーネント再レンダリング時も保持

  // 🔽 注文情報保存処理
  useEffect(() => {
    const saveOrder = async () => {
      // ユーザー未認証またはすでに保存済みなら処理中断
      if (!firebaseUser || hasSavedOrder.current) return;

      // カートが空の場合も保存不要
      if (cartItems.length === 0 && totalPrice === 0) {
        console.log("Cart is empty, skipping save");
        return;
      }

      // 合計金額が不正の場合も保存中止
      if (typeof totalPrice === "undefined" || totalPrice === null) {
        console.error("Invalid totalPrice, skipping save");
        return;
      }

      hasSavedOrder.current = true; // 重複防止フラグをセット

      try {
        // 🔐 Firebase IDトークン取得
        const idToken = await firebaseUser.getIdToken();

        // 注文保存 API に POST リクエスト
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/orders/save-order`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${idToken}`, // 認証ヘッダー
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

        // レスポンスエラーチェック
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to save order");
        }

        console.log("Order saved successfully");
        clearCart(); // 🧹 カートクリア
      } catch (err) {
        console.error("Error saving order:", err);
      }
    };

    // 🔁 ユーザー認証完了時に保存処理実行
    if (!loadingAuth && firebaseUser && !hasSavedOrder.current) {
      saveOrder();
    }
  }, [firebaseUser, loadingAuth, cartItems, totalPrice]);

  // ✅ 注文完了画面表示
  return (
    <div className="p-6 max-w-xl mx-auto text-center">
      <h2 className="text-2xl font-bold mb-4 text-green-600">
        ✅ ご注文が完了しました！
      </h2>
      <p className="mb-6">
        ご注文ありがとうございます。商品の発送まで今しばらくお待ちください。
      </p>
      {/* ホームへ戻るリンク */}
      <Link to="/" className="text-blue-600 hover:underline">
        ホームに戻る
      </Link>
    </div>
  );
};

export default OrderComplete;
