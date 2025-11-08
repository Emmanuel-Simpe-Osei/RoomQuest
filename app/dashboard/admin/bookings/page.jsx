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
  CheckCircle,
  Eye,
  Calendar,
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
            amount,
            book4me_service,
            rooms(title, location, booking_price, images),
            profiles(full_name, email, phone)
          `
          )
          .order("created_at", { ascending: false }); // ✅ Already sorted by date

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
            amount,
            book4me_service,
            hostels(title, location, booking_fee, images),
            profiles(full_name, email, phone)
          `
          )
          .order("created_at", { ascending: false }); // ✅ Already sorted by date

        if (hostelError) throw hostelError;

        // ✅ Merge and Normalize
        const combined = [
          ...(roomBookings?.map((b) => ({
            ...b,
            type: "Room",
            title: b.rooms?.title,
            location: b.rooms?.location,
            price: b.amount || b.rooms?.booking_price,
            images: b.rooms?.images,
            book4me_service: b.book4me_service || false,
          })) || []),
          ...(hostelBookings?.map((b) => ({
            ...b,
            type: "Hostel",
            title: b.hostels?.title,
            location: b.hostels?.location,
            price: b.amount || b.hostels?.booking_fee,
            images: b.hostels?.images,
            book4me_service: b.book4me_service || false,
          })) || []),
        ];

        // ✅ Sort by date (most recent first) - additional safety sort
        combined.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

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
  const book4meCount = bookings.filter((b) => b.book4me_service).length;

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
${booking.book4me_service ? "✅ BOOK 4 Me Service: Selected" : ""}

