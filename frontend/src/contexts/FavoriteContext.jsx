// src/contexts/FavoriteContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

// ⭐ お気に入り（Favorite）の状態を管理するための Context を作成
// createContext の初期値を null にしておくことで、Provider が設定されていない場合に
// わかりやすいエラーを出せるようにしている
const FavoriteContext = createContext(null);

// ⭐ お気に入り機能を簡単に利用できるようにするカスタムフック
// Context が存在しない場合はエラーを投げ、Provider 内でのみ使えるようにする
export const useFavorite = () => {
  const context = useContext(FavoriteContext);
  if (!context) {
    throw new Error("useFavorite must be used within a FavoriteProvider");
  }
  return context;
};

// ⭐ アプリ全体でお気に入り機能を使えるようにする Provider コンポーネント
export const FavoriteProvider = ({ children }) => {
  // 🔹 初期化時に localStorage からお気に入りリストを復元
  // JSON.parse が失敗した場合はエラーをキャッチして空配列を返す
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem("favorites");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Failed to parse favorites from localStorage:", error);
      return [];
    }
  });

  // 🔹 favorites の内容が変わるたびに localStorage に保存
  useEffect(() => {
    if (favorites) {
      localStorage.setItem("favorites", JSON.stringify(favorites));
    }
  }, [favorites]);

  // 🔹 お気に入りの ON/OFF を切り替える関数
  // すでに存在すれば削除、存在しなければ追加する
  const toggleFavorite = (productId) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId) // すでに登録済みなら削除
        : [...prev, productId] // 未登録なら追加
    );
  };

  // 🔹 商品がお気に入り登録されているかどうか判定する関数
  const isFavorite = (productId) => favorites.includes(productId);

  // 🔹 Provider で値を渡すことで、子コンポーネントは useFavorite から参照できる
  return (
    <FavoriteContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoriteContext.Provider>
  );
};
