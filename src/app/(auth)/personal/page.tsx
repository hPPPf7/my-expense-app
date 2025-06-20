// src/app/(auth)/personal/page.tsx
"use client";

import { redirect } from "next/navigation";

export default function PersonalRedirectPage() {
  redirect("/personal/menu");
}
