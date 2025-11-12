"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleTokenAndSession = async () => {
      try {
        console.log("🔍 Checking for tokens...");

        // Check for tokens in URL parameters (not hash)
        const access_token = searchParams.get("access_token");
        const refresh_token = searchParams.get("refresh_token");
        const type = searchParams.get("type");

        console.log("URL tokens:", { access_token: !!access_token, type });

        // If we have recovery tokens in URL, set the session
        if (access_token && type === "recovery") {
          console.log("🔄 Setting session from URL tokens...");

          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (error) {
            console.error("❌ Session set error:", error);
            toast.error("Invalid or expired reset link");
            setTimeout(() => router.push("/forgot-password"), 2000);
            return;
          }
        }

        // Check if we have a valid session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        console.log("Session check:", { session: !!session, error });

        if (error || !session) {
          console.error("❌ No valid session:", error);
          toast.error(
            "No valid session found. Please request a new reset link."
          );
          setTimeout(() => router.push("/forgot-password"), 2000);
          return;
        }

        console.log("✅ Valid session found for:", session.user.email);
        setHasValidSession(true);
      } catch (err) {
        console.error("❌ Session setup error:", err);
        toast.error("Something went wrong");
        router.push("/forgot-password");
      } finally {
        setCheckingSession(false);
      }
    };

    handleTokenAndSession();
  }, [router, searchParams]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!hasValidSession) {
      toast.error("Please request a new reset link");
      return;
    }

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

      toast.success("Password updated successfully!");

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

  if (checkingSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-lg">Setting up your session...</div>
        <div className="text-sm text-gray-600 mt-2">Please wait</div>
      </div>
    );
  }

  if (!hasValidSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-lg text-red-600">
          Redirecting to forgot password...
        </div>
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
