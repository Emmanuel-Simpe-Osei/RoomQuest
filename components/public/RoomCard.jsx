"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Home,
  Star,
  Calendar,
  X,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import { loadPaystack } from "@/lib/paystackLoader"; // ✅ Paystack loader util

const GOLD = "#FFD601";
const NAVY = "#142B6F";

// 🕓 Helper: how long ago
function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hrs = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor(diff / (1000 * 60));
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hrs > 0) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  if (mins > 0) return `${mins} min ago`;
  return "Just now";
}

export default function RoomCard({ room, onOpenGallery }) {
  const [showModal, setShowModal] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [userWhatsApp, setUserWhatsApp] = useState("");

  const occupied = room.availability === "Occupied";
  const booked = room.availability === "Booked";

  const handleBookNow = () => setShowModal(true);

  // ✅ PAYSTACK HANDLER
  const handlePayment = async () => {
    if (!room?.booking_price)
      return toast.error("No booking fee for this room.");
    if (!userWhatsApp.trim()) return toast.error("Enter your WhatsApp number.");
    setPaying(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      toast.error("Please log in first.");
      setPaying(false);
      return;
    }

    try {
      const PaystackPop = await loadPaystack();

      const handler = PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: user.email || "booking@roomquest.com",
        amount: room.booking_price * 100,
        currency: "GHS",
        reference: `RQ-${Date.now()}`,
        callback: async (response) => {
          toast.success("Payment successful!");
          setPaymentSuccess(true);

          const { error } = await supabase.from("bookings").insert([
            {
              user_id: user.id,
              room_id: room.id,
              whatsapp: userWhatsApp,
              status: "paid",
              reference: response.reference,
              created_at: new Date().toISOString(),
            },
          ]);

          if (error) {
            console.error("Booking save error:", error.message);
            toast.error("Could not save booking.");
          } else {
            console.log("✅ Booking saved successfully!");
          }

          setTimeout(() => {
            window.location.href = "/dashboard/user/bookings";
          }, 2500);
        },
        onClose: () => {
          toast("Payment window closed.");
          setPaying(false);
        },
        metadata: {
          custom_fields: [
            {
              display_name: "WhatsApp Number",
              variable_name: "whatsapp_number",
              value: userWhatsApp,
            },
            {
              display_name: "Room Title",
              variable_name: "room_title",
              value: room.title,
            },
          ],
        },
      });

      if (!handler || typeof handler.openIframe !== "function")
        throw new Error("Paystack handler not ready yet.");

      handler.openIframe();
    } catch (err) {
      console.error("Paystack error:", err);
      toast.error("Payment could not start. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  // ✅ Safe image parser (works with JSON or array)
  const parsedImages = (() => {
    if (Array.isArray(room.images)) return room.images;
    if (typeof room.images === "string") {
      try {
        return JSON.parse(room.images);
      } catch {
        return [room.images];
      }
    }
    return [];
  })();

  const handleImageClick = () => {
    if (!occupied) onOpenGallery?.(parsedImages, 0);
  };

  return (
    <>
      {/* 🏠 Room Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{
          y: -4,
          transition: { type: "spring", stiffness: 400, damping: 25 },
        }}
        className={`relative bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 transition-all duration-300 ${
          occupied ? "opacity-60 grayscale" : booked ? "opacity-80" : ""
        }`}
      >
        {/* Status badges */}
        {(occupied || booked) && (
          <div className="absolute top-3 left-3 z-10">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                occupied ? "bg-red-500 text-white" : "bg-yellow-500 text-white"
              }`}
            >
              {occupied ? "🚫 Occupied" : "📅 Booked"}
            </span>
          </div>
        )}

        {room.verified && (
          <div className="absolute top-3 right-3 z-10">
            <span className="flex items-center gap-1 bg-[#FFD601]/20 text-[#142B6F] px-3 py-1.5 rounded-full text-xs font-semibold border border-[#FFD601]/30">
              <Star size={12} fill="#FFD601" />
              Verified
            </span>
          </div>
        )}

        {/* Image */}
        <motion.div
          className={`relative h-48 ${
            occupied ? "cursor-not-allowed" : "cursor-pointer"
          }`}
          onClick={handleImageClick}
        >
          {parsedImages.length > 0 ? (
            <img
              src={parsedImages[0]}
              alt={room.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
              <Home size={32} className="mb-2" />
              <span className="text-sm">No images</span>
            </div>
          )}
        </motion.div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <h3 className="text-lg font-bold text-[#142B6F] line-clamp-2">
            {room.title}
          </h3>

          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <MapPin size={15} />
            <span>{room.location}</span>
          </div>

          {/* ✅ Description (now visible) */}
          {room.description && (
            <p className="text-gray-700 text-sm line-clamp-3">
              {room.description}
            </p>
          )}

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
              {room.type}
            </span>
            <div className="flex items-center gap-1 text-gray-500 text-xs">
              <Calendar size={12} />
              {timeAgo(room.created_at)}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-xl font-bold text-[#142B6F]">₵{room.price}</p>
              <p className="text-xs text-gray-500">per month</p>
            </div>

            {room.booking_price && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm flex justify-between">
                <span className="text-green-700 font-medium">Booking Fee</span>
                <span className="text-green-800 font-bold">
                  ₵{room.booking_price}
                </span>
              </div>
            )}

            {!occupied && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBookNow}
                className="w-full py-3 rounded-xl font-semibold shadow-md bg-[#142B6F] text-white hover:bg-[#1A2D7A]"
              >
                Book Now
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* 💳 Booking Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X size={22} />
              </button>

              {paymentSuccess ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <CheckCircle2 size={60} className="text-green-500 mb-3" />
                  <h3 className="text-xl font-bold text-green-700">
                    Payment Successful!
                  </h3>
                  <p className="text-gray-600 text-center mt-2">
                    Your booking has been confirmed. Redirecting...
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-3 text-center text-[#142B6F]">
                    Confirm Booking
                  </h2>
                  <p className="text-gray-600 text-center mb-5">
                    Pay a one-time{" "}
                    <span className="font-semibold text-[#142B6F]">
                      Service & Agent Fee
                    </span>{" "}
                    of{" "}
                    <span className="text-[#FFD601] font-bold">
                      ₵{room.booking_price}
                    </span>
                    .
                  </p>

                  <input
                    type="tel"
                    placeholder="Enter your WhatsApp number"
                    value={userWhatsApp}
                    onChange={(e) => setUserWhatsApp(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-[#FFD601]/60"
                  />

                  <motion.button
                    whileHover={!paying ? { scale: 1.02 } : {}}
                    whileTap={!paying ? { scale: 0.98 } : {}}
                    onClick={!paying ? handlePayment : undefined}
                    disabled={paying}
                    className="w-full flex justify-center items-center gap-2 bg-[#FFD601] text-[#142B6F] py-3 rounded-xl font-semibold hover:bg-[#ffde33] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-70"
                  >
                    {paying ? (
                      <>
                        <Loader2 className="animate-spin w-5 h-5" />
                        Processing Payment...
                      </>
                    ) : (
                      "Confirm & Pay"
                    )}
                  </motion.button>

                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full text-gray-500 text-sm mt-3 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
