"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("🔄 Initializing auth...");

        // Check if we already have a session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          console.log("✅ Already have session");
          setIsReady(true);
          return;
        }

        // Try to get tokens from URL hash (most common)
        const hash = window.location.hash;
        if (hash && hash.includes("access_token")) {
          console.log("🔑 Found tokens in hash");
          const params = new URLSearchParams(hash.substring(1));
          const access_token = params.get("access_token");
          const refresh_token = params.get("refresh_token");
          const type = params.get("type");

          if (access_token && type === "recovery") {
            const { error } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });

            if (error) throw error;

            console.log("✅ Session set from hash");
            setIsReady(true);
            return;
          }
        }

        // If no tokens found, show error
        console.error("❌ No valid tokens found");
        toast.error("Invalid or expired reset link. Please request a new one.");
        setTimeout(() => router.push("/forgot-password"), 3000);
      } catch (error) {
        console.error("❌ Auth initialization error:", error);
        toast.error("Invalid reset link. Please request a new one.");
        setTimeout(() => router.push("/forgot-password"), 3000);
      }
    };

    initializeAuth();
  }, [router]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

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
      console.error("Update error:", error);
      toast.error(error.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-lg">Verifying your reset link...</div>
        <div className="text-sm text-gray-600 mt-2">Please wait</div>
      </div>
    );
  }

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
          disabled={loading || password.length < 6}
          className="w-full bg-[#FFD601] text-[#142B6F] p-3 rounded-md font-semibold hover:bg-yellow-400 disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
