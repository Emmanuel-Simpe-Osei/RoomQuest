import { supabase } from "./supabaseClient";

export async function getUserRole() {
  // ✅ Always use getSession() in the App Router
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    console.error("❌ Session fetch error:", sessionError);
    return null;
  }

  const user = session?.user;

  if (!user) {
    console.warn("⚠️ No logged-in user");
    return null;
  }

  // ✅ Fetch the role from the profiles table
  const { data, error: roleError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (roleError) {
    console.error("❌ Error fetching role from profiles:", roleError);
    return null;
  }

  return data?.role || "user";
}
