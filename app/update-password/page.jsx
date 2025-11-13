"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user has a valid session on page load
    const checkSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        console.log("No session found, waiting for URL tokens...");
        // Wait a bit for URL tokens to be processed
        setTimeout(async () => {
          const {
            data: { session: newSession },
          } = await supabase.auth.getSession();
          if (!newSession) {
            toast.error("Invalid or expired reset link");
            setTimeout(() => router.push("/forgot-password"), 2000);
          }
        }, 1000);
      }
    };

    checkSession();
  }, [router]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      toast.success("✅ Password updated successfully!");

      // Sign out and redirect to login
      await supabase.auth.signOut();
      setTimeout(() => router.push("/login"), 2000);
    } catch (error) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4 text-[#142B6F]">
        Set New Password
      </h1>
      <form
        onSubmit={handleUpdate}
        className="bg-white p-6 rounded-2xl shadow w-full max-w-sm space-y-4"
      >
        <input
          type="password"
          placeholder="Enter new password (min. 6 characters)"
          className="w-full p-3 border rounded-md focus:ring-2 focus:ring-[#FFD601] outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#FFD601] text-[#142B6F] p-3 rounded-md font-semibold hover:bg-yellow-400 disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
