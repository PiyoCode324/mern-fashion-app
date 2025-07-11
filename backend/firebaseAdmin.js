// firebaseAdmin.js
const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// ★Render環境変数を優先するロジックを組み込む★
let serviceAccount;
const serviceAccountPath = path.resolve("./serviceAccountKey.json"); // ローカル開発用パス

// 環境変数 SERVICE_ACCOUNT_KEY_BASE64 が設定されているかチェック
const base64Key = process.env.SERVICE_ACCOUNT_KEY_BASE64;

if (base64Key) {
  // 環境変数が存在する場合は、Base64デコードして使用
  try {
    const json = Buffer.from(base64Key, "base64").toString("utf8");
    serviceAccount = JSON.parse(json);
    console.log(
      "Firebase Admin SDK: Initializing from SERVICE_ACCOUNT_KEY_BASE64."
    );
  } catch (error) {
    console.error(
      "Firebase Admin SDK 初期化エラー: SERVICE_ACCOUNT_KEY_BASE64 のパースに失敗しました。",
      error
    );
    throw new Error(
      "Firebase Admin SDK の初期化に失敗しました。SERVICE_ACCOUNT_KEY_BASE64 が正しいJSON形式か確認してください。"
    );
  }
} else if (fs.existsSync(serviceAccountPath)) {
  // 環境変数がなく、かつファイルが存在する場合は、ファイルから読み込む (主にローカル開発)
  serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
  console.log(
    "Firebase Admin SDK: Initializing from serviceAccountKey.json file."
  );
} else {
  // どちらも見つからない場合はエラー
  throw new Error(
    "Firebase サービスアカウントキーが見つかりません。環境変数 SERVICE_ACCOUNT_KEY_BASE64 を設定するか、./serviceAccountKey.json を配置してください。"
  );
}

// Firebase Admin SDK の初期化（既に初期化されていなければ）
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("✅ Firebase Admin SDK initialized successfully.");
}

module.exports = admin; // 初期化済み admin オブジェクトをエクスポート
