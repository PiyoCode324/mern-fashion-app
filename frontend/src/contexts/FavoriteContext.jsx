import { createContext, useContext, useEffect, useState } from "react";

// Context の作成
const FavoriteContext = createContext(null); // 初期値をnullにして、プロバイダが提供されているかチェックを強化することもできます

// カスタムフックで呼び出しやすくする
export const useFavorite = () => {
  const context = useContext(FavoriteContext);
  if (!context) {
    // FavoriteProviderの外でuseFavoriteが使われた場合の警告
    throw new Error("useFavorite must be used within a FavoriteProvider");
  }
  return context;
};

// プロバイダコンポーネント
export const FavoriteProvider = ({ children }) => {
  // ★ 修正点1: useState の初期化部分で localStorage から安全に復元する
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem("favorites");
      // saved が存在し、かつ有効なJSONであればパース、そうでなければ空配列を返す
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      // JSON.parse() でエラーが発生した場合（不正な形式のデータなど）
      console.error("Failed to parse favorites from localStorage:", error);
      return []; // エラーが発生した場合も安全のために空配列を返す
    }
  });

  // お気に入りの変更があれば localStorage に保存
  useEffect(() => {
    // ★ 修正点2: localStorage に保存する際、必ずJSON文字列に変換する
    // favorites が undefined になることは通常ないが、念のためチェック
    if (favorites) {
      localStorage.setItem("favorites", JSON.stringify(favorites));
    }
  }, [favorites]);

  const toggleFavorite = (productId) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const isFavorite = (productId) => favorites.includes(productId);

  return (
    <FavoriteContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoriteContext.Provider>
  );
};
