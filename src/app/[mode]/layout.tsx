// src/app/[mode]/layout.tsx

import { ThemeProvider } from "@/components/ThemeProvider";
import { PageHeader } from "@/components/PageHeader";
import type { ReactNode } from "react";

export default function ModeLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="p-6 space-y-6">
        <PageHeader showBackButton={false} />
        {children}
      </div>
    </ThemeProvider>
  );
}
