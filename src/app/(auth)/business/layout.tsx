import { ThemeProvider } from "@/components/ThemeProvider";
import { PageHeader } from "@/components/PageHeader";
import { ReactNode } from "react";

export default function BusinessLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="p-6 space-y-6">
        <PageHeader />
        {children}
      </div>
    </ThemeProvider>
  );
}
