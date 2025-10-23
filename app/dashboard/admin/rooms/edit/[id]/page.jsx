"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";

const NAVY = "#142B6F";
const GOLD = "#FFD601";

export default function EditRoomPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [roomData, setRoomData] = useState({
    title: "",
    type: "",
    customType: "",
    location: "",
    description: "",
    duration: "",
    price: "",
    paymentMode: "",
    bookingPrice: "",
    availability: "Available",
    verified: false,
  });

  // ✅ Fetch existing room data
  useEffect(() => {
    const fetchRoom = async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("id", id)
        .single();

      if (error) console.error("Error fetching room:", error);
      else setRoomData(data);
      setLoading(false);
    };

    fetchRoom();
  }, [id]);

  // ✅ Handle input
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRoomData({
      ...roomData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // ✅ Handle save
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from("rooms")
      .update({
        title: roomData.title,
        type: roomData.type,
        customType: roomData.customType,
        location: roomData.location,
        description: roomData.description,
        duration: roomData.duration,
        price: parseFloat(roomData.price),
        payment_mode: roomData.paymentMode,
        booking_price: roomData.bookingPrice
          ? parseFloat(roomData.bookingPrice)
          : null,
        availability: roomData.availability,
        verified: roomData.verified,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Update failed:", error);
      setMessage({ type: "error", text: "❌ Update failed, try again." });
    } else {
      setMessage({ type: "success", text: "✅ Room updated successfully!" });
      setTimeout(() => router.push("/dashboard/admin/rooms"), 1500);
    }
    setSaving(false);
  };

  if (loading)
    return (
      <p className="text-blue-200 text-center mt-10 animate-pulse">
        Loading room details...
      </p>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#142B6F] to-[#1A2D7A] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-lg border border-[#FFD601]/30 rounded-2xl p-6 shadow-xl">
        <h1 className="text-3xl font-bold text-[#FFD601] mb-6 text-center">
          Edit Room
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-[#FFD601] font-semibold mb-2">
              Room Title
            </label>
            <input
              type="text"
              name="title"
              value={roomData.title}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-[#142B6F]/80 border border-[#FFD601]/30 text-white"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-[#FFD601] font-semibold mb-2">
              Room Type
            </label>
            <input
              type="text"
              name="type"
              value={roomData.type}
              onChange={handleChange}
              placeholder="e.g., Self Contain"
              className="w-full p-3 rounded-lg bg-[#142B6F]/80 border border-[#FFD601]/30 text-white"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-[#FFD601] font-semibold mb-2">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={roomData.location}
              onChange={handleChange}
              placeholder="Around UPSA Shell Station"
              className="w-full p-3 rounded-lg bg-[#142B6F]/80 border border-[#FFD601]/30 text-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[#FFD601] font-semibold mb-2">
              Description / Amenities
            </label>
            <textarea
              name="description"
              value={roomData.description || ""}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the room amenities, e.g. AC, bathroom, kitchen..."
              className="w-full p-3 rounded-lg bg-[#142B6F]/80 border border-[#FFD601]/30 text-white"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-[#FFD601] font-semibold mb-2">
              Duration / Payment Period
            </label>
            <input
              type="text"
              name="duration"
              value={roomData.duration}
              onChange={handleChange}
              placeholder="e.g., ₵1500 every 6 months"
              className="w-full p-3 rounded-lg bg-[#142B6F]/80 border border-[#FFD601]/30 text-white"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-[#FFD601] font-semibold mb-2">
              Price (₵)
            </label>
            <input
              type="number"
              name="price"
              value={roomData.price}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-[#142B6F]/80 border border-[#FFD601]/30 text-white"
            />
          </div>

          {/* Booking Price */}
          <div>
            <label className="block text-[#FFD601] font-semibold mb-2">
              Booking Price (₵)
            </label>
            <input
              type="number"
              name="bookingPrice"
              value={roomData.bookingPrice}
              onChange={handleChange}
              placeholder="Optional"
              className="w-full p-3 rounded-lg bg-[#142B6F]/80 border border-[#FFD601]/30 text-white"
            />
          </div>

          {/* Availability */}
          <div>
            <label className="block text-[#FFD601] font-semibold mb-2">
              Availability
            </label>
            <select
              name="availability"
              value={roomData.availability}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-[#142B6F]/80 border border-[#FFD601]/30 text-white"
            >
              <option value="Available">Available</option>
              <option value="Booked">Booked</option>
              <option value="Occupied">Occupied</option>
            </select>
            <p className="text-blue-300 text-sm mt-1">
              When set to “Occupied”, the room will be dimmed for users.
            </p>
          </div>

          {/* Verified */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="verified"
              checked={roomData.verified}
              onChange={handleChange}
              className="w-5 h-5 accent-[#FFD601]"
            />
            <label className="text-[#FFD601] font-semibold">
              Verified Room
            </label>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            whileTap={{ scale: 0.95 }}
            className="w-full py-3 bg-[#FFD601] text-[#142B6F] font-bold rounded-lg hover:bg-[#FFE769] transition-all"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </motion.button>

          {/* Message */}
          {message && (
            <p
              className={`text-center font-semibold ${
                message.type === "error" ? "text-red-400" : "text-green-400"
              }`}
            >
              {message.text}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
