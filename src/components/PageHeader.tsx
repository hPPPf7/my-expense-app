"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { pageTitle } from "@/lib/pageTitle";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun, ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  showBackButton?: boolean;
}

export function PageHeader({ showBackButton = true }: PageHeaderProps) {
  const pathname = usePathname();
  const mode = pathname.startsWith("/business") ? "business" : "personal";
  const { theme, setTheme } = useTheme();
  const isMenuPage = pathname.endsWith("/menu");
  const title = pageTitle(pathname) || "未命名頁面";

  return (
    <div className="sticky top-0 z-50 h-16 bg-background border-b shadow-md">
      <div className="flex items-center justify-between h-full px-4 sm:px-6">
        <div className="flex items-center gap-3 overflow-hidden min-h-10">
          {showBackButton && !isMenuPage && (
            <Link href={`/${mode}/menu`}>
              <Button
                size="icon"
                variant="outline"
                className="min-w-10 min-h-10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
          )}
          <h1 className="text-xl font-bold truncate whitespace-nowrap max-w-[180px] leading-none">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* 切換模式按鈕，只在 menu 頁顯示 */}
          {isMenuPage && (
            <Link
              href={`/${mode === "personal" ? "business" : "personal"}/menu`}
            >
              <Button variant="outline" size="sm">
                切換為 {mode === "personal" ? "商業" : "個人"} 模式
              </Button>
            </Link>
          )}

          {/* 顯示切換深色模式按鈕 */}
          <Button
            size="icon"
            variant="outline"
            className="min-w-10 min-h-10"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
