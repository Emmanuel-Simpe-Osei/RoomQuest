import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req) {
  try {
    const body = await req.json();
    const { reference, room_id, amount, whatsapp } = body;

    if (!reference || !room_id) {
      return NextResponse.json(
        { success: false, message: "Missing reference or room_id" },
        { status: 400 }
      );
    }

    // 🧠 Verify payment with Paystack
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const verifyData = await verifyRes.json();

    if (!verifyData.status || verifyData.data.status !== "success") {
      return NextResponse.json(
        { success: false, message: "Payment verification failed" },
        { status: 400 }
      );
    }

    // 🧾 Extract Paystack details
    const paidAmount = verifyData.data.amount / 100;
    const email = verifyData.data.customer.email || null;

    // 💾 Store booking record
    const booking = {
      room_id,
      status: "paid",
      created_at: new Date().toISOString(),
      payment_reference: reference,
      amount: paidAmount,
      whatsapp,
      email,
    };

    // Optional: if your table includes user_id (for logged in users)
    // const { data: userData } = await supabase
    //   .from("profiles")
    //   .select("id")
    //   .eq("email", email)
    //   .single();
    // if (userData) booking.user_id = userData.id;

    const { data, error } = await supabase.from("bookings").insert([booking]);

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to save booking" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Booking recorded successfully",
      data,
    });
  } catch (err) {
    console.error("Booking route error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
