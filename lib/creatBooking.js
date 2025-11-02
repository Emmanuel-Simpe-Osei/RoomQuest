import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

// ✅ Creates a new booking record for the current user
export async function createBooking(roomId) {
  // 1️⃣ Get logged-in user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    toast.error("Please log in to continue.");
    return;
  }

  // 2️⃣ Fetch their WhatsApp number from profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("whatsapp")
    .eq("id", user.id)
    .maybeSingle();

  // 3️⃣ Insert booking
  const { error } = await supabase.from("bookings").insert([
    {
      user_id: user.id,
      room_id: roomId,
      whatsapp: profile?.whatsapp || "",
      status: "pending",
    },
  ]);

  if (error) {
    console.error("Booking insert error:", error.message);
    toast.error("Booking failed!");
  } else {
    toast.success("✅ Room booked successfully!");
  }
}
