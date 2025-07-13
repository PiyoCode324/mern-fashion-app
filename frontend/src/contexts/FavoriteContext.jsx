// src/contexts/FavoriteContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

// Context の作成
const FavoriteContext = createContext(null); // nullにしてProvider未使用時の警告を強化

// カスタムフックで簡単に呼び出し可能に
export const useFavorite = () => {
  const context = useContext(FavoriteContext);
  if (!context) {
    throw new Error("useFavorite must be used within a FavoriteProvider");
  }
  return context;
};

// FavoriteProviderコンポーネント
export const FavoriteProvider = ({ children }) => {
  // localStorageからお気に入りリストを安全に復元
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem("favorites");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Failed to parse favorites from localStorage:", error);
      return [];
    }
  });

  // favoritesが変わったらlocalStorageに保存
  useEffect(() => {
    if (favorites) {
      localStorage.setItem("favorites", JSON.stringify(favorites));
    }
  }, [favorites]);

  // productIdのトグル処理（お気に入りの追加・削除）
  const toggleFavorite = (productId) => {
    setFavorites(
      (prev) =>
        prev.includes(productId)
          ? prev.filter((id) => id !== productId) // すでにあれば削除
          : [...prev, productId] // なければ追加
    );
  };

  // 指定IDがお気に入りに含まれるか判定
  const isFavorite = (productId) => favorites.includes(productId);

  return (
    <FavoriteContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoriteContext.Provider>
  );
};
