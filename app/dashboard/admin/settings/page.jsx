"use client";

import Link from "next/link";
import { Settings, User2, Lock } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="min-h-screen bg-[#142B6F] text-white p-6">
      <h1 className="text-3xl font-bold text-[#FFD601] mb-6 flex items-center gap-2">
        <Settings size={26} /> Admin Settings
      </h1>

      <div className="space-y-4 max-w-md">
        <Link
          href="/dashboard/admin/settings/profile"
          className="block bg-[#1A2D7A] border border-white/20 p-4 rounded-xl hover:bg-[#203785] transition flex items-center gap-3"
        >
          <User2 size={20} className="text-[#FFD601]" />
          <span className="font-semibold">Update Profile Information</span>
        </Link>

        <Link
          href="/dashboard/admin/settings/change-password"
          className="block bg-[#1A2D7A] border border-white/20 p-4 rounded-xl hover:bg-[#203785] transition flex items-center gap-3"
        >
          <Lock size={20} className="text-[#FFD601]" />
          <span className="font-semibold">Change Password</span>
        </Link>
      </div>
    </div>
  );
}
