import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  const { user_id } = await req.json();

  // ✅ Server-side Supabase client using SERVICE ROLE
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Delete from auth
  const { error } = await supabase.auth.admin.deleteUser(user_id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }

  // Also delete profile row (optional but clean)
  await supabase.from("profiles").delete().eq("id", user_id);

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
