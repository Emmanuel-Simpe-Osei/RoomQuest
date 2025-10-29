"use client";

import { motion } from "framer-motion";
import { Video, MapPin, MessageCircle, Info } from "lucide-react";

const NAVY = "#142B6F";
const GOLD = "#FFD601";
const ADMIN_WHATSAPP = "+233501234567"; // ✅ Replace with your business WhatsApp number

export default function DistanceInfoPage() {
  const handleWhatsAppMessage = () => {
    const text = encodeURIComponent(
      `Hello, I booked a room on RoomQuest but I'm currently not in town. I'd like to request a *Virtual Room Viewing Assistance* so you can check the place and video call me to confirm.`
    );
    window.open(
      `https://wa.me/${ADMIN_WHATSAPP.replace("+", "")}?text=${text}`
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto bg-white border border-gray-100 rounded-2xl shadow-sm p-8 mt-5"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-[#FFD601]/30 flex items-center justify-center">
          <Info size={24} className="text-[#142B6F]" />
        </div>
        <h1 className="text-2xl font-bold text-[#142B6F]">
          Booking From a Distance
        </h1>
      </div>

      {/* Description */}
      <div className="space-y-5 text-gray-700 leading-relaxed">
        <p>
          If you're unable to meet within{" "}
          <span className="font-semibold">24 hours</span> for room viewing due
          to travel or distance, RoomQuest has you covered.
        </p>

        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-blue-800 text-sm">
          <ul className="list-disc pl-5 space-y-2">
            <li>The admin can personally visit the room on your behalf.</li>
            <li>
              You’ll receive a{" "}
              <span className="font-semibold">live video call</span> showing the
              room clearly.
            </li>
            <li>
              Once you confirm your interest, the admin can help make the
              payment to the landlord.
            </li>
            <li>
              A <span className="font-semibold">10% service charge</span> still
              applies for this process.
            </li>
          </ul>
        </div>

        <div className="flex items-center gap-3 text-gray-600 text-sm mt-5">
          <MapPin size={18} className="text-[#142B6F]" />
          <span>
            Available for long-distance users and out-of-town bookings.
          </span>
        </div>

        <div className="flex items-center gap-3 text-gray-600 text-sm">
          <Video size={18} className="text-[#142B6F]" />
          <span>
            Video call verification and landlord confirmation supported.
          </span>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-10 text-center">
        <p className="text-gray-600 mb-4">
          Need this service? Message the admin directly to arrange your virtual
          viewing.
        </p>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleWhatsAppMessage}
          className="flex items-center justify-center mx-auto gap-2 bg-[#25D366] text-white py-3 px-6 rounded-xl font-semibold shadow-md hover:bg-[#1ebe5c] transition-all"
        >
          <MessageCircle size={18} />
          Message Admin on WhatsApp
        </motion.button>
      </div>
    </motion.div>
  );
}
