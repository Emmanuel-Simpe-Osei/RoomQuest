"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();

  // ✅ Enhanced session check
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("🔍 Checking session in update password...");

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        console.log("Session data:", { session, error });

        if (error) {
          console.error("❌ Session error:", error);
          toast.error("Session error. Please request a new reset link.");
          setTimeout(() => router.push("/forgot-password"), 2000);
          return;
        }

        if (!session) {
          console.error("❌ No session found");
          toast.error(
            "No valid session found. Please request a new reset link."
          );
          setTimeout(() => router.push("/forgot-password"), 2000);
          return;
        }

        console.log("✅ Valid session found for user:", session.user.email);
        setHasValidSession(true);
        setUserEmail(session.user.email);
      } catch (err) {
        console.error("❌ Session check error:", err);
        toast.error("Something went wrong");
        router.push("/forgot-password");
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [router]);

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
      console.log("🔄 Updating password for:", userEmail);

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        console.error("❌ Update error:", error);
        throw error;
      }

      console.log("✅ Password updated successfully");
      toast.success("Password updated successfully!");

      // Sign out and redirect to login
      await supabase.auth.signOut();
      setTimeout(() => router.push("/login"), 2000);
    } catch (error) {
      console.error("❌ Update error:", error);

      if (
        error.message?.includes("session") ||
        error.message?.includes("auth")
      ) {
        toast.error("Session expired. Please request a new reset link.");
        router.push("/forgot-password");
      } else {
        toast.error(error.message || "Failed to update password");
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-lg">Checking your session...</div>
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
      <h1 className="text-2xl font-bold mb-2 text-[#142B6F]">
        Set New Password
      </h1>
      <p className="text-gray-600 mb-4">for {userEmail}</p>

      <form
        onSubmit={handleUpdate}
        className="bg-white p-6 rounded-2xl shadow w-full max-w-sm space-y-4"
      >
        <div>
          <input
            type="password"
            placeholder="Enter new password (min. 6 characters)"
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-[#FFD601] outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={loading || password.length < 6}
          className="w-full bg-[#FFD601] text-[#142B6F] p-3 rounded-md font-semibold hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Updating Password..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
