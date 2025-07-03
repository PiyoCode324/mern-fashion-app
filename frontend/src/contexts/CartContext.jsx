// src/contexts/CartContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

// Contextの作成
const CartContext = createContext(null);

// カスタムフック
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

// Providerコンポーネント
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Failed to parse cart from localStorage:", error);
      return [];
    }
  });

  // 保存：cartItemsが変わるたびにlocalStorageへ保存
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // 商品をカートに追加（数量管理対応）
  const addToCart = (product) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item._id === product._id);
      if (existingItem) {
        // すでにあれば数量だけ増やす
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // 新規追加は quantity 1 で追加
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };

  // 商品をカートから削除（quantityが1以上なら減らす、1なら削除）
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
        // quantityが1なら完全に削除
        return prev.filter((item) => item._id !== productId);
      }
    });
  };

  // カートを空にする
  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
