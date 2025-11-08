"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import ImageUploader from "@/components/admin/ImageUploader.jsx";

const NAVY = "#142B6F";
const GOLD = "#FFD601";

export default function EditRoomPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [images, setImages] = useState([]);

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
    book4meFee: "0", // ✅ NEW: BOOK 4 Me Fee field
    availability: "Available",
    verified: false,
  });

  const roomTypes = [
    "Single Room",
    "Self Contain",
    "Chamber and Hall",
    "Two Bedroom Apartment",
    "Full Apartment",
    "Hostel",
    "Other",
  ];

  // ✅ Fetch existing room data
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const { data, error } = await supabase
          .from("rooms")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error fetching room:", error);
          setMessage({ type: "error", text: "Failed to load room data." });
          return;
        }

        if (data) {
          setRoomData({
            title: data.title || "",
            type: data.type || "",
            customType: data.customtype || "",
            location: data.location || "",
            description: data.description || "",
            duration: data.duration || "",
            price: data.price?.toString() || "",
            paymentMode: data.payment_mode || "",
            bookingPrice: data.booking_price?.toString() || "",
            book4meFee: data.book4me_fee?.toString() || "0", // ✅ Load BOOK 4 Me fee
            availability: data.availability || "Available",
            verified: data.verified || false,
          });
          setImages(data.images || []);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        setMessage({ type: "error", text: "An unexpected error occurred." });
      } finally {
        setLoading(false);
      }
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

  // ✅ Handle images from uploader
  const handleImageUploadComplete = (uploadedImages) => {
    setImages(uploadedImages);
  };

  // ✅ Handle save
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !roomData.title ||
      !roomData.type ||
      !roomData.location ||
      !roomData.price
    ) {
      setMessage({ type: "error", text: "Please fill all required fields." });
      return;
    }

    if (roomData.type === "Other" && !roomData.customType.trim()) {
      setMessage({ type: "error", text: "Please specify custom room type." });
      return;
    }

    if (images.length === 0) {
      setMessage({ type: "error", text: "Please upload at least one image." });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from("rooms")
        .update({
          title: roomData.title,
          type: roomData.type === "Other" ? roomData.customType : roomData.type,
          location: roomData.location,
          description: roomData.description,
          duration: roomData.duration,
          price: parseFloat(roomData.price),
          payment_mode: roomData.paymentMode,
          booking_price: roomData.bookingPrice
            ? parseFloat(roomData.bookingPrice)
            : null,
          book4me_fee: parseFloat(roomData.book4meFee) || 0, // ✅ NEW: Update BOOK 4 Me fee
          availability: roomData.availability,
          verified: roomData.verified,
          images: images,
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
    } catch (error) {
      console.error("Unexpected error:", error);
      setMessage({
        type: "error",
        text: "❌ An unexpected error occurred.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#142B6F] to-[#1A2D7A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD601] mx-auto mb-4"></div>
          <p className="text-[#FFD601] text-lg">Loading room data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#142B6F] to-[#1A2D7A] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-[#FFD601] mb-3">
            Edit Room
          </h1>
          <p className="text-blue-200 text-lg">
            Update the details of your room listing
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl border border-[#FFD601]/30 p-6 sm:p-8 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-[#FFD601] font-semibold mb-2 text-lg">
                Room Title *
              </label>
              <input
                type="text"
                name="title"
                value={roomData.title}
                onChange={handleChange}
                placeholder="New Single Room at UPSA"
                className="w-full p-3 rounded-xl bg-[#142B6F]/80 border-2 border-[#FFD601]/30 text-white placeholder-blue-300 focus:border-[#FFD601]"
              />
            </div>

            {/* Room Type */}
            <div>
              <label className="block text-[#FFD601] font-semibold mb-2">
                Room Type *
              </label>
              <select
                name="type"
                value={roomData.type}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-[#142B6F]/80 border-2 border-[#FFD601]/30 text-white"
              >
                <option value="">Select Type</option>
                {roomTypes.map((t, i) => (
                  <option key={i} value={t} className="bg-[#142B6F]">
                    {t}
                  </option>
                ))}
              </select>

              {roomData.type === "Other" && (
                <motion.input
                  type="text"
                  name="customType"
                  value={roomData.customType}
                  onChange={handleChange}
                  placeholder="Specify custom type"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 w-full p-3 rounded-xl bg-[#142B6F]/80 border-2 border-[#FFD601]/30 text-white"
                />
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-[#FFD601] font-semibold mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={roomData.location}
                onChange={handleChange}
                placeholder="Around UPSA Shell Station"
                className="w-full p-3 rounded-xl bg-[#142B6F]/80 border-2 border-[#FFD601]/30 text-white"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[#FFD601] font-semibold mb-2 text-lg">
                Description / Amenities
              </label>
              <textarea
                name="description"
                value={roomData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the room amenities, furniture, facilities..."
                className="w-full p-3 rounded-xl bg-[#142B6F]/80 border-2 border-[#FFD601]/30 text-white placeholder-blue-300 focus:border-[#FFD601]"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-[#FFD601] font-semibold mb-2 text-lg">
                Duration / Payment Period
              </label>
              <input
                type="text"
                name="duration"
                value={roomData.duration}
                onChange={handleChange}
                placeholder="e.g., Pay ₵1200 every 4 months"
                className="w-full p-3 rounded-xl bg-[#142B6F]/80 border-2 border-[#FFD601]/30 text-white placeholder-blue-300 focus:border-[#FFD601]"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-[#FFD601] font-semibold mb-2">
                Price per Month (₵) *
              </label>
              <input
                type="number"
                name="price"
                value={roomData.price}
                onChange={handleChange}
                placeholder="₵300"
                className="w-full p-3 rounded-xl bg-[#142B6F]/80 border-2 border-[#FFD601]/30 text-white"
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
                placeholder="₵100 (optional)"
                className="w-full p-3 rounded-xl bg-[#142B6F]/80 border-2 border-[#FFD601]/30 text-white"
              />
            </div>

            {/* ✅ NEW: BOOK 4 Me Fee */}
            <div>
              <label className="block text-[#FFD601] font-semibold mb-2">
                BOOK 4 Me Service Fee (₵)
              </label>
              <input
                type="number"
                name="book4meFee"
                value={roomData.book4meFee}
                onChange={handleChange}
                placeholder="₵50 (additional fee for BOOK 4 Me service)"
                className="w-full p-3 rounded-xl bg-[#142B6F]/80 border-2 border-[#FFD601]/30 text-white"
              />
              <p className="text-blue-200 text-sm mt-2">
                💡 Additional fee for "BOOK 4 Me" service when users can't
                inspect in person
              </p>
            </div>

            {/* Payment Mode */}
            <div>
              <label className="block text-[#FFD601] font-semibold mb-2">
                Payment Mode
              </label>
              <input
                type="text"
                name="paymentMode"
                value={roomData.paymentMode}
                onChange={handleChange}
                placeholder="e.g., Monthly, Quarterly, Yearly"
                className="w-full p-3 rounded-xl bg-[#142B6F]/80 border-2 border-[#FFD601]/30 text-white"
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
                className="w-full p-3 rounded-xl bg-[#142B6F]/80 border-2 border-[#FFD601]/30 text-white"
              >
                <option value="Available">Available</option>
                <option value="Not Available">Not Available</option>
                <option value="Coming Soon">Coming Soon</option>
                <option value="Occupied">Occupied</option>
                <option value="Booked">Booked</option>
              </select>
            </div>

            {/* Verified */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="verified"
                checked={roomData.verified}
                onChange={handleChange}
                className="w-5 h-5 text-[#FFD601] bg-[#142B6F] border-2 border-[#FFD601] rounded"
              />
              <label className="text-[#FFD601] font-semibold">
                Mark as Verified
              </label>
            </div>

            {/* Image Uploader */}
            <div className="bg-[#142B6F]/60 rounded-xl p-6 border-2 border-[#FFD601]/20">
              <label className="block text-[#FFD601] font-semibold text-lg mb-4">
                Room Images *
              </label>
              <ImageUploader
                onUploadComplete={handleImageUploadComplete}
                existingImages={images}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <motion.button
                type="submit"
                whileTap={{ scale: 0.95 }}
                disabled={saving}
                className="flex-1 bg-[#FFD601] text-[#142B6F] font-bold py-3 rounded-xl hover:bg-[#FFE769] transition-all duration-200 flex items-center justify-center gap-2"
              >
                {saving ? "Updating Room..." : "Update Room"}
              </motion.button>

              <button
                type="button"
                onClick={() => router.push("/dashboard/admin/rooms")}
                className="flex-1 bg-gray-500/20 text-gray-200 font-bold py-3 rounded-xl hover:bg-gray-500/30 transition-all duration-200 border border-gray-500/30"
              >
                Cancel
              </button>
            </div>

            {/* Message */}
            {message && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`mt-4 p-3 rounded-xl text-center font-semibold ${
                  message.type === "error"
                    ? "bg-red-500/20 text-red-200 border border-red-500/30"
                    : "bg-green-500/20 text-green-200 border border-green-500/30"
                }`}
              >
                {message.text}
              </motion.div>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
}
