"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ChangePasswordPage() {
  const [password, setPassword] = useState("");

  const handleChange = async () => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) alert(error.message);
    else alert("✅ Password updated successfully!");
  };

  return (
    <div className="min-h-screen bg-[#142B6F] text-white p-6 max-w-lg">
      <h1 className="text-2xl font-bold text-[#FFD601] mb-6">
        Change Password
      </h1>

      <input
        type="password"
        placeholder="New Password"
        className="p-3 rounded-lg bg-[#1A2D7A] border border-white/20 w-full"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleChange}
        className="mt-4 bg-[#FFD601] text-[#142B6F] px-4 py-2 rounded-lg font-semibold w-full"
      >
        Update Password
      </button>
    </div>
  );
}
