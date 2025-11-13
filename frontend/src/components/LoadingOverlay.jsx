// src/components/LoadingOverlay.jsx
import React from "react";

// LoadingOverlayコンポーネントは、画面全体に
// 半透明のオーバーレイを表示してローディング中を示す
const LoadingOverlay = () => {
  return (
    <div
      className="fixed inset-0 z-50 bg-white bg-opacity-70 flex items-center justify-center"
      // fixed & inset-0 で画面全体に表示
      // z-50 で他の要素より上に重ねる
      // bg-opacity-70 で半透明の白背景
      // flex + items-center + justify-center で中央にスピナー配置
    >
      <div
        className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
        // w-12 h-12: 正方形のスピナーサイズ
        // border-4: 太めのボーダー
        // border-blue-500: ボーダー色
        // border-t-transparent: 上の部分を透明にして回転でスピナーに見せる
        // rounded-full: 円形にする
        // animate-spin: Tailwindのクラスで回転アニメーション
      />
    </div>
  );
};

export default LoadingOverlay;
