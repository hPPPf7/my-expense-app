"use client";

import { use } from "react";
import { ListTodo, FileText, BarChart3, Wallet, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ mode: "personal" | "business" }>;
}

export default function HomeMenuPage({ params }: PageProps) {
  const { mode } = use(params);

  const personalPages = [
    { name: "今日總覽 / 快速記帳", icon: ListTodo, path: "home" },
    { name: "記帳紀錄頁", icon: FileText, path: "record-history" },
    { name: "圖表報表頁", icon: BarChart3, path: "report" },
    { name: "帳戶轉帳頁", icon: Wallet, path: "transfer" },
    { name: "帳戶管理頁", icon: Wallet, path: "accounts" },
    { name: "續費提醒頁", icon: Bell, path: "reminder" },
    { name: "帳戶餘額頁", icon: Wallet, path: "balance" },
  ];

  const businessPages = [
    { name: "今日總覽 / 快速記帳", icon: ListTodo, path: "home" },
    { name: "記帳紀錄頁", icon: FileText, path: "record-history" },
    { name: "圖表報表頁", icon: BarChart3, path: "report" },
    { name: "續費提醒頁", icon: Bell, path: "reminder" },
  ];

  const pages = mode === "personal" ? personalPages : businessPages;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          記帳系統選單（{mode === "personal" ? "個人" : "商業"}模式）
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link href={`/${mode === "personal" ? "business" : "personal"}/menu`}>
            切換為 {mode === "personal" ? "商業" : "個人"} 模式
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {pages.map((page) => {
          const Icon = page.icon;
          const href = `/${mode}/${page.path}`;
          return (
            <Link key={href} href={href} className="block">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center gap-3 p-4">
                  {Icon && <Icon className="w-5 h-5" />}
                  <span className="text-base font-medium">{page.name}</span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
