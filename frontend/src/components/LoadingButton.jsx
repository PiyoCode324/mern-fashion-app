// src/components/LoadingButton.jsx
import React from "react";

const LoadingButton = ({
  onClick,
  loading,
  children,
  disabled = false,
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`bg-blue-600 text-white px-4 py-2 rounded transition-opacity duration-300 ${
        loading || disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      {...props}
    >
      {loading ? "処理中..." : children}
    </button>
  );
};

export default LoadingButton;
