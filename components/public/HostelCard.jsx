"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar } from "lucide-react";
import GalleryModal from "@/components/public/GalleryModal";

export default function HostelCard({ hostel }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  // ✅ Parse Cloudinary images (stored as JSON text)
  const images = Array.isArray(hostel.images)
    ? hostel.images
    : hostel.images
    ? JSON.parse(hostel.images)
    : [];

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
      >
        {/* 🖼️ Image Section */}
        <div
          className="relative h-56 cursor-pointer overflow-hidden"
          onClick={() => setIsModalOpen(true)}
        >
          {images.length > 0 ? (
            <img
              src={images[0]}
              alt={hostel.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
              No image available
            </div>
          )}

          {hostel.verified && (
            <div className="absolute top-3 right-3 bg-yellow-100 text-[#142B6F] text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 border border-[#FFD601]/40 shadow-sm">
              ⭐ Verified
            </div>
          )}
        </div>

        {/* 🧾 Content Section */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
            {hostel.title}
          </h3>

          <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
            <MapPin size={15} />
            <span>{hostel.location}</span>
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className="text-sm font-medium text-[#142B6F] bg-[#E9EEFF] px-3 py-1 rounded-full">
              {hostel.hostel_type || "Hostel"}
            </span>
            <div className="flex items-center gap-1 text-gray-500 text-xs">
              <Calendar size={13} />
              <span>
                {new Date(hostel.created_at).toLocaleDateString("en-US")}
              </span>
            </div>
          </div>

          <p className="text-gray-600 text-sm mt-3 line-clamp-2">
            {hostel.description}
          </p>

          <div className="mt-4 border-t border-gray-100 pt-3">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-gray-900">
                ₵{hostel.price_per_semester?.toLocaleString() || "—"}
                <span className="text-gray-500 text-sm ml-1">per semester</span>
              </p>
              <span className="text-xs font-medium bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                10% agent fee
              </span>
            </div>

            <div className="mt-2 bg-green-50 text-green-700 px-3 py-1 rounded-lg text-sm font-medium">
              {hostel.availability || "Unavailable"}
            </div>

            <a
              href={`/hostels/${hostel.id}`}
              className="mt-4 block text-center w-full bg-[#142B6F] text-white text-sm font-semibold py-2 rounded-lg hover:bg-[#1A2D7A] transition-all"
            >
              Book Now
            </a>
          </div>
        </div>
      </motion.div>

      {/* 🖼️ Modal */}
      <GalleryModal
        open={isModalOpen}
        images={images}
        index={currentImage}
        title={hostel.title || "Hostel Gallery"}
        onClose={() => setIsModalOpen(false)}
        onNext={nextImage}
        onPrev={prevImage}
      />
    </>
  );
}
