import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // 引入 Firestore

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// 初始化 Firebase 應用，避免多次初始化
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 初始化 Firebase Auth
export const auth = getAuth(app);

// ✅ 只需這行，初始化 Firestore
const db = getFirestore(app);

// 如果已經匯出了 db，請只保留一次
export { app, db }; // 這裡確保只匯出一次 db
