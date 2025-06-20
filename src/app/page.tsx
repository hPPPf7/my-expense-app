// src/app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/lib/firebase"; // 你建立的 firebase.ts

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // ✅ 已登入，導向預設主畫面（可依記錄導向 personal 或 business）
        router.replace("/personal/menu");
      } else {
        // ❌ 未登入，導向登入頁
        router.replace("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return null;
}
