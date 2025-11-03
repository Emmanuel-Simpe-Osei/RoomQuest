"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { Home, Loader2, Calendar, MapPin, Building2 } from "lucide-react";
import toast from "react-hot-toast";

const NAVY = "#142B6F";
const GOLD = "#FFD601";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

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

      try {
        // ✅ Fetch both room and hostel bookings
        const { data: roomBookings } = await supabase
          .from("bookings")
          .select("*, rooms(*)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        const { data: hostelBookings } = await supabase
          .from("hostel_bookings")
          .select("*, hostels(*)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        const allBookings = [
          ...(roomBookings || []).map((b) => ({
            ...b,
            type: "room",
            item: b.rooms,
          })),
          ...(hostelBookings || []).map((b) => ({
            ...b,
            type: "hostel",
            item: b.hostels,
          })),
        ];

        allBookings.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        setBookings(allBookings);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch bookings.");
      }

      setLoading(false);
    };

    fetchBookings();
  }, []);

  // ✅ Status color
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
          View all your booked rooms and hostels with full details.
        </p>
      </motion.div>

      {/* Loading / Empty States */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="animate-spin text-[#142B6F]" size={32} />
          <p className="text-gray-500 mt-3 text-sm">
            Fetching your bookings...
          </p>
        </div>
      ) : bookings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white border border-gray-100 shadow-sm rounded-2xl p-10 text-center text-gray-600"
        >
          <Home size={36} className="mx-auto mb-3 text-[#142B6F]/50" />
          <p className="font-medium">No bookings yet</p>
          <p className="text-sm mt-1">
            Once you book a room or hostel, it’ll appear here for tracking.
          </p>
          <a
            href="/hostels"
            className="inline-block mt-4 bg-[#142B6F] text-white px-5 py-2 rounded-lg font-semibold hover:bg-[#1A2D7A] transition-all"
          >
            Browse Hostels
          </a>
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((b, idx) => {
            const item = b.item || {};
            const image =
              Array.isArray(item.images) && item.images.length
                ? item.images[0]
                : typeof item.images === "string"
                ? JSON.parse(item.images || "[]")[0]
                : null;

            return (
              <motion.div
                key={b.id || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-100">
                  {image ? (
                    <img
                      src={image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      <Home size={28} className="mb-1" />
                      <span className="text-xs">No image</span>
                    </div>
                  )}
                  <span
                    className={`absolute top-3 right-3 px-3 py-1 text-xs font-medium rounded-full border ${getStatusStyle(
                      b.status
                    )}`}
                  >
                    {b.status?.toLowerCase() === "paid"
                      ? "Booking Fee Paid"
                      : b.status || "Pending"}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 p-5 flex flex-col">
                  <h3 className="text-lg font-bold text-[#142B6F] mb-1">
                    {item.title || "Untitled"}
                  </h3>

                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                    <MapPin size={15} />
                    <span>{item.location || "Unknown location"}</span>
                  </div>

                  <p className="text-gray-700 text-sm mb-3 line-clamp-3">
                    {item.description || "No description available."}
                  </p>

                  <div className="mt-auto space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-gray-700">Type:</span>
                      <span className="capitalize text-gray-600">{b.type}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-gray-700">
                        Booking Fee:
                      </span>
                      <span className="text-gray-600">
                        ₵{item.booking_fee || "—"}
                      </span>
                    </div>

                    {item.price_per_semester && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-gray-700">
                          Price per semester:
                        </span>
                        <span className="text-gray-600">
                          ₵{item.price_per_semester}
                        </span>
                      </div>
                    )}

                    {item.price && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-gray-700">
                          Price per month:
                        </span>
                        <span className="text-gray-600">₵{item.price}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-3">
                      <Calendar size={12} />
                      {new Date(b.created_at).toLocaleDateString()}
                    </div>
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
