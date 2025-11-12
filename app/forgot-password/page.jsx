"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Handle Reset
  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    setLoading(false);

    if (error) toast.error(error.message);
    else toast.success("Password reset link sent to your email!");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4 text-[#142B6F]">
        Forgot Password
      </h1>
      <form
        onSubmit={handleReset}
        className="bg-white p-6 rounded-2xl shadow w-full max-w-sm space-y-4"
      >
        <input
          type="email"
          placeholder="Enter your email address"
          className="w-full p-3 border rounded-md focus:ring-2 focus:ring-[#FFD601] outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#FFD601] text-[#142B6F] p-3 rounded-md font-semibold hover:bg-yellow-400"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}
