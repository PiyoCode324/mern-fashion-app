// src/firebase.js
// Firebase SDK から必要な機能をインポート
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// 📦 Firebase の設定情報を .env ファイルの環境変数から読み込む
//   - セキュリティのため、ソースコードに直接キーを書かず .env 経由で管理する
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY, // Firebase の API キー（認証や各種サービス利用に必須）
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, // Firebase 認証で利用するドメイン（ログイン関連で使用）
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID, // Firebase プロジェクト ID（プロジェクト固有の識別子）
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, // Cloud Storage の保存先バケット（画像やファイルを格納）
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, // Firebase Cloud Messaging（通知送信用の識別子）
  appId: import.meta.env.VITE_FIREBASE_APP_ID, // Firebase アプリ ID（アプリを一意に識別する）
};

// 🔧 Firebase アプリを初期化する（ここで設定情報を反映させてアプリ全体で利用可能にする）
const app = initializeApp(firebaseConfig);

// 🔐 Firebase Authentication（認証機能）のインスタンスを取得し、他ファイルから利用できるようにする
export const auth = getAuth(app);

// 🎯 初期化した Firebase アプリ自体も必要に応じてエクスポート
export default app;
