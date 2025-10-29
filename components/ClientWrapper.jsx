"use client";

import { usePathname } from "next/navigation";
import ClientLayout from "@/components/ClientLayout";

export default function ClientWrapper({ children }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  // ✅ Show public layout only on non-dashboard routes
  return !isDashboard ? <ClientLayout>{children}</ClientLayout> : children;
}
