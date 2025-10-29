"use client";

import { motion } from "framer-motion";
import { MapPin, Star, Building2 } from "lucide-react";

const NAVY = "#142B6F";
const GOLD = "#FFD601";

export default function HostelCard({ hostel }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        {hostel.image_urls?.length ? (
          <img
            src={hostel.image_urls[0]}
            alt={hostel.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
            <Building2 size={34} className="mb-1" />
            <p className="text-sm">No image</p>
          </div>
        )}

        {hostel.verified && (
          <div className="absolute top-3 right-3 z-10">
            <span className="flex items-center gap-1 bg-[#FFD601]/20 text-[#142B6F] px-3 py-1.5 rounded-full text-xs font-semibold border border-[#FFD601]/30">
              <Star size={12} fill="#FFD601" />
              Verified
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
          {hostel.name}
        </h3>

        <div className="flex items-center gap-2 text-gray-600">
          <MapPin size={15} />
          <span className="text-sm line-clamp-1">
            {hostel.location || "Location unavailable"}
          </span>
        </div>

        <p className="text-gray-600 text-sm line-clamp-2">
          {hostel.description || "No description provided."}
        </p>

        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {hostel.rooms_count
              ? `${hostel.rooms_count} room${hostel.rooms_count > 1 ? "s" : ""}`
              : "Room count unavailable"}
          </span>

          <a
            href={`/rooms?hostel_id=${hostel.id}`}
            className="px-4 py-2 bg-[#142B6F] text-white text-sm font-semibold rounded-lg hover:bg-[#1A2D7A] transition-all"
          >
            View Rooms
          </a>
        </div>
      </div>
    </motion.div>
  );
}
