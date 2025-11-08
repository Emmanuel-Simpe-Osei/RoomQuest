"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import ImageUploader from "@/components/admin/ImageUploader";
import {
  ArrowLeft,
  Save,
  Loader2,
  MapPin,
  Building,
  DollarSign,
  CheckCircle,
  ImageIcon,
  Percent,
} from "lucide-react";

const NAVY = "#142B6F";
const GOLD = "#FFD601";

export default function EditHostelPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [images, setImages] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    location: "",
    hostel_type: "",
    description: "",
    price_per_semester: "",
    booking_fee: "",
    agent_fee_percentage: "",
    book4me_fee: "0", // ✅ NEW: BOOK 4 Me Fee field
    availability: "Available",
    verified: false,
  });

  // ✅ Fetch existing hostel details
  useEffect(() => {
    const fetchHostel = async () => {
      try {
        const { data, error } = await supabase
          .from("hostels")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error fetching hostel:", error);
          setMessage({ type: "error", text: "Failed to load hostel details" });
        } else {
          setFormData({
            title: data.title || "",
            location: data.location || "",
            hostel_type: data.hostel_type || "",
            description: data.description || "",
            price_per_semester: data.price_per_semester?.toString() || "",
            booking_fee: data.booking_fee?.toString() || "",
            agent_fee_percentage: data.agent_fee_percentage?.toString() || "",
            book4me_fee: data.book4me_fee?.toString() || "0", // ✅ NEW: Load BOOK 4 Me fee
            availability: data.availability || "Available",
            verified: data.verified || false,
          });
          setImages(data.images || []);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        setMessage({ type: "error", text: "An unexpected error occurred" });
      } finally {
        setLoading(false);
      }
    };

    fetchHostel();
  }, [id]);

  // ✅ Handle input
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // ✅ Handle images from uploader
  const handleImageUploadComplete = (uploadedImages) => {
    setImages(uploadedImages);
  };

  // ✅ Save changes
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Required validation
    if (
      !formData.title ||
      !formData.location ||
      !formData.hostel_type ||
      !formData.price_per_semester ||
      !formData.booking_fee
    ) {
      setMessage({ type: "error", text: "Please fill all required fields." });
      return;
    }

    // ✅ If agent fee is entered but not numeric
    if (
      formData.agent_fee_percentage &&
      (isNaN(formData.agent_fee_percentage) ||
        formData.agent_fee_percentage < 0)
    ) {
      setMessage({ type: "error", text: "Agent Fee must be a valid number." });
      return;
    }

    // ✅ If BOOK 4 Me fee is entered but not numeric
    if (
      formData.book4me_fee &&
      (isNaN(formData.book4me_fee) || formData.book4me_fee < 0)
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
      const { error } = await supabase
        .from("hostels")
        .update({
          title: formData.title,
          location: formData.location,
          hostel_type: formData.hostel_type,
          description: formData.description,
          price_per_semester: parseFloat(formData.price_per_semester),
          booking_fee: parseFloat(formData.booking_fee),
          agent_fee_percentage: formData.agent_fee_percentage
            ? parseInt(formData.agent_fee_percentage)
            : null,
          book4me_fee: parseFloat(formData.book4me_fee) || 0, // ✅ NEW: Update BOOK 4 Me fee
          availability: formData.availability,
          verified: formData.verified,
          images: images,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        console.error("Update failed:", error);
        setMessage({
          type: "error",
          text: "❌ Update failed. Please try again.",
        });
      } else {
        setMessage({
          type: "success",
          text: "✅ Hostel updated successfully!",
        });
        setTimeout(() => router.push("/dashboard/admin/hostels"), 2000);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setMessage({ type: "error", text: "❌ An unexpected error occurred." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#142B6F] to-[#1A2D7A] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#FFD601] mx-auto mb-4"></div>
          <p className="text-blue-200 text-lg animate-pulse">
            Loading hostel details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#142B6F] to-[#1A2D7A] py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <button
            onClick={() => router.push("/dashboard/admin/hostels")}
            className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/10"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#FFD601]">
              Edit Hostel
            </h1>
            <p className="text-blue-200/80 text-sm mt-1">
              Update the details for {formData.title}
            </p>
          </div>
        </motion.div>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Grid Layout for Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-[#FFD601] font-semibold mb-3 text-lg">
                  Hostel Title *
                </label>
                <div className="relative">
                  <Building
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300"
                    size={20}
                  />
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#142B6F]/80 border-2 border-[#FFD601]/30 text-white placeholder-blue-300 focus:border-[#FFD601] focus:outline-none focus:ring-2 focus:ring-[#FFD601]/30 transition-all duration-200"
                    placeholder="Enter hostel name"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="md:col-span-2">
                <label className="block text-[#FFD601] font-semibold mb-3 text-lg">
                  Location *
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300"
                    size={20}
                  />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#142B6F]/80 border-2 border-[#FFD601]/30 text-white placeholder-blue-300 focus:border-[#FFD601] focus:outline-none focus:ring-2 focus:ring-[#FFD601]/30 transition-all duration-200"
                    placeholder="Enter hostel location"
                  />
                </div>
              </div>

              {/* Hostel Type */}
              <div className="md:col-span-2">
                <label className="block text-[#FFD601] font-semibold mb-3 text-lg">
                  Hostel Type *
                </label>
                <input
                  type="text"
                  name="hostel_type"
                  value={formData.hostel_type}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 2 in a room, Single room, Self contain"
                  className="w-full px-4 py-4 rounded-xl bg-[#142B6F]/80 border-2 border-[#FFD601]/30 text-white placeholder-blue-300 focus:border-[#FFD601] focus:outline-none focus:ring-2 focus:ring-[#FFD601]/30 transition-all duration-200"
                />
              </div>

              {/* Price per semester */}
              <div>
                <label className="block text-[#FFD601] font-semibold mb-3">
                  Price per Semester (₵) *
                </label>
                <div className="relative">
                  <DollarSign
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300"
                    size={20}
                  />
                  <input
                    type="number"
                    name="price_per_semester"
                    value={formData.price_per_semester}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#142B6F]/80 border-2 border-[#FFD601]/30 text-white placeholder-blue-300 focus:border-[#FFD601] focus:outline-none focus:ring-2 focus:ring-[#FFD601]/30 transition-all duration-200"
                    placeholder="0.00"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 font-semibold">
                    ₵
                  </span>
                </div>
              </div>

              {/* Booking Fee */}
              <div>
                <label className="block text-[#FFD601] font-semibold mb-3">
                  Booking Fee (₵) *
                </label>
                <div className="relative">
                  <DollarSign
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300"
                    size={20}
                  />
                  <input
                    type="number"
                    name="booking_fee"
                    value={formData.booking_fee}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#142B6F]/80 border-2 border-[#FFD601]/30 text-white placeholder-blue-300 focus:border-[#FFD601] focus:outline-none focus:ring-2 focus:ring-[#FFD601]/30 transition-all duration-200"
                    placeholder="0.00"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 font-semibold">
                    ₵
                  </span>
                </div>
              </div>

              {/* Agent Fee Percentage */}
              <div>
                <label className="block text-[#FFD601] font-semibold mb-3">
                  Agent Fee (%) (Optional)
                </label>
                <div className="relative">
                  <Percent
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300"
                    size={20}
                  />
                  <input
                    type="number"
                    name="agent_fee_percentage"
                    value={formData.agent_fee_percentage}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#142B6F]/80 border-2 border-[#FFD601]/30 text-white placeholder-blue-300 focus:border-[#FFD601] focus:outline-none focus:ring-2 focus:ring-[#FFD601]/30 transition-all duration-200"
                    placeholder="e.g., 8"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 font-semibold">
                    %
                  </span>
                </div>
              </div>

              {/* ✅ NEW: BOOK 4 Me Fee */}
              <div>
                <label className="block text-[#FFD601] font-semibold mb-3">
                  BOOK 4 Me Service Fee (₵)
                </label>
                <div className="relative">
                  <DollarSign
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300"
                    size={20}
                  />
                  <input
                    type="number"
                    name="book4me_fee"
                    value={formData.book4me_fee}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#142B6F]/80 border-2 border-[#FFD601]/30 text-white placeholder-blue-300 focus:border-[#FFD601] focus:outline-none focus:ring-2 focus:ring-[#FFD601]/30 transition-all duration-200"
                    placeholder="0.00"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 font-semibold">
                    ₵
                  </span>
                </div>
                <p className="text-blue-200 text-sm mt-2">
                  💡 Additional fee for "BOOK 4 Me" service when users can't
                  inspect in person
                </p>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-[#FFD601] font-semibold mb-3">
                  Availability Status
                </label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                  className="w-full px-4 py-4 rounded-xl bg-[#142B6F]/80 border-2 border-[#FFD601]/30 text-white focus:border-[#FFD601] focus:outline-none focus:ring-2 focus:ring-[#FFD601]/30 transition-all duration-200"
                >
                  <option value="Available" className="bg-[#142B6F]">
                    🟢 Available
                  </option>
                  <option value="Booked" className="bg-[#142B6F]">
                    🟡 Booked
                  </option>
                  <option value="Occupied" className="bg-[#142B6F]">
                    🔴 Occupied
                  </option>
                  <option value="Not Available" className="bg-[#142B6F]">
                    ⚫ Not Available
                  </option>
                  <option value="Coming Soon" className="bg-[#142B6F]">
                    🔵 Coming Soon
                  </option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[#FFD601] font-semibold mb-3 text-lg">
                Description & Amenities
              </label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                rows={5}
                placeholder="Describe hostel facilities, environment, amenities, nearby attractions, etc..."
                className="w-full px-4 py-4 rounded-xl bg-[#142B6F]/80 border-2 border-[#FFD601]/30 text-white placeholder-blue-300 focus:border-[#FFD601] focus:outline-none focus:ring-2 focus:ring-[#FFD601]/30 transition-all duration-200 resize-vertical"
              />
            </div>

            {/* Image Uploader */}
            <div className="bg-[#142B6F]/60 rounded-xl p-6 border-2 border-[#FFD601]/20">
              <div className="flex justify-between items-center mb-4">
                <label className="text-[#FFD601] font-semibold text-lg flex items-center gap-2">
                  <ImageIcon size={20} />
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

            {/* Verified toggle */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#142B6F]/60 border-2 border-[#FFD601]/20">
              <div className="relative">
                <input
                  type="checkbox"
                  name="verified"
                  checked={formData.verified}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div
                  className={`w-14 h-8 rounded-full transition-all duration-300 cursor-pointer ${
                    formData.verified ? "bg-[#FFD601]" : "bg-blue-400"
                  }`}
                  onClick={() =>
                    setFormData({ ...formData, verified: !formData.verified })
                  }
                >
                  <div
                    className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all duration-300 ${
                      formData.verified ? "left-7" : "left-1"
                    }`}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle
                  size={20}
                  className={
                    formData.verified ? "text-[#FFD601]" : "text-blue-300"
                  }
                />
                <span className="text-[#FFD601] font-semibold text-lg">
                  Verified Hostel
                </span>
              </div>
            </div>

            {/* Save Button */}
            <motion.button
              type="submit"
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              disabled={saving}
              className="w-full py-4 bg-gradient-to-r from-[#FFD601] to-[#FFE769] text-[#142B6F] font-bold rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center gap-3"
            >
              {saving ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>Save Changes</span>
                </>
              )}
            </motion.button>

            {/* Feedback Message */}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl text-center font-semibold border ${
                  message.type === "error"
                    ? "bg-red-500/20 text-red-200 border-red-500/30"
                    : "bg-green-500/20 text-green-200 border-green-500/30"
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
