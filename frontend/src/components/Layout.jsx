// src/components/Layout.jsx
import React from "react";
import Header from "./Header"; // Import the Header component

const Layout = ({ userName, userRole, handleLogout, children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      {/* Pass userName, userRole, and logout handler to Header */}
      <Header
        userName={userName}
        userRole={userRole} // 👈 Used to control access to admin-only features
        handleLogout={handleLogout}
      />

      {/* Main content area – renders child components */}
      <main className="flex-grow px-4 py-6 w-full max-w-screen-lg mx-auto">
        {children}
      </main>

      {/* 
        Optional footer template – can be enabled later
        <footer className="py-4 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} MERN Fashion Store
        </footer> 
      */}
    </div>
  );
};

export default Layout;
