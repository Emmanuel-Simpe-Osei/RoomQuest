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
  Trash2,
  Phone,
  Mail,
} from "lucide-react";

const NAVY = "#142B6F";
const GOLD = "#FFD601";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

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
            amount,
            book4me_service,
            hostels(title, location, booking_fee, images),
            profiles(full_name, email, phone)
          `
          )
          .order("created_at", { ascending: false });

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

        // ✅ Sort by date (most recent first)
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

  const handleDeleteBooking = async (bookingId, bookingType) => {
    if (
      !confirm(
        "Are you sure you want to delete this booking? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeletingId(bookingId);

    try {
      const tableName = bookingType === "Room" ? "bookings" : "hostel_bookings";

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq("id", bookingId);

      if (error) throw error;

      // Remove from local state
      setBookings((prev) => prev.filter((booking) => booking.id !== bookingId));
    } catch (err) {
      console.error("Error deleting booking:", err);
      alert("Failed to delete booking. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.price || 0), 0);
  const book4meCount = bookings.filter((b) => b.book4me_service).length;

  const handleContactUser = (booking) => {
    // Get phone number from whatsapp field first, then fallback to profiles.phone
    let phone = booking.whatsapp || booking.profiles?.phone;

    if (!phone) {
      return alert("No WhatsApp number provided.");
    }

    console.log("📱 Original phone:", phone); // Debug log

    // Remove all non-digit characters
    phone = phone.replace(/\D/g, "");

    // Convert Ghana local numbers to international format
    if (phone.startsWith("0") && phone.length === 10) {
      // Example: 0599340535 → 233599340535
      phone = "233" + phone.slice(1);
    } else if (phone.length === 9) {
      // Example: 599340535 → 233599340535
      phone = "233" + phone;
    }

    console.log("📱 Formatted phone:", phone); // Debug log

    // Create message
    const message = `👋 Hello ${
      booking.profiles?.full_name || "there"
    }, this is RoomQuest Admin.

We noticed your booking for:
🏠 *${booking.title || "Property"}*
📍 Location: ${booking.location || "N/A"}
💰 Booking Fee: ₵${booking.price || "—"}
${booking.book4me_service ? "✅ BOOK 4 Me Service: Selected" : ""}

