// firebaseAdmin.js

// Firebase Admin SDK を初期化するための設定ファイル。
// Render などのクラウド環境では環境変数に Base64 エンコードされたキーを保存し、
// ローカル環境では JSON ファイルから読み込むようにしている。
// これにより、環境ごとに異なる方法で Firebase Admin を柔軟に利用できるようにしている。

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// ローカル開発環境用のサービスアカウントキーのパス
const serviceAccountPath = path.resolve("./serviceAccountKey.json");

// 環境変数に Base64 形式で格納されているか確認
const base64Key = process.env.SERVICE_ACCOUNT_KEY_BASE64;

let serviceAccount;

if (base64Key) {
  // ✅ 環境変数に Base64 エンコードされたキーがある場合
  try {
    const json = Buffer.from(base64Key, "base64").toString("utf8"); // Base64 → JSON文字列にデコード
    serviceAccount = JSON.parse(json); // JSONオブジェクトに変換
    console.log(
      "Firebase Admin SDK: Initialized using SERVICE_ACCOUNT_KEY_BASE64."
    );
  } catch (error) {
    // デコードやパースに失敗した場合のエラー処理
    console.error(
      "Firebase Admin SDK Initialization Error: Failed to parse SERVICE_ACCOUNT_KEY_BASE64.",
      error
    );
    throw new Error(
      "Failed to initialize Firebase Admin SDK. Please ensure SERVICE_ACCOUNT_KEY_BASE64 is a valid JSON string."
    );
  }
} else if (fs.existsSync(serviceAccountPath)) {
  // ✅ ローカルに serviceAccountKey.json が存在する場合
  serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
  console.log(
    "Firebase Admin SDK: Initialized using serviceAccountKey.json file."
  );
} else {
  // ❌ どちらも存在しない場合はエラーを投げる
  throw new Error(
    "Firebase service account key not found. Set SERVICE_ACCOUNT_KEY_BASE64 as an environment variable or provide ./serviceAccountKey.json."
  );
}

// Firebase Admin アプリがまだ初期化されていない場合にのみ初期化する
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("✅ Firebase Admin SDK initialized successfully.");
}

// 初期化済みの admin インスタンスをエクスポートし、他のモジュールで利用できるようにする
module.exports = admin;
