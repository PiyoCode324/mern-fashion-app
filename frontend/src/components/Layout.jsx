// src/components/Layout.jsx
import React from "react";
import Header from "./Header";
import LoadingOverlay from "./LoadingOverlay";
import { useLoading } from "../contexts/LoadingContext";

const Layout = ({ userName, userRole, handleLogout, children }) => {
  const { loading } = useLoading();

  return (
    <div className="min-h-screen w-screen flex flex-col bg-white text-gray-800 dark:bg-gray-900 dark:text-gray-100 relative">
      {loading && <LoadingOverlay />}

      <Header
        userName={userName}
        userRole={userRole}
        handleLogout={handleLogout}
      />

      <main className="flex-grow px-4 py-6 w-full max-w-screen-lg mx-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
