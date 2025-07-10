const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

const serviceAccountPath = process.env.SERVICE_ACCOUNT_KEY_PATH;
const fullPath = path.resolve(serviceAccountPath);
const serviceAccount = JSON.parse(fs.readFileSync(fullPath, "utf8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;
