import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // 引入 Firestore

const firebaseConfig = {
  apiKey: "AIzaSyDxDq_P-GewfphSZvWAh-MOFqhee5Wc_RE",
  authDomain: "my-expense-app-42fb7.firebaseapp.com",
  projectId: "my-expense-app-42fb7",
  storageBucket: "my-expense-app-42fb7.appspot.com",
  messagingSenderId: "236786057561",
  appId: "1:236786057561:web:c0746109611b1832520c48",
};

// 初始化 Firebase 應用，避免多次初始化
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 初始化 Firebase Auth
export const auth = getAuth(app);

// ✅ 只需這行，初始化 Firestore
const db = getFirestore(app);

// 如果已經匯出了 db，請只保留一次
export { app, db }; // 這裡確保只匯出一次 db
