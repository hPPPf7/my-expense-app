// src/app/(auth)/[mode]/menu/page.tsx
"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { ListTodo, FileText, BarChart3, Wallet, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RecordHistoryPanel } from "@/components/RecordHistoryPanel";
import { HomeOverviewPanel } from "@/components/HomeOverviewPanel";

interface PageProps {
  params: Promise<{ mode: "personal" | "business" }>;
}

export default function HomeMenuPage({ params }: PageProps) {
  const { mode } = use(params);

  const featurePages =
    mode === "personal"
      ? [
          { name: "帳戶轉帳頁", icon: Wallet, path: "transfer" },
          { name: "帳戶管理頁", icon: Wallet, path: "accounts" },
          { name: "續費提醒頁", icon: Bell, path: "reminder" },
        ]
      : [
          { name: "續費提醒頁", icon: Bell, path: "reminder" },
          { name: "圖表報表頁", icon: BarChart3, path: "report" },
        ];

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* 左邊主內容（含今日總覽、記帳紀錄） */}
        <div className="xl:col-span-2 space-y-6">
          <HomeOverviewPanel mode={mode} />
          <RecordHistoryPanel mode={mode} />
        </div>

        {/* 右邊功能卡片 */}
        <div className="space-y-4">
          <div className="text-lg font-semibold">功能選單</div>
          <div className="space-y-3">
            {featurePages.map((page) => {
              const Icon = page.icon;
              const href = `/${mode}/${page.path}`;
              return (
                <Link key={href} href={href}>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 text-left px-4 py-3 rounded-xl"
                  >
                    {Icon && <Icon className="w-5 h-5" />}
                    <span className="font-medium">{page.name}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
