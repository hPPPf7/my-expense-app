// src/app/(auth)/business/page.tsx
"use client";

import { redirect } from "next/navigation";

export default function BusinessRedirectPage() {
  redirect("/business/menu");
}
