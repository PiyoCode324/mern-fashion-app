// src/firebase.js
// Import necessary functionality from the Firebase SDK
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// 📦 Load Firebase configuration from environment variables defined in the .env file
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY, // API key for authentication
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, // Authentication domain
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID, // Firebase project ID
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, // Storage bucket (e.g., for images)
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, // Used for notifications, etc.
  appId: import.meta.env.VITE_FIREBASE_APP_ID, // Firebase App ID
};

// 🔧 Initialize the Firebase app
const app = initializeApp(firebaseConfig);

// 🔐 Get a Firebase Authentication instance to use in other files
export const auth = getAuth(app);

// 🎯 Export the initialized Firebase app if needed
export default app;
