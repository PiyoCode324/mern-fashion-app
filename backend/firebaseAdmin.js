// firebaseAdmin.js

// Firebase Admin SDKの初期化ファイルです。
// Renderなどのクラウド環境用にBase64でサービスアカウントキーを環境変数から読み込み、
// ローカル開発時はJSONファイルから読み込みます。
// これによりどちらの環境でも共通のコードでFirebase管理者機能を使えます。

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// ローカル開発用のサービスアカウントJSONファイルパス
const serviceAccountPath = path.resolve("./serviceAccountKey.json");

// 環境変数にBase64形式のサービスアカウントキーがあるかチェック
const base64Key = process.env.SERVICE_ACCOUNT_KEY_BASE64;

let serviceAccount;

if (base64Key) {
  // Base64の環境変数があればデコードしてJSONとしてパース
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
  // ファイルが存在する場合はローカルファイルから読み込み（ローカル開発用）
  serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
  console.log(
    "Firebase Admin SDK: Initializing from serviceAccountKey.json file."
  );
} else {
  // どちらも無い場合は初期化できずエラーを投げる
  throw new Error(
    "Firebase サービスアカウントキーが見つかりません。環境変数 SERVICE_ACCOUNT_KEY_BASE64 を設定するか、./serviceAccountKey.json を配置してください。"
  );
}

// 既に初期化済みのappがなければ初期化する
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("✅ Firebase Admin SDK initialized successfully.");
}

module.exports = admin; // 初期化済みのadminインスタンスを他モジュールで使えるようにエクスポート
