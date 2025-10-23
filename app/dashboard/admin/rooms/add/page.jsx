"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import ImageUploader from "@/components/admin/ImageUploader.jsx";

const NAVY = "#142B6F";
const GOLD = "#FFD601";

export default function AddRoomPage() {
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

  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const roomTypes = [
    "Single Room",
    "Self Contain",
    "Chamber and Hall",
    "Two Bedroom Apartment",
    "Full Apartment",
    "Hostel",
    "Other",
  ];

  // ✅ Handle input change
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

  // ✅ Handle form submit
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
      const { data, error } = await supabase
        .from("rooms")
        .insert([
          {
            title: roomData.title,
            type:
              roomData.type === "Other" ? roomData.customType : roomData.type,
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
            images: images,
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) {
        console.error("Supabase save error:", error);
        setMessage({
          type: "error",
          text: `❌ Failed to add room: ${error.message}`,
        });
        return;
      }

      setMessage({ type: "success", text: "✅ Room added successfully!" });

      // Reset form
      setTimeout(() => {
        setRoomData({
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
        setImages([]);
        setMessage(null);
      }, 2500);
    } catch (error) {
      console.error("Unexpected error:", error);
      setMessage({
        type: "error",
        text: "❌ An unexpected error occurred. Check console for details.",
      });
    } finally {
      setSaving(false);
    }
  };

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
            Add New Room
          </h1>
          <p className="text-blue-200 text-lg">
            Fill in the details below to list a new room
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

            {/* Submit */}
            <motion.button
              type="submit"
              whileTap={{ scale: 0.95 }}
              disabled={saving}
              className="w-full py-4 bg-gradient-to-r from-[#FFD601] to-[#FFE769] text-[#142B6F] font-bold rounded-xl hover:shadow-lg"
            >
              {saving ? "Adding Room..." : "Add Room to Listing"}
            </motion.button>

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
