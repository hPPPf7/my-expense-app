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

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {showBackButton && !isMenuPage && (
          <Link href={`/${mode}/menu`}>
            <Button size="icon" variant="outline">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        )}
        <h1 className="text-xl font-bold">{pageTitle(pathname)}</h1>
      </div>
      <Button
        size="icon"
        variant="outline"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        {theme === "light" ? (
          <Moon className="w-5 h-5" />
        ) : (
          <Sun className="w-5 h-5" />
        )}
      </Button>
    </div>
  );
}
