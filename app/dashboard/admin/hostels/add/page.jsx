"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import ImageUploader from "@/components/admin/ImageUploader";

const NAVY = "#142B6F";
const GOLD = "#FFD601";

export default function AddHostelPage() {
  const [hostelData, setHostelData] = useState({
    title: "",
    location: "",
    hostel_type: "",
    price_per_semester: "",
    description: "",
    availability: "Available",
    verified: false,
  });

  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // ✅ Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setHostelData({
      ...hostelData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // ✅ Handle image uploads
  const handleImageUploadComplete = (uploadedImages) => {
    setImages(uploadedImages);
  };

  // ✅ Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !hostelData.title ||
      !hostelData.location ||
      !hostelData.hostel_type ||
      !hostelData.price_per_semester
    ) {
      setMessage({ type: "error", text: "Please fill all required fields." });
      return;
    }

    if (images.length === 0) {
      setMessage({ type: "error", text: "Please upload at least one image." });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.from("hostels").insert([
        {
          title: hostelData.title,
          location: hostelData.location,
          hostel_type: hostelData.hostel_type,
          price_per_semester: parseFloat(hostelData.price_per_semester),
          description: hostelData.description,
          availability: hostelData.availability,
          verified: hostelData.verified,
          images,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("Supabase error:", error);
        setMessage({
          type: "error",
          text: `❌ Failed to add hostel: ${error.message}`,
        });
        return;
      }

      setMessage({
        type: "success",
        text: "✅ Hostel added successfully!",
      });

      setTimeout(() => {
        setHostelData({
          title: "",
          location: "",
          hostel_type: "",
          price_per_semester: "",
          description: "",
          availability: "Available",
          verified: false,
        });
        setImages([]);
        setMessage(null);
      }, 2500);
    } catch (err) {
      console.error("Unexpected error:", err);
      setMessage({
        type: "error",
        text: "❌ Unexpected error occurred. Check console.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#142B6F] to-[#1A2D7A] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-[#FFD601] mb-3">
            Add New Hostel
          </h1>
          <p className="text-blue-200 text-lg">
            Fill in the details below to list a new hostel
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl border border-[#FFD601]/30 p-6 sm:p-8 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hostel Title */}
              <div>
                <label className="block text-[#FFD601] font-semibold mb-2">
                  Hostel Name *
                </label>
                <input
                  type="text"
                  name="title"
                  value={hostelData.title}
                  onChange={handleChange}
                  placeholder="Victory Hostel"
                  className="w-full p-3 rounded-xl bg-[#142B6F]/80 border-2 border-[#FFD601]/30 text-white placeholder-blue-300 focus:border-[#FFD601] focus:outline-none"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-[#FFD601] font-semibold mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={hostelData.location}
                  onChange={handleChange}
                  placeholder="UPSA, near main gate"
                  className="w-full p-3 rounded-xl bg-[#142B6F]/80 border-2 border-[#FFD601]/30 text-white placeholder-blue-300 focus:border-[#FFD601] focus:outline-none"
                />
              </div>

              {/* Hostel Type */}
              <div>
                <label className="block text-[#FFD601] font-semibold mb-2">
                  Hostel Type (No. of people per room) *
                </label>
                <input
                  type="text"
                  name="hostel_type"
                  value={hostelData.hostel_type}
                  onChange={handleChange}
                  placeholder="4 in a room"
                  className="w-full p-3 rounded-xl bg-[#142B6F]/80 border-2 border-[#FFD601]/30 text-white placeholder-blue-300 focus:border-[#FFD601] focus:outline-none"
                />
              </div>

              {/* Price per semester */}
              <div>
                <label className="block text-[#FFD601] font-semibold mb-2">
                  Price per Semester (₵) *
                </label>
                <input
                  type="number"
                  name="price_per_semester"
                  value={hostelData.price_per_semester}
                  onChange={handleChange}
                  placeholder="₵2500"
                  className="w-full p-3 rounded-xl bg-[#142B6F]/80 border-2 border-[#FFD601]/30 text-white placeholder-blue-300 focus:border-[#FFD601] focus:outline-none"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[#FFD601] font-semibold mb-2">
                Description / Amenities
              </label>
              <textarea
                name="description"
                value={hostelData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Spacious rooms, free Wi-Fi, 24/7 security, shared kitchen..."
                className="w-full p-3 rounded-xl bg-[#142B6F]/80 border-2 border-[#FFD601]/30 text-white placeholder-blue-300 focus:border-[#FFD601] focus:outline-none resize-vertical"
              />
            </div>

            {/* Images */}
            <div className="bg-[#142B6F]/60 rounded-xl p-6 border-2 border-[#FFD601]/20">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-[#FFD601] font-semibold text-lg">
                  Hostel Images *
                </label>
                <span className="text-blue-200 text-sm">
                  {images.length}/7 images
                </span>
              </div>
              <ImageUploader
                onUploadComplete={handleImageUploadComplete}
                existingImages={images}
              />
            </div>

            {/* Availability & Verified */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[#FFD601] font-semibold mb-2">
                  Availability
                </label>
                <select
                  name="availability"
                  value={hostelData.availability}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl bg-[#142B6F]/80 border-2 border-[#FFD601]/30 text-white focus:border-[#FFD601]"
                >
                  <option value="Available">Available</option>
                  <option value="Full">Full</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                </select>
              </div>

              <div className="flex items-center justify-center md:justify-end">
                <label className="flex items-center space-x-3 p-3 rounded-xl bg-[#142B6F]/80 border-2 border-[#FFD601]/30 cursor-pointer hover:border-[#FFD601]/50 transition-all">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="verified"
                      checked={hostelData.verified}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div
                      className={`w-10 h-6 rounded-full transition-all duration-200 ${
                        hostelData.verified ? "bg-[#FFD601]" : "bg-blue-400"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200 ${
                          hostelData.verified ? "left-5" : "left-1"
                        }`}
                      />
                    </div>
                  </div>
                  <span className="text-[#FFD601] font-semibold">
                    Verified Hostel
                  </span>
                </label>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              disabled={saving}
              className="w-full py-4 bg-gradient-to-r from-[#FFD601] to-[#FFE769] text-[#142B6F] font-bold rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {saving ? "Adding Hostel..." : "Add Hostel to Listing"}
            </motion.button>

            {message && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl text-center font-semibold ${
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
