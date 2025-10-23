"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Star,
  Edit2,
  Trash2,
  X,
  ExternalLink,
} from "lucide-react";

const NAVY = "#142B6F";
const GOLD = "#FFD601";

export default function HostelsPage() {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);

  // ✅ Fetch hostels
  useEffect(() => {
    const fetchHostels = async () => {
      const { data, error } = await supabase
        .from("hostels")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) console.error("Error fetching hostels:", error);
      else setHostels(data || []);
      setLoading(false);
    };
    fetchHostels();
  }, []);

  // ✅ Delete handler
  const handleDelete = async (id, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    const { error } = await supabase.from("hostels").delete().eq("id", id);
    if (error) alert("❌ Delete failed, try again.");
    else setHostels(hostels.filter((h) => h.id !== id));
  };

  // ✅ Modal controls
  const openGallery = (images, index = 0) => {
    setSelectedImages(images);
    setCurrentIndex(index);
    setShowModal(true);
  };

  const closeGallery = () => setShowModal(false);

  const nextImage = () =>
    setCurrentIndex((prev) => (prev + 1) % selectedImages.length);

  const prevImage = () =>
    setCurrentIndex(
      (prev) => (prev - 1 + selectedImages.length) % selectedImages.length
    );

  // ✅ Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showModal) return;

      if (e.key === "Escape") closeGallery();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showModal, selectedImages.length]);

  // ✅ Image Carousel for Card
  const CardImageCarousel = ({ images, hostelId, onImageClick }) => {
    const [currentImgIndex, setCurrentImgIndex] = useState(0);

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      touchStartX = touch.clientX;
    };

    const handleTouchEnd = (e) => {
      const touch = e.changedTouches[0];
      const diff = touchStartX - touch.clientX;

      if (Math.abs(diff) > 50) {
        // Minimum swipe distance
        if (diff > 0 && images.length > 1) {
          // Swipe left - next image
          setCurrentImgIndex((prev) => (prev + 1) % images.length);
        } else if (diff < 0 && images.length > 1) {
          // Swipe right - previous image
          setCurrentImgIndex(
            (prev) => (prev - 1 + images.length) % images.length
          );
        }
      }
    };

    let touchStartX = 0;

    return (
      <div
        className="relative h-48 bg-gradient-to-br from-[#0B1D6A] to-[#142B6F] overflow-hidden cursor-pointer group"
        onClick={() => onImageClick(images, currentImgIndex)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {images && images.length > 0 ? (
          <>
            <motion.img
              key={currentImgIndex}
              src={images[currentImgIndex]}
              alt={`Hostel image ${currentImgIndex + 1}`}
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />

            {/* Overlay with expand icon */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 text-white p-2 rounded-full">
                <ExternalLink size={20} />
              </div>
            </div>

            {/* Image counter */}
            {images.length > 1 && (
              <div className="absolute top-3 right-3 bg-black/60 text-white px-2 py-1 rounded-full text-xs font-medium">
                {currentImgIndex + 1}/{images.length}
              </div>
            )}

            {/* Dot indicators */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1.5">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImgIndex(index);
                    }}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                      index === currentImgIndex
                        ? "bg-[#FFD601] scale-125"
                        : "bg-white/60 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Swipe hint for mobile */}
            {images.length > 1 && (
              <div className="sm:hidden absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                ← Swipe →
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-blue-200/60">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-blue-400/20 rounded-full flex items-center justify-center">
                <span className="text-xl">🏠</span>
              </div>
              <p className="text-sm">No Images</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#142B6F] to-[#1A2D7A] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#FFD601] mb-2">
            Hostel Management
          </h1>
          <p className="text-blue-200/80 text-sm">
            Manage and view all hostels in your system
          </p>
        </div>
        <Link
          href="/dashboard/admin/hostels/add"
          className="bg-[#FFD601] text-[#142B6F] font-semibold px-6 py-3 rounded-xl hover:bg-[#FFE769] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          <span className="text-lg">+</span>
          Add New Hostel
        </Link>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD601]"></div>
        </div>
      ) : hostels.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-4 bg-blue-400/20 rounded-full flex items-center justify-center">
            <span className="text-4xl">🏠</span>
          </div>
          <h3 className="text-xl font-semibold text-blue-200 mb-2">
            No Hostels Yet
          </h3>
          <p className="text-blue-200/60 mb-6">
            Get started by adding your first hostel
          </p>
          <Link
            href="/dashboard/admin/hostels/add"
            className="bg-[#FFD601] text-[#142B6F] font-semibold px-6 py-3 rounded-xl hover:bg-[#FFE769] transition-all inline-flex items-center gap-2"
          >
            <span>+</span>
            Add Your First Hostel
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {hostels.map((hostel, index) => (
            <motion.div
              key={hostel.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              {/* Image Carousel */}
              <CardImageCarousel
                images={hostel.images || []}
                hostelId={hostel.id}
                onImageClick={openGallery}
              />

              {/* Hostel Details */}
              <div className="p-5">
                {/* Title and Location */}
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                    {hostel.title}
                  </h3>
                  <div className="flex items-start gap-2 text-blue-200/80 mb-2">
                    <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                    <span className="text-sm line-clamp-2">
                      {hostel.location}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {hostel.description && (
                  <p className="text-blue-200/70 text-sm mb-3 line-clamp-2">
                    {hostel.description}
                  </p>
                )}

                {/* Type and Price */}
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                    {hostel.hostel_type}
                  </span>
                  <div className="text-right">
                    <p className="text-xl font-bold text-[#FFD601]">
                      ₵{hostel.price_per_semester}
                    </p>
                    <p className="text-xs text-blue-200/60">per semester</p>
                  </div>
                </div>

                {/* Status and Verification */}
                <div className="flex justify-between items-center mb-4 pt-3 border-t border-white/10">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      hostel.availability === "Available"
                        ? "bg-green-500/30 text-green-300 border border-green-500/30"
                        : "bg-red-500/30 text-red-300 border border-red-500/30"
                    }`}
                  >
                    {hostel.availability}
                  </span>

                  {hostel.verified && (
                    <span className="flex items-center gap-1.5 bg-[#FFD601]/20 text-[#FFD601] px-3 py-1 rounded-full text-xs font-semibold border border-[#FFD601]/30">
                      <Star size={12} fill="#FFD601" />
                      Verified
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3 border-t border-white/10">
                  <Link
                    href={`/dashboard/admin/hostels/edit/${hostel.id}`}
                    className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 hover:text-white font-medium py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                  >
                    <Edit2 size={14} />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(hostel.id, hostel.title)}
                    className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-white font-medium py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 🖼️ Full-Screen Image Modal */}
      <AnimatePresence>
        {showModal && selectedImages.length > 0 && (
          <motion.div
            className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeGallery}
          >
            {/* Modal Content */}
            <div className="relative w-full max-w-6xl max-h-[90vh] flex flex-col items-center">
              {/* Close Button */}
              <button
                onClick={closeGallery}
                className="absolute -top-16 right-0 text-white hover:text-[#FFD601] transition-colors duration-200 p-2 z-10"
              >
                <X size={32} />
              </button>

              {/* Main Image */}
              <div
                className="relative w-full h-full flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.img
                  key={currentIndex}
                  src={selectedImages[currentIndex]}
                  alt={`Gallery image ${currentIndex + 1}`}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                />

                {/* Navigation Arrows */}
                {selectedImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 hover:scale-110"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 hover:scale-110"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>

              {/* Image Counter */}
              {selectedImages.length > 1 && (
                <div className="mt-4 text-white/80 text-lg font-medium">
                  {currentIndex + 1} / {selectedImages.length}
                </div>
              )}

              {/* Thumbnail Strip */}
              {selectedImages.length > 1 && (
                <div className="mt-4 flex gap-2 max-w-full overflow-x-auto py-2 px-4">
                  {selectedImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentIndex(index);
                      }}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        index === currentIndex
                          ? "border-[#FFD601] scale-110"
                          : "border-white/30 hover:border-white/50"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Instructions */}
              <div className="mt-4 text-white/60 text-sm text-center">
                Click outside image or press ESC to close • Use arrow keys to
                navigate
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
