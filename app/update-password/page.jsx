"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const router = useRouter();

  // ✅ Check for valid recovery session on component mount
  useEffect(() => {
    const checkRecoverySession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
          toast.error("Invalid or expired reset link");
          setTimeout(() => router.push("/forgot-password"), 2000);
          return;
        }

        if (!session) {
          toast.error("No valid session found. Please request a new reset link.");
          setTimeout(() => router.push("/forgot-password"), 2000);
          return;
        }

        setIsValidSession(true);
        setSessionChecked(true);
        
      } catch (err) {
        console.error("Error checking session:", err);
        toast.error("Something went wrong");
        setTimeout(() => router.push("/"), 2000);
      }
    };

    checkRecoverySession();
  }, [router]);

  // ✅ Enhanced password update handler
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!isValidSession) {
      toast.error("Invalid session. Please request a new reset link.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ 
        password: password 
      });

      if (error) throw error;

      toast.success("Password updated successfully!");
      
      // Sign out and redirect to login
      await supabase.auth.signOut();
      setTimeout(() => router.push("/login"), 2000);
      
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.message || "Failed to update password");
      
      // If session is invalid, redirect to forgot password
      if (error.message?.includes("session") || error.message?.includes("expired")) {
        setTimeout(() => router.push("/forgot-password"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking session
  if (!sessionChecked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-lg">Verifying reset link...</div>
      </div>
    );
  }

  // Show form only if valid session
  if (!isValidSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-lg text-red-600">Invalid reset link</div>
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
        <div>
          <input
            type="password"
            placeholder="Enter new password"
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-[#FFD601] outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Password must be at least 6 characters long
          </p>
        </div>
        <button
          type="submit"
          disabled={loading || !password}
          className="w-full bg-[#FFD601] text-[#142B6F] p-3 rounded-md font-semibold hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}