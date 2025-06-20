"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { app } from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      router.replace("/personal/menu");
    } catch (err) {
      console.error("登入失敗", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/personal/menu");
      }
    });
    return () => unsubscribe();
  }, [auth, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-900">
      <Card className="w-[360px] shadow-lg border-zinc-700 bg-zinc-800">
        <CardContent className="p-6 space-y-6 text-center">
          <h2 className="text-xl font-bold text-white">登入您的帳號</h2>
          <Button onClick={handleLogin} className="w-full">
            使用 Google 登入
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
