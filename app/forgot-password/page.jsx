"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  /* -------------------------------------------------------------
     ✅ Handle Password Reset
     Sends reset link via Supabase to the provided email address.
     The redirect URL is dynamic: local (localhost) or production.
  -------------------------------------------------------------- */
  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use NEXT_PUBLIC_SITE_URL in production or fallback to live domain
      const redirectUrl = `${
        process.env.NEXT_PUBLIC_SITE_URL || "https://roomquestaccomodations.com"
      }/update-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      toast.success("✅ Password reset link sent to your email!");
    } catch (err) {
      toast.error(err.message || "Something went wrong. Try again!");
    } finally {
      setLoading(false);
    }
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
          className="w-full bg-[#FFD601] text-[#142B6F] p-3 rounded-md font-semibold hover:bg-yellow-400 transition-colors"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}
