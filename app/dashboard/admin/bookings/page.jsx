"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  User2,
  Loader2,
  CreditCard,
  Building2,
} from "lucide-react";

const NAVY = "#142B6F";
const DARK_NAVY = "#0E1F52";
const GOLD = "#FFD601";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data, error } = await supabase
          .from("bookings")
          .select(
            "*, rooms(title, location, booking_price, images), profiles(full_name, email)"
          )
          .order("created_at", { ascending: false });

        if (error) throw error;
        setBookings(data || []);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const totalRevenue = bookings.reduce(
    (sum, b) => sum + (b.rooms?.booking_price || 0),
    0
  );

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
            Bookings Management
          </h1>
          <p className="text-gray-300 text-sm">
            Overview of all user bookings and payments
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
            <p className="text-xl font-bold text-white">{`₵${totalRevenue.toLocaleString()}`}</p>
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
                <th className="py-3 px-4 text-left">Room</th>
                <th className="py-3 px-4 text-left">User</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-center">Fee (₵)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Date</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, i) => (
                <motion.tr
                  key={b.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`border-b border-[#FFD601]/10 hover:bg-[#1A2D7A]/50 transition-all`}
                >
                  {/* Room */}
                  <td className="py-4 px-4 flex items-center gap-3">
                    {b.rooms?.images?.length ? (
                      <img
                        src={b.rooms.images[0]}
                        alt={b.rooms.title}
                        className="w-12 h-12 rounded-lg object-cover border border-[#FFD601]/30"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-[#1A2D7A] rounded-lg flex items-center justify-center text-[#FFD601]/60 text-xs">
                        N/A
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-white">
                        {b.rooms?.title}
                      </p>
                      <p className="text-gray-400 text-xs flex items-center gap-1">
                        <MapPin size={12} /> {b.rooms?.location || "—"}
                      </p>
                    </div>
                  </td>

                  {/* User */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1 text-gray-200">
                      <User2 size={14} className="text-[#FFD601]" />
                      <span>{b.profiles?.full_name || "Anonymous"}</span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-4 px-4 text-gray-400">
                    {b.profiles?.email || "—"}
                  </td>

                  {/* Fee */}
                  <td className="py-4 px-4 text-center font-semibold text-[#FFD601]">
                    {b.rooms?.booking_price || "—"}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4 text-center">
                    <span className="bg-[#FFD601]/20 text-[#FFD601] px-3 py-1 rounded-full text-xs font-semibold">
                      {b.status || "Paid"}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="py-4 px-4 text-center text-gray-400">
                    {new Date(b.created_at).toLocaleDateString()}
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
