"use client";

import { motion } from "framer-motion";
import { Video, MapPin, MessageCircle, Info } from "lucide-react";

const NAVY = "#142B6F";
const GOLD = "#FFD601";
const ADMIN_WHATSAPP = "233538171713"; // ✅ Clean WhatsApp number (no + sign)

export default function DistanceInfoPage() {
  const handleWhatsAppMessage = () => {
    const text = encodeURIComponent(
      `Hello, I would like to request a *Virtual Hostel Inspection* so the RoomQuest admin can visit the hostel and video call me to confirm.`
    );
    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${text}`);
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
          Can’t Inspect a Hostel in Person?
        </h1>
      </div>

      {/* Description */}
      <div className="space-y-5 text-gray-700 leading-relaxed">
        <p>
          Whether you’re in Accra or in another region, RoomQuest allows you to
          secure your preferred hostel <b>without being physically present.</b>
        </p>

        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-blue-800 text-sm">
          <ul className="list-disc pl-5 space-y-2">
            <li>We personally visit the hostel on your behalf.</li>
            <li>
              You’ll receive a{" "}
              <span className="font-semibold">live video call</span> to inspect
              the room in real time.
            </li>
            <li>
              Once you’re satisfied, we assist you in making payment directly to
              the property manager.
            </li>
            <li>
              A <span className="font-semibold">8% service charge</span> applies
              for this seamless assistance.
            </li>
          </ul>
        </div>

        <p className="text-gray-700">
          This service ensures you secure trusted hostels from anywhere, with
          video verification and property manager confirmation guaranteed.
        </p>

        <div className="flex items-center gap-3 text-gray-600 text-sm mt-2">
          <MapPin size={18} className="text-[#142B6F]" />
          <span>Ideal for users outside town or traveling.</span>
        </div>

        <div class-name="flex items-center gap-3 text-gray-600 text-sm">
          <Video size={18} className="text-[#142B6F]" />
          <span>Live video inspection and confirmation supported.</span>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-10 text-center">
        <p className="text-gray-600 mb-4">
          Need this service? Message the admin to schedule your virtual hostel
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
