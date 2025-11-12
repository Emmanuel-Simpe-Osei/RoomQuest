"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("🔍 Starting auth callback...");

        // Get the hash from URL (Supabase puts tokens here)
        const hash = window.location.hash;
        console.log("URL Hash:", hash);

        if (hash && hash.includes("access_token")) {
          // Extract tokens from hash
          const params = new URLSearchParams(hash.substring(1));
          const access_token = params.get("access_token");
          const refresh_token = params.get("refresh_token");
          const type = params.get("type");

          console.log("Token type:", type);
          console.log("Access token found:", !!access_token);

          if (access_token && type === "recovery") {
            // Set the session with the tokens
            const { error } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });

            if (error) {
              console.error("❌ Session set error:", error);
              toast.error("Invalid or expired reset link");
              router.push("/forgot-password");
              return;
            }

            // Verify session was set successfully
            const {
              data: { session },
              error: sessionError,
            } = await supabase.auth.getSession();

            if (sessionError) {
              console.error("❌ Session get error:", sessionError);
              toast.error("Failed to verify session");
              router.push("/forgot-password");
              return;
            }

            if (session) {
              console.log(
                "✅ Session verified successfully:",
                session.user.email
              );
              toast.success("Reset link verified! Set your new password.");
              router.push("/update-password");
              return;
            }
          }
        }

        // If we reach here, something went wrong
        console.error("❌ No valid token found in URL");
        toast.error("Invalid reset link. Please request a new one.");
        router.push("/forgot-password");
      } catch (err) {
        console.error("❌ Auth callback error:", err);
        toast.error("Something went wrong. Please try again.");
        router.push("/forgot-password");
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-lg">Verifying your reset link...</div>
      <div className="text-sm text-gray-600 mt-2">Please wait</div>
    </div>
  );
}
