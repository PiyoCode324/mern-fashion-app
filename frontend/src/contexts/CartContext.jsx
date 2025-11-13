// src/contexts/CartContext.jsx (修正版)
import { createContext, useContext, useEffect, useState } from "react";

// 🛒 カートの状態を共有するための Context を作成
const CartContext = createContext(null);

// ✅ カスタムフック：CartContext を簡単に利用できるようにする
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    // CartProvider の内部でのみ利用可能
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

// 🌐 CartProvider コンポーネント：アプリ全体をラップしてカート機能を提供
export const CartProvider = ({ children }) => {
  // カートの初期状態を localStorage から取得（パースに失敗したら空配列）
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Failed to parse cart from localStorage:", error);
      return [];
    }
  });

  // 💰 カート内商品の合計金額を計算
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // 📝 cartItems が更新されるたびに localStorage に保存
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // ➕ 商品をカートに追加（すでに存在する場合は数量を増やす）
  const addToCart = (product) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item._id === product._id);
      if (existingItem) {
        // すでに存在する場合 → 数量を 1 増やす
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // 初めて追加する場合 → 数量を 1 で追加
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };

  // ➖ 商品をカートから削除（数量を減らす or 完全に削除）
  const removeFromCart = (productId) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item._id === productId);
      if (!existingItem) return prev; // 該当商品がない場合はそのまま

      if (existingItem.quantity > 1) {
        // 数量が 2 以上 → 数量を 1 減らす
        return prev.map((item) =>
          item._id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        // 数量が 1 → 商品自体を削除
        return prev.filter((item) => item._id !== productId);
      }
    });
  };

  // ❌ カートを完全に空にする
  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider
      value={{
        cartItems, // カート内の商品一覧
        addToCart, // 商品追加
        removeFromCart, // 商品削除
        clearCart, // カートクリア
        totalPrice, // 合計金額
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
