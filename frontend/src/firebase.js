// src/firebase.js
// Firebase SDK から必要な機能をインポート
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// 📦 .env ファイルに定義された環境変数から Firebase の設定を読み込み
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY, // 認証キー
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, // 認証ドメイン
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID, // プロジェクトID
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, // ストレージバケット（画像などの保存用）
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, // 通知などで使用
  appId: import.meta.env.VITE_FIREBASE_APP_ID, // アプリID
};

// 🔧 Firebase アプリの初期化
const app = initializeApp(firebaseConfig);

// 🔐 Firebase Authentication のインスタンスを取得して他ファイルで使えるように
export const auth = getAuth(app);

// 🎯 初期化した Firebase アプリも必要があればエクスポート
export default app;
