"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { Home, Loader2, Calendar } from "lucide-react";
import toast from "react-hot-toast";

const NAVY = "#142B6F";
const GOLD = "#FFD601";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch bookings from Supabase
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error("Please log in again.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("bookings")
        .select("*, rooms(*)") // assumes relation: bookings.room_id → rooms.id
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        toast.error("Could not load bookings.");
      } else {
        setBookings(data || []);
      }
      setLoading(false);
    };

    fetchBookings();
  }, []);

  // ✅ Booking status color
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
      >
        <h1 className="text-2xl font-bold text-[#142B6F] mb-1">My Bookings</h1>
        <p className="text-gray-600 text-sm">
          Here are all your room bookings and payment statuses.
        </p>
      </motion.div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="animate-spin text-[#142B6F]" size={32} />
          <p className="text-gray-500 mt-3 text-sm">
            Fetching your bookings...
          </p>
        </div>
      ) : bookings.length === 0 ? (
        // Empty State
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white border border-gray-100 shadow-sm rounded-2xl p-10 text-center text-gray-600"
        >
          <Home size={36} className="mx-auto mb-3 text-[#142B6F]/50" />
          <p className="font-medium">No bookings yet</p>
          <p className="text-sm mt-1">
            Once you book a room, it’ll appear here for easy tracking.
          </p>
          <a
            href="/rooms"
            className="inline-block mt-4 bg-[#142B6F] text-white px-5 py-2 rounded-lg font-semibold hover:bg-[#1A2D7A] transition-all"
          >
            Browse Rooms
          </a>
        </motion.div>
      ) : (
        // Bookings Grid
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((b, idx) => {
            const room = b.rooms || {};
            return (
              <motion.div
                key={b.id || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                {/* Image */}
                <div className="relative h-40 bg-gray-100">
                  {room.images?.length ? (
                    <img
                      src={room.images[0]}
                      alt={room.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      <Home size={28} className="mb-1" />
                      <span className="text-xs">No image</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-semibold text-lg text-[#142B6F] line-clamp-1">
                    {room.title || "Untitled Room"}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {room.location || "Unknown location"}
                  </p>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-700 font-semibold text-sm">
                      ₵{room.price || "0"}/mo
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusStyle(
                        b.status
                      )}`}
                    >
                      {b.status || "Pending"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-3">
                    <Calendar size={12} />
                    {new Date(b.created_at).toLocaleDateString()}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