Please confirm when you'd like to inspect the property.`;

    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
      message
    )}`;

    console.log("🔗 WhatsApp URL:", whatsappUrl); // Debug log

    // Open WhatsApp
    window.open(whatsappUrl, "_blank");
  };

  const handleCallUser = (phone) => {
    if (!phone) return alert("No phone number provided.");

    // Clean phone number for tel: link
    const cleanPhone = phone.replace(/\D/g, "");
    window.open(`tel:${cleanPhone}`, "_self");
  };

  const handleEmailUser = (email) => {
    if (!email) return alert("No email provided.");
    window.open(`mailto:${email}`, "_self");
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
    <div className="min-h-screen bg-[#0E1F52] text-white p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
        <div className="mb-6 lg:mb-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#FFD601] mb-2">
            All Bookings Overview
          </h1>
          <p className="text-gray-300 text-sm">
            Manage all Room & Hostel bookings • Most recent first
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
          {/* Total Bookings */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 250, damping: 20 }}
            className="bg-blue-500/10 border border-blue-500/40 rounded-xl shadow-md px-4 py-3 flex items-center gap-3 text-white"
          >
            <Calendar size={20} className="text-blue-400" />
            <div>
              <p className="text-xs uppercase text-blue-400/90 font-semibold">
                Total Bookings
              </p>
              <p className="text-lg font-bold text-white">{bookings.length}</p>
            </div>
          </motion.div>

          {/* BOOK 4 Me Stats */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 250, damping: 20 }}
            className="bg-green-500/10 border border-green-500/40 rounded-xl shadow-md px-4 py-3 flex items-center gap-3 text-white"
          >
            <Eye size={20} className="text-green-400" />
            <div>
              <p className="text-xs uppercase text-green-400/90 font-semibold">
                BOOK 4 Me
              </p>
              <p className="text-lg font-bold text-white">{book4meCount}</p>
            </div>
          </motion.div>

          {/* Total Revenue */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 250, damping: 20 }}
            className="bg-[#FFD601]/10 border border-[#FFD601]/40 rounded-xl shadow-md px-4 py-3 flex items-center gap-3 text-white"
          >
            <CreditCard size={20} className="text-[#FFD601]" />
            <div>
              <p className="text-xs uppercase text-[#FFD601]/90 font-semibold">
                Total Revenue
              </p>
              <p className="text-lg font-bold text-white">
                ₵{totalRevenue.toLocaleString()}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ✅ CARDS LAYOUT FOR ALL SCREENS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6">
        {bookings.map((b, i) => {
          const dateTime = formatDateTime(b.created_at);
          return (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-[#132863] border border-[#FFD601]/30 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 ${
                i === 0 ? "ring-2 ring-[#FFD601] ring-opacity-60" : ""
              }`}
            >
              {/* Header with timestamp and status */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col">
                  <div className="text-xs text-gray-400 bg-[#1A2D7A]/50 px-2 py-1 rounded mb-1">
                    {dateTime.date} • {dateTime.time}
                  </div>
                  {i === 0 && (
                    <span className="bg-[#FFD601] text-[#142B6F] text-xs font-bold px-2 py-1 rounded w-fit">
                      NEWEST
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="bg-[#FFD601]/20 text-[#FFD601] px-2 py-1 rounded-full text-xs font-semibold">
                    {b.status || "paid"}
                  </span>
                  <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-semibold">
                    {b.type}
                  </span>
                </div>
              </div>

              {/* Property Image and Title */}
              <div className="flex gap-3 mb-4">
                <img
                  src={b.images?.[0] || "/placeholder.png"}
                  alt={b.title}
                  className="w-16 h-16 rounded-lg object-cover border border-[#FFD601]/30 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-lg mb-1 truncate">
                    {b.title}
                  </h3>
                  <p className="text-gray-300 text-sm flex gap-1 items-center">
                    <MapPin
                      size={14}
                      className="text-[#FFD601] flex-shrink-0"
                    />
                    <span className="truncate">{b.location || "—"}</span>
                  </p>
                </div>
              </div>

              {/* Price and BOOK 4 Me */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <CreditCard size={16} className="text-[#FFD601]" />
                  <span className="text-[#FFD601] font-bold text-lg">
                    ₵{b.price}
                  </span>
                </div>
                {b.book4me_service && (
                  <div className="flex items-center gap-1 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-semibold">
                    <CheckCircle size={14} />
                    <span>BOOK 4 Me</span>
                  </div>
                )}
              </div>

              {/* User Information */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 p-2 bg-[#1A2D7A]/30 rounded-lg">
                  <User2 size={16} className="text-[#FFD601] flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-medium text-sm truncate">
                      {b.profiles?.full_name || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-[#1A2D7A]/30 rounded-lg">
                  <Mail size={16} className="text-[#FFD601] flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-gray-300 text-sm truncate">
                      {b.profiles?.email || "—"}
                    </p>
                  </div>
                  {b.profiles?.email && (
                    <button
                      onClick={() => handleEmailUser(b.profiles.email)}
                      className="text-[#FFD601] hover:text-[#ffdf3b] transition"
                    >
                      <Mail size={14} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 p-2 bg-[#1A2D7A]/30 rounded-lg">
                  <Phone size={16} className="text-[#FFD601] flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-gray-300 text-sm">
                      {b.whatsapp || b.profiles?.phone || "—"}
                    </p>
                  </div>
                  {(b.whatsapp || b.profiles?.phone) && (
                    <button
                      onClick={() =>
                        handleCallUser(b.whatsapp || b.profiles.phone)
                      }
                      className="text-[#FFD601] hover:text-[#ffdf3b] transition"
                    >
                      <Phone size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleContactUser(b)}
                  className="flex-1 bg-[#FFD601] text-[#142B6F] font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-[#ffdf3b] transition text-sm"
                >
                  <MessageCircle size={16} />
                  WhatsApp
                </button>
                <button
                  onClick={() => handleDeleteBooking(b.id, b.type)}
                  disabled={deletingId === b.id}
                  className="flex-1 bg-red-500 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {deletingId === b.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                  Delete
                </button>
              </div>
            </motion.div>
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
