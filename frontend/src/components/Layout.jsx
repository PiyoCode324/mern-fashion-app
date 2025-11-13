// src/components/Layout.jsx
import React from "react";
import Header from "./Header";
import LoadingOverlay from "./LoadingOverlay";
import { useLoading } from "../contexts/LoadingContext";

// Layoutコンポーネントはアプリ全体の共通レイアウトを提供する
// ヘッダー、メインコンテンツ、ローディングオーバーレイなどを統合
const Layout = ({ userName, userRole, handleLogout, children }) => {
  // グローバルなローディング状態を取得
  const { loading } = useLoading();

  return (
    <div className="min-h-screen w-screen flex flex-col bg-white text-gray-800 dark:bg-gray-900 dark:text-gray-100 relative">
      {/* ローディング中はオーバーレイ表示 */}
      {loading && <LoadingOverlay />}

      {/* ヘッダー */}
      <Header
        userName={userName}
        userRole={userRole}
        handleLogout={handleLogout}
      />

      {/* メインコンテンツ領域 */}
      <main className="flex-grow px-4 py-6 w-full max-w-screen-lg mx-auto">
        {children} {/* 各ページ固有の内容を表示 */}
      </main>
    </div>
  );
};

export default Layout;
