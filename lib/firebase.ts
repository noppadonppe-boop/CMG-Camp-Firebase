import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ---------------------------------------------------------------------------
// Firebase project config — replace the placeholder values with your actual
// Firebase project credentials from:
//   Firebase Console → Project Settings → General → Your apps → SDK setup
//
// SECURITY: store these in environment variables for production.
// Create a .env.local file with the keys below (Next.js exposes NEXT_PUBLIC_*
// vars to the browser, which is correct for Firebase client SDKs).
// ---------------------------------------------------------------------------
const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY             ?? "",
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN         ?? "",
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID          ?? "",
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET      ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID              ?? "",
  measurementId:     process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID      ?? "",
};

// Prevent duplicate initialisation in Next.js hot-reload / SSR environments
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db      = getFirestore(app);
export const storage = getStorage(app);
export default app;
