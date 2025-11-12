"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) toast.error(error.message);
    else toast.success("Password updated successfully!");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4 text-[#142B6F]">
        Update Password
      </h1>
      <form
        onSubmit={handleUpdate}
        className="bg-white p-6 rounded-2xl shadow w-full max-w-sm space-y-4"
      >
        <input
          type="password"
          placeholder="Enter new password"
          className="w-full p-3 border rounded-md focus:ring-2 focus:ring-[#FFD601] outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#FFD601] text-[#142B6F] p-3 rounded-md font-semibold hover:bg-yellow-400"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
