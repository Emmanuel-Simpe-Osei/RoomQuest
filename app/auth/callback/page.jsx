"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the token from URL parameters (Supabase puts it in hash)
        const hash = window.location.hash;

        if (hash && hash.includes("access_token")) {
          // Extract tokens from hash
          const params = new URLSearchParams(hash.substring(1));
          const access_token = params.get("access_token");
          const refresh_token = params.get("refresh_token");
          const token_type = params.get("token_type");
          const expires_in = params.get("expires_in");

          if (access_token) {
            // Set the session with the tokens
            const { error } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });

            if (error) {
              console.error("Session set error:", error);
              toast.error("Invalid or expired reset link");
              router.push("/forgot-password");
              return;
            }

            // Verify session was set
            const {
              data: { session },
            } = await supabase.auth.getSession();

            if (session) {
              toast.success("Reset link verified! Set your new password.");
              router.push("/update-password");
              return;
            }
          }
        }

        // If no token found or session not set
        toast.error("Invalid reset link. Please request a new one.");
        router.push("/forgot-password");
      } catch (err) {
        console.error("Auth callback error:", err);
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
