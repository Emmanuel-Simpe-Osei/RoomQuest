"use client";

import { motion } from "framer-motion";
import { MapPin, Home, Star, Calendar, ExternalLink, Eye } from "lucide-react";

const GOLD = "#FFD601";
const NAVY = "#142B6F";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const sec = Math.floor(diffMs / 1000);
  const min = Math.floor(sec / 60);
  const hrs = Math.floor(min / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hrs > 0) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  if (min > 0) return `${min} min ago`;
  return "Just now";
}

export default function RoomCard({ room, onOpenGallery }) {
  const occupied = room.availability === "Occupied";
  const booked = room.availability === "Booked";

  const handleImageClick = () => {
    if (!occupied) {
      onOpenGallery?.(room.images || [], 0);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{
        y: -4,
        transition: { type: "spring", stiffness: 400, damping: 25 },
      }}
      className={`relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 ${
        occupied
          ? "opacity-60 grayscale"
          : booked
          ? "opacity-80"
          : "opacity-100"
      }`}
    >
      {/* Status Badge */}
      {(occupied || booked) && (
        <div className="absolute top-3 left-3 z-10">
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm ${
              occupied
                ? "bg-red-500/90 text-white"
                : "bg-yellow-500/90 text-white"
            }`}
          >
            {occupied ? "🚫 Occupied" : "📅 Booked"}
          </span>
        </div>
      )}

      {/* Verified Badge */}
      {room.verified && (
        <div className="absolute top-3 right-3 z-10">
          <span className="flex items-center gap-1 bg-[#FFD601]/20 backdrop-blur-sm text-[#142B6F] px-3 py-1.5 rounded-full text-xs font-semibold border border-[#FFD601]/30">
            <Star size={12} fill="#FFD601" />
            Verified
          </span>
        </div>
      )}

      {/* Image Section */}
      <motion.div
        className={`relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden ${
          occupied ? "cursor-not-allowed" : "cursor-pointer group"
        }`}
        onClick={handleImageClick}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        {room.images?.length ? (
          <>
            <img
              src={room.images[0]}
              alt={room.title}
              className="w-full h-full object-cover"
            />
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileHover={{ opacity: 1, scale: 1 }}
                className="bg-black/60 text-white p-3 rounded-full backdrop-blur-sm"
              >
                <Eye size={20} />
              </motion.div>
            </div>

            {/* Image Counter */}
            {room.images.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/60 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                +{room.images.length - 1}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <Home size={32} className="mb-2" />
            <span className="text-sm">No images</span>
          </div>
        )}
      </motion.div>

      {/* Content Section */}
      <div className="p-5 space-y-4">
        {/* Title and Location */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 line-clamp-2 mb-2">
            {room.title}
          </h3>
          <div className="flex items-start gap-2 text-gray-600">
            <MapPin size={16} className="mt-0.5 flex-shrink-0" />
            <span className="text-sm line-clamp-2">{room.location}</span>
          </div>
        </div>

        {/* Description */}
        {room.description && (
          <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
            {room.description}
          </p>
        )}

        {/* Room Type */}
        <div className="flex items-center justify-between">
          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-200">
            {room.type === "Other" ? room.customType || "Custom" : room.type}
          </span>

          {/* Time Ago */}
          <div className="flex items-center gap-1 text-gray-500 text-xs">
            <Calendar size={12} />
            {timeAgo(room.created_at)}
          </div>
        </div>

        {/* Price and Booking Section */}
        <div className="space-y-3 pt-3 border-t border-gray-100">
          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold" style={{ color: NAVY }}>
                ₵{room.price}
              </p>
              <p className="text-sm text-gray-600">per month</p>
            </div>

            {/* Agent Fee Badge */}
            <div
              className="text-xs px-3 py-2 rounded-xl font-medium backdrop-blur-sm border"
              style={{
                backgroundColor: `${GOLD}15`,
                color: NAVY,
                borderColor: `${GOLD}40`,
              }}
            >
              <div className="font-semibold">10% agent fee</div>
              <div className="text-[10px] opacity-75">applies on booking</div>
            </div>
          </div>

          {/* Booking Price */}
          {room.booking_price && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-800 font-medium">Booking Fee</span>
                <span className="text-green-700 font-bold">
                  ₵{room.booking_price}
                </span>
              </div>
            </div>
          )}

          {/* Payment Mode */}
          {room.payment_mode && (
            <div className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2 border border-gray-200">
              💰 {room.payment_mode}
            </div>
          )}

          {/* Action Buttons */}
          {!occupied && (
            <motion.div
              className="flex gap-2 pt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-[#142B6F] text-white py-3 rounded-xl font-semibold hover:bg-[#1A2D7A] transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {booked ? "View Details" : "Book Now"}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleImageClick}
                className="px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
              >
                <ExternalLink size={16} />
              </motion.button>
            </motion.div>
          )}

          {/* Occupied Message */}
          {occupied && (
            <div className="text-center py-3 bg-gray-100 rounded-xl">
              <p className="text-gray-600 text-sm font-medium">
                This room is currently occupied
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Availability Indicator */}
      <div
        className={`absolute bottom-4 right-4 w-3 h-3 rounded-full ${
          room.availability === "Available"
            ? "bg-green-500 animate-pulse"
            : room.availability === "Booked"
            ? "bg-yellow-500"
            : "bg-red-500"
        }`}
      />
    </motion.div>
  );
}