Please confirm when you'd like to inspect the property.`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  // ✅ Format date with time for better sorting visibility
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      full: date.toLocaleString(),
    };
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
            Manage all Room & Hostel bookings • Most recent first
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-4 sm:mt-0">
          {/* Recent Bookings Count */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 250, damping: 20 }}
            className="bg-blue-500/10 border border-blue-500/40 rounded-xl shadow-md px-6 py-4 flex items-center gap-3 text-white"
          >
            <Calendar size={24} className="text-blue-400" />
            <div>
              <p className="text-xs uppercase text-blue-400/90 font-semibold">
                Total Bookings
              </p>
              <p className="text-xl font-bold text-white">{bookings.length}</p>
            </div>
          </motion.div>

          {/* BOOK 4 Me Stats */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 250, damping: 20 }}
            className="bg-green-500/10 border border-green-500/40 rounded-xl shadow-md px-6 py-4 flex items-center gap-3 text-white"
          >
            <Eye size={24} className="text-green-400" />
            <div>
              <p className="text-xs uppercase text-green-400/90 font-semibold">
                BOOK 4 Me
              </p>
              <p className="text-xl font-bold text-white">{book4meCount}</p>
            </div>
          </motion.div>

          {/* Total Revenue */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 250, damping: 20 }}
            className="bg-[#FFD601]/10 border border-[#FFD601]/40 rounded-xl shadow-md px-6 py-4 flex items-center gap-3 text-white"
          >
            <CreditCard size={24} className="text-[#FFD601]" />
            <div>
              <p className="text-xs uppercase text-[#FFD601]/90 font-semibold">
                Total Revenue
              </p>
              <p className="text-xl font-bold text-white">
                ₵{totalRevenue.toLocaleString()}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ✅ DESKTOP TABLE */}
      <div className="hidden sm:block overflow-x-auto bg-[#132863]/80 backdrop-blur-sm shadow-xl rounded-2xl border border-[#FFD601]/20">
        <table className="min-w-full text-sm text-gray-100">
          <thead className="bg-[#FFD601]/10 text-[#FFD601] uppercase text-xs border-b border-[#FFD601]/30">
            <tr>
              <th className="py-3 px-4 text-left">Property</th>
              <th className="py-3 px-4 text-left">Type</th>
              <th className="py-3 px-4 text-left">User</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-center">WhatsApp</th>
              <th className="py-3 px-4 text-center">Fee (₵)</th>
              <th className="py-3 px-4 text-center">BOOK 4 Me</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-center">Date & Time</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b, i) => {
              const dateTime = formatDateTime(b.created_at);
              return (
                <motion.tr
                  key={b.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`border-b border-[#FFD601]/10 hover:bg-[#1A2D7A]/50 transition-all ${
                    i === 0 ? "bg-[#1A2D7A]/30" : "" // Highlight most recent
                  }`}
                >
                  <td className="py-4 px-4 flex items-center gap-3">
                    {b.images?.[0] && (
                      <img
                        src={b.images[0]}
                        alt={b.title}
                        className="w-12 h-12 rounded-lg object-cover border border-[#FFD601]/30"
                      />
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
                      <span>{b.profiles?.full_name || "—"}</span>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-gray-400">
                    {b.profiles?.email}
                  </td>

                  <td className="py-4 px-4 text-center text-[#FFD601]">
                    {b.whatsapp}
                  </td>

                  <td className="py-4 px-4 text-center text-[#FFD601] font-semibold">
                    {b.price}
                  </td>

                  {/* ✅ BOOK 4 Me Indicator */}
                  <td className="py-4 px-4 text-center">
                    {b.book4me_service ? (
                      <div className="flex items-center justify-center gap-1 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-semibold">
                        <CheckCircle size={14} />
                        <span>Yes</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">No</span>
                    )}
                  </td>

                  <td className="py-4 px-4 text-center">
                    <span className="bg-[#FFD601]/20 text-[#FFD601] px-3 py-1 rounded-full text-xs font-semibold">
                      {b.status || "paid"}
                    </span>
                  </td>

                  {/* ✅ Enhanced Date & Time Display */}
                  <td className="py-4 px-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-gray-400 text-sm">
                        {dateTime.date}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {dateTime.time}
                      </span>
                    </div>
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
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ✅ MOBILE CARD LAYOUT */}
      <div className="sm:hidden space-y-4 mt-6">
        {bookings.map((b, i) => {
          const dateTime = formatDateTime(b.created_at);
          return (
            <div
              key={b.id}
              className={`bg-[#132863] border border-[#FFD601]/30 rounded-xl p-4 shadow-md flex flex-col gap-3 ${
                i === 0 ? "ring-2 ring-[#FFD601]" : "" // Highlight most recent
              }`}
            >
              {/* Header with timestamp */}
              <div className="flex justify-between items-start">
                <div className="text-xs text-gray-400 bg-[#1A2D7A]/50 px-2 py-1 rounded">
                  {dateTime.date} • {dateTime.time}
                </div>
                {i === 0 && (
                  <span className="bg-[#FFD601] text-[#142B6F] text-xs font-bold px-2 py-1 rounded">
                    NEWEST
                  </span>
                )}
              </div>

              {/* Image + title row */}
              <div className="flex gap-3">
                <img
                  src={b.images?.[0] || "/placeholder.png"}
                  alt={b.title}
                  className="w-20 h-20 rounded-lg object-cover border border-[#FFD601]/30"
                />
                <div className="flex-1">
                  <p className="font-semibold">{b.title}</p>
                  <p className="text-gray-300 text-xs flex gap-1 items-center">
                    <MapPin size={12} /> {b.location || "—"}
                  </p>

                  {/* BOOK 4 Me Badge for Mobile */}
                  {b.book4me_service && (
                    <div className="flex items-center gap-1 bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-semibold mt-1 w-fit">
                      <CheckCircle size={12} />
                      <span>BOOK 4 Me</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="text-xs text-gray-300 space-y-1">
                <p>
                  <span className="text-[#FFD601]">User:</span>{" "}
                  {b.profiles?.full_name || "—"}
                </p>
                <p>
                  <span className="text-[#FFD601]">Email:</span>{" "}
                  {b.profiles?.email || "—"}
                </p>
                <p>
                  <span className="text-[#FFD601]">WhatsApp:</span>{" "}
                  {b.whatsapp || "—"}
                </p>
                <p>
                  <span className="text-[#FFD601]">Fee:</span> ₵{b.price}
                </p>
                <p>
                  <span className="text-[#FFD601]">Type:</span> {b.type}
                </p>
                <p>
                  <span className="text-[#FFD601]">Status:</span>{" "}
                  {b.status || "paid"}
                </p>
              </div>

              {/* Contact Button */}
              <button
                onClick={() => handleContactUser(b)}
                className="w-full bg-[#FFD601] text-[#142B6F] font-semibold py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-[#ffdf3b] transition"
              >
                <MessageCircle size={16} />
                Contact
              </button>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {bookings.length === 0 && !loading && (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-4 bg-[#FFD601]/10 rounded-full flex items-center justify-center">
            <CreditCard size={40} className="text-[#FFD601]" />
          </div>
          <h3 className="text-xl font-semibold text-[#FFD601] mb-2">
            No Bookings Yet
          </h3>
          <p className="text-gray-400">
            When users make bookings, they will appear here with the most recent
            first.
          </p>
        </div>
      )}
    </div>
  );
}
