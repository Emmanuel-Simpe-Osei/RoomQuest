"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserRole } from "@/lib/getUserRole";

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    async function handleRedirect() {
      const role = await getUserRole();
      if (role === "admin") {
        router.replace("/dashboard/admin");
      } else {
        router.replace("/dashboard/user");
      }
    }
    handleRedirect();
  }, [router]);

  // 🌀 Beautiful centered spinner (no text)
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="relative w-12 h-12">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-[#142B6F] border-t-transparent animate-spin"></div>
        {/* Inner pulse */}
        <div className="absolute inset-2 rounded-full bg-[#FFD601] animate-pulse"></div>
      </div>
    </div>
  );
}
