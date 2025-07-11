// src/components/Layout.jsx
import React from "react";
import Header from "./Header"; // 後ほど切り出す Header を読み込み

const Layout = ({ userName, userRole, handleLogout, children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      <Header
        userName={userName}
        userRole={userRole} // 👈 これが必要です！
        handleLogout={handleLogout}
      />

      <main className="flex-grow px-4 py-6 w-full max-w-screen-lg mx-auto">
        {children}
      </main>

      {/* 将来的にフッターを入れたい場合はここ */}
      {/* <footer className="py-4 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} MERN Fashion Store
      </footer> */}
    </div>
  );
};

export default Layout;
