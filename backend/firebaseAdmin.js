// firebaseAdmin.js

// This file initializes the Firebase Admin SDK.
// In cloud environments (e.g., Render), the service account key is loaded from an environment variable in Base64 format.
// In local development, the key is read from a JSON file.
// This setup allows Firebase Admin functions to work seamlessly across both environments.

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Path to the service account key JSON file for local development
const serviceAccountPath = path.resolve("./serviceAccountKey.json");

// Check if the environment variable contains a Base64-encoded service account key
const base64Key = process.env.SERVICE_ACCOUNT_KEY_BASE64;

let serviceAccount;

if (base64Key) {
  // If the Base64-encoded key exists, decode and parse it as JSON
  try {
    const json = Buffer.from(base64Key, "base64").toString("utf8");
    serviceAccount = JSON.parse(json);
    console.log(
      "Firebase Admin SDK: Initialized using SERVICE_ACCOUNT_KEY_BASE64."
    );
  } catch (error) {
    console.error(
      "Firebase Admin SDK Initialization Error: Failed to parse SERVICE_ACCOUNT_KEY_BASE64.",
      error
    );
    throw new Error(
      "Failed to initialize Firebase Admin SDK. Please ensure SERVICE_ACCOUNT_KEY_BASE64 is a valid JSON string."
    );
  }
} else if (fs.existsSync(serviceAccountPath)) {
  // If the key file exists locally, read and parse it
  serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
  console.log(
    "Firebase Admin SDK: Initialized using serviceAccountKey.json file."
  );
} else {
  // If neither source is available, throw an error
  throw new Error(
    "Firebase service account key not found. Set SERVICE_ACCOUNT_KEY_BASE64 as an environment variable or provide ./serviceAccountKey.json."
  );
}

// Initialize the Firebase Admin app if it hasn’t been initialized yet
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("✅ Firebase Admin SDK initialized successfully.");
}

module.exports = admin; // Export the initialized admin instance for use in other modules
