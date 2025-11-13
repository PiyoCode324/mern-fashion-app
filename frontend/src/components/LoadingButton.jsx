// src/components/LoadingButton.jsx
import React from "react";

// LoadingButtonコンポーネントはボタンのクリック処理中に
// 「処理中...」表示と操作不可状態を管理するための汎用ボタン
const LoadingButton = ({
  onClick, // ボタンクリック時に実行する関数
  loading, // true の場合、ボタンは「処理中...」表示になりクリック不可
  children, // ボタンの通常表示テキストや要素
  disabled = false, // 外部から明示的に無効化したい場合
  ...props // 追加のボタン属性（type, className など）を渡せる
}) => {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled} // ローディング中または外部で無効化された場合はクリック不可
      className={`bg-blue-600 text-white px-4 py-2 rounded transition-opacity duration-300 ${
        loading || disabled ? "opacity-50 cursor-not-allowed" : "" // 無効時は半透明＆禁止カーソル
      }`}
      {...props} // 追加属性をそのまま button に適用
    >
      {loading ? "処理中..." : children}
      {/* ローディング中は固定テキスト「処理中...」、
          それ以外は通常のボタン表示 */}
    </button>
  );
};

export default LoadingButton;
