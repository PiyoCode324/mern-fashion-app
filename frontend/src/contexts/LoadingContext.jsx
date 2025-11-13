// src/contexts/LoadingContext.jsx
import React, { createContext, useContext, useState } from "react";

// ⭐ ローディング状態を管理する Context を作成
// デフォルト値は設定していない（undefined）ため、Provider 外で使うと undefined が返る
const LoadingContext = createContext();

// ⭐ アプリ全体で「読み込み中かどうか」の状態を共有するための Provider コンポーネント
export const LoadingProvider = ({ children }) => {
  // 🔹 loading: 現在ローディング中かどうかの状態 (true / false)
  // 🔹 setLoading: loading 状態を変更する関数
  const [loading, setLoading] = useState(false);

  return (
    // Context を提供する。子コンポーネントは useLoading から利用可能
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

// ⭐ useLoading フック
// コンポーネントから簡単に loading 状態と setLoading を利用できるようにする
export const useLoading = () => useContext(LoadingContext);
