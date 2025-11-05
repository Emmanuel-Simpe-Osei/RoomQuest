"use client";
import { supabase } from "@/lib/supabaseClient";
import { useEffect } from "react";

export default function Debug() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      console.log("SESSION USER ID:", data?.session?.user?.id);
    });
  }, []);

  return <div className="p-6 text-center text-lg">Check the Console 👇</div>;
}
