"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import ImageUploader from "@/components/admin/ImageUploader";

export default function AddHostelPage() {
  const [hostelData, setHostelData] = useState({
    title: "",
    location: "",
    hostel_type: "",
    price_per_semester: "",
    booking_fee: "",
    agent_fee_percentage: "", // Existing field
    book4me_fee: "0", // ✅ NEW: BOOK 4 Me Fee field
    description: "",
    availability: "Available",
    verified: false,
  });

  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setHostelData({
      ...hostelData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageUploadComplete = (uploadedImages) => {
    setImages(uploadedImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Required validation
    if (
      !hostelData.title ||
      !hostelData.location ||
      !hostelData.hostel_type ||
      !hostelData.price_per_semester ||
      !hostelData.booking_fee
    ) {
      setMessage({ type: "error", text: "Please fill all required fields." });
      return;
    }

    // ✅ If agent fee is entered but not numeric
    if (
      hostelData.agent_fee_percentage &&
      (isNaN(hostelData.agent_fee_percentage) ||
        hostelData.agent_fee_percentage < 0)
    ) {
      setMessage({ type: "error", text: "Agent Fee must be a valid number." });
      return;
    }

    // ✅ If BOOK 4 Me fee is entered but not numeric
    if (
      hostelData.book4me_fee &&
      (isNaN(hostelData.book4me_fee) || hostelData.book4me_fee < 0)
    ) {
      setMessage({
        type: "error",
        text: "BOOK 4 Me Fee must be a valid number.",
      });
      return;
    }

    if (images.length === 0) {
      setMessage({ type: "error", text: "Please upload at least one image." });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase.from("hostels").insert([
        {
          title: hostelData.title,
          location: hostelData.location,
          hostel_type: hostelData.hostel_type,
          price_per_semester: parseFloat(hostelData.price_per_semester),
          booking_fee: parseFloat(hostelData.booking_fee),
          agent_fee_percentage: hostelData.agent_fee_percentage
            ? parseInt(hostelData.agent_fee_percentage)
            : null,
          book4me_fee: parseFloat(hostelData.book4me_fee) || 0, // ✅ NEW: Save BOOK 4 Me fee
          description: hostelData.description,
          availability: hostelData.availability,
          verified: hostelData.verified,
          images,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
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
          booking_fee: "",
          agent_fee_percentage: "",
          book4me_fee: "0", // ✅ NEW: Reset BOOK 4 Me fee
          description: "",
          availability: "Available",
          verified: false,
        });
        setImages([]);
        setMessage(null);
      }, 2000);
    } catch (err) {
      setMessage({
        type: "error",
        text: "❌ Unexpected error occurred.",
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
          className="bg-white/10 backdrop-blur-lg rounded-2xl border border-[#FFD601]/30 p-6 sm:p-8 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* FORM FIELDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  label: "Hostel Name *",
                  name: "title",
                  placeholder: "Victory Hostel",
                },
                {
                  label: "Location *",
                  name: "location",
                  placeholder: "UPSA, near main gate",
                },
                {
                  label: "Hostel Type *",
                  name: "hostel_type",
                  placeholder: "4 in a room",
                },
                {
                  label: "Price per Semester (₵) *",
                  type: "number",
                  name: "price_per_semester",
                  placeholder: "₵2500",
                },
                {
                  label: "Booking Fee (₵) *",
                  type: "number",
                  name: "booking_fee",
                  placeholder: "₵150",
                },
                {
                  label: "Agent Fee (%) (Optional)",
                  type: "number",
                  name: "agent_fee_percentage",
                  placeholder: "e.g. 8",
                },
                // ✅ NEW: BOOK 4 Me Fee
                {
                  label: "BOOK 4 Me Service Fee (₵)",
                  type: "number",
                  name: "book4me_fee",
                  placeholder: "₵50 (additional fee)",
                },
              ].map((item, i) => (
                <div key={i}>
                  <label className="block text-[#FFD601] font-semibold mb-2">
                    {item.label}
                  </label>
                  <input
                    type={item.type || "text"}
                    name={item.name}
                    value={hostelData[item.name]}
                    onChange={handleChange}
                    placeholder={item.placeholder}
                    className="w-full p-3 rounded-xl bg-[#142B6F]/80 border-2 border-[#FFD601]/30 text-white"
                  />
                  {item.name === "book4me_fee" && (
                    <p className="text-blue-200 text-sm mt-2">
                      💡 Additional fee for "BOOK 4 Me" service when users can't
                      inspect in person
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Availability and Verified */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[#FFD601] font-semibold mb-2">
                  Availability
                </label>
                <select
                  name="availability"
                  value={hostelData.availability}
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

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="verified"
                  checked={hostelData.verified}
                  onChange={handleChange}
                  className="w-5 h-5 text-[#FFD601] bg-[#142B6F] border-2 border-[#FFD601] rounded"
                />
                <label className="text-[#FFD601] font-semibold">
                  Mark as Verified
                </label>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block text-[#FFD601] font-semibold mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={hostelData.description}
                onChange={handleChange}
                rows={4}
                className="w-full p-3 rounded-xl bg-[#142B6F]/80 border-2 border-[#FFD601]/30 text-white"
                placeholder="Describe the hostel facilities, amenities, rules, etc..."
              />
            </div>

            {/* IMAGES */}
            <div className="bg-[#142B6F]/60 rounded-xl p-6 border-2 border-[#FFD601]/20">
              <div className="flex justify-between mb-4">
                <label className="text-[#FFD601] font-semibold text-lg">
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

            {/* SUBMIT */}
            <motion.button
              type="submit"
              whileTap={{ scale: 0.95 }}
              className="w-full py-4 bg-gradient-to-r from-[#FFD601] to-[#FFE769] text-[#142B6F] font-bold rounded-xl hover:shadow-lg transition-all duration-200"
              disabled={saving}
            >
              {saving ? "Adding Hostel..." : "Add Hostel to Listing"}
            </motion.button>

            {message && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
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
