// src/contexts/CartContext.jsx (修正版)
import { createContext, useContext, useEffect, useState } from "react";

// カート用コンテキストの作成
const CartContext = createContext(null);

// カートコンテキストを簡単に使うためのカスタムフック
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

// CartProvider コンポーネントでアプリ全体をラップ
export const CartProvider = ({ children }) => {
  // カートの初期値はlocalStorageから取得、失敗したら空配列
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Failed to parse cart from localStorage:", error);
      return [];
    }
  });

  // カート内商品の合計金額を計算
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // cartItemsが更新されるたびにlocalStorageに保存
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // 商品をカートに追加（既にあれば数量を増やす）
  const addToCart = (product) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item._id === product._id);
      if (existingItem) {
        // 既にある商品の数量を1増やす
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // 新しい商品は数量1で追加
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };

  // 商品をカートから削除（数量が1なら完全削除、複数なら数量を1減らす）
  const removeFromCart = (productId) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item._id === productId);
      if (!existingItem) return prev;

      if (existingItem.quantity > 1) {
        // 数量を1減らす
        return prev.map((item) =>
          item._id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        // 数量1なら完全に削除
        return prev.filter((item) => item._id !== productId);
      }
    });
  };

  // カートを空にする
  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, clearCart, totalPrice }} // totalPriceもコンテキストで共有
    >
      {children}
    </CartContext.Provider>
  );
};
