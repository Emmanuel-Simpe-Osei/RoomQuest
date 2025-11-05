"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import {
  Loader2,
  MapPin,
  User2,
  CreditCard,
  MessageCircle,
} from "lucide-react";

const NAVY = "#142B6F";
const GOLD = "#FFD601";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllBookings = async () => {
      try {
        // ✅ Fetch Room Bookings
        const { data: roomBookings, error: roomError } = await supabase
          .from("bookings")
          .select(
            `
            id,
            created_at,
            whatsapp,
            status,
            rooms(title, location, booking_price, images),
            profiles(full_name, email, phone)
          `
          )
          .order("created_at", { ascending: false });

        if (roomError) throw roomError;

        // ✅ Fetch Hostel Bookings
        const { data: hostelBookings, error: hostelError } = await supabase
          .from("hostel_bookings")
          .select(
            `
            id,
            created_at,
            whatsapp,
            status,
            hostels(title, location, booking_fee, images),
            profiles(full_name, email, phone)
          `
          )
          .order("created_at", { ascending: false });

        if (hostelError) throw hostelError;

        // ✅ Merge both bookings with type labels
        const combined = [
          ...(roomBookings?.map((b) => ({
            ...b,
            type: "room",
            title: b.rooms?.title,
            location: b.rooms?.location,
            price: b.rooms?.booking_price,
            images: b.rooms?.images,
          })) || []),
          ...(hostelBookings?.map((b) => ({
            ...b,
            type: "hostel",
            title: b.hostels?.title,
            location: b.hostels?.location,
            price: b.hostels?.booking_fee,
            images: b.hostels?.images,
          })) || []),
        ];

        setBookings(combined);
      } catch (err) {
        console.error("Error fetching all bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllBookings();
  }, []);

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.price || 0), 0);

  const handleContactUser = (booking) => {
    const phone = booking.whatsapp?.replace(/[^0-9]/g, "");
    if (!phone) return alert("No WhatsApp number provided.");

    const message = `👋 Hello ${
      booking.profiles?.full_name || "there"
    }, this is RoomQuest Admin.

We noticed your booking for:
🏠 *${booking.title || "Property"}*
📍 Location: ${booking.location || "N/A"}
💰 Booking Fee: ₵${booking.price || "—"}

Please confirm when you’d like to inspect the property or receive more details.`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0E1F52]">
        <Loader2
          size={38}
          className="text-[#FFD601] animate-spin"
          strokeWidth={2.5}
        />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0E1F52] text-white p-6 sm:p-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#FFD601] mb-1">
            All Bookings Overview
          </h1>
          <p className="text-gray-300 text-sm">
            Manage all Room & Hostel bookings
          </p>
        </div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 250, damping: 20 }}
          className="mt-4 sm:mt-0 bg-[#FFD601]/10 border border-[#FFD601]/40 rounded-xl shadow-md px-6 py-4 flex items-center gap-3 text-white"
        >
          <CreditCard size={24} className="text-[#FFD601]" />
          <div>
            <p className="text-xs uppercase text-[#FFD601]/90 font-semibold">
              Total Booking Revenue
            </p>
            <p className="text-xl font-bold text-white">
              ₵{totalRevenue.toLocaleString()}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Table Section */}
      {bookings.length === 0 ? (
        <div className="text-center text-gray-300 py-20 text-lg">
          No bookings found yet.
        </div>
      ) : (
        <div className="overflow-x-auto bg-[#132863]/80 backdrop-blur-sm shadow-xl rounded-2xl border border-[#FFD601]/20">
          <table className="min-w-full text-sm text-gray-100">
            <thead className="bg-[#FFD601]/10 text-[#FFD601] uppercase text-xs border-b border-[#FFD601]/30">
              <tr>
                <th className="py-3 px-4 text-left">Property</th>
                <th className="py-3 px-4 text-left">Type</th>
                <th className="py-3 px-4 text-left">User</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-center">WhatsApp</th>
                <th className="py-3 px-4 text-center">Fee (₵)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Date</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, i) => (
                <motion.tr
                  key={b.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-[#FFD601]/10 hover:bg-[#1A2D7A]/50 transition-all"
                >
                  <td className="py-4 px-4 flex items-center gap-3">
                    {b.images?.length ? (
                      <img
                        src={b.images[0]}
                        alt={b.title}
                        className="w-12 h-12 rounded-lg object-cover border border-[#FFD601]/30"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-[#1A2D7A] rounded-lg flex items-center justify-center text-[#FFD601]/60 text-xs">
                        N/A
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-white">{b.title}</p>
                      <p className="text-gray-400 text-xs flex items-center gap-1">
                        <MapPin size={12} /> {b.location || "—"}
                      </p>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-center capitalize">{b.type}</td>

                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1 text-gray-200">
                      <User2 size={14} className="text-[#FFD601]" />
                      <span>{b.profiles?.full_name || "Anonymous"}</span>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-gray-400">
                    {b.profiles?.email || "—"}
                  </td>

                  <td className="py-4 px-4 text-center text-[#FFD601] font-semibold">
                    {b.whatsapp || "—"}
                  </td>

                  <td className="py-4 px-4 text-center font-semibold text-[#FFD601]">
                    {b.price || "—"}
                  </td>

                  <td className="py-4 px-4 text-center">
                    <span className="bg-[#FFD601]/20 text-[#FFD601] px-3 py-1 rounded-full text-xs font-semibold">
                      {b.status || "Paid"}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-center text-gray-400">
                    {new Date(b.created_at).toLocaleDateString()}
                  </td>

                  <td className="py-4 px-4 text-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleContactUser(b)}
                      className="inline-flex items-center gap-2 bg-[#FFD601] text-[#142B6F] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#ffdf3b] transition-all"
                    >
                      <MessageCircle size={16} />
                      Contact
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
