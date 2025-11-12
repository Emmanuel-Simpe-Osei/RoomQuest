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
        // Get the URL hash parameters (Supabase auth tokens are in the hash)
        const { hash } = window.location;

        if (hash && hash.includes("access_token")) {
          // If we have token in URL, set the session
          const { error } = await supabase.auth.setSession({
            access_token: new URLSearchParams(hash.substring(1)).get(
              "access_token"
            ),
            refresh_token: new URLSearchParams(hash.substring(1)).get(
              "refresh_token"
            ),
          });

          if (error) throw error;
        }

        // Check if we have a valid session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session) {
          toast.error("Invalid or expired reset link");
          router.push("/forgot-password");
          return;
        }

        // Success! Redirect to update password
        toast.success("Reset link verified! Set your new password.");
        router.push("/update-password");
      } catch (err) {
        console.error("Auth callback error:", err);
        toast.error("Invalid or expired reset link");
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
