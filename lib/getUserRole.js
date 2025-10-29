import { supabase } from "./supabaseClient";

export async function getUserRole() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("❌ Error fetching user:", userError.message);
    return null;
  }

  if (!user) {
    console.warn("⚠️ No logged-in user found");
    return null;
  }

  const { data, error, status } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle(); // ✅ safer than .single() — avoids false errors

  // ✅ Fix: Supabase sometimes returns {} instead of null for "error"
  if (error && Object.keys(error).length > 0 && status !== 406) {
    console.error("❌ Error fetching role:", error);
    return null;
  }

  if (!data) {
    console.warn("⚠️ No role found, defaulting to user");
    return "user";
  }

  return data.role || "user";
}
