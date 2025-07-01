"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/lib/firebase";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const auth = getAuth(app);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.replace("/login"); // ❌ 未登入 → 導向 login
      }
      setLoading(false); // ✅ 結束 loading
    });

    return () => unsubscribe();
  }, [auth, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-900 text-white">
        載入中...
      </div>
    );
  }

  return <>{children}</>;
}
