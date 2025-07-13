// src/components/Layout.jsx
import React from "react";
import Header from "./Header"; // ヘッダーコンポーネントをインポート（後で切り出す）

const Layout = ({ userName, userRole, handleLogout, children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      {/* ヘッダーにユーザー名、ロール、ログアウト関数を渡す */}
      <Header
        userName={userName}
        userRole={userRole} // 👈 管理者用の表示制御などに使用
        handleLogout={handleLogout}
      />

      {/* メインコンテンツ領域。子コンポーネントがここに挿入される */}
      <main className="flex-grow px-4 py-6 w-full max-w-screen-lg mx-auto">
        {children}
      </main>

      {/* 
        将来的にフッターを追加する場合のテンプレート
        <footer className="py-4 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} MERN Fashion Store
        </footer> 
      */}
    </div>
  );
};

export default Layout;
