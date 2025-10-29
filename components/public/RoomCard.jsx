"use client";

import { useState, useEffect } from "react";
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

const GOLD = "#FFD601";
const NAVY = "#142B6F";

// 🕓 Helper: Format how long ago a room was posted
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
  const [showModal, setShowModal] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [userWhatsApp, setUserWhatsApp] = useState("");
  const [paystackReady, setPaystackReady] = useState(false);

  // ✅ Load Paystack SDK safely once
  useEffect(() => {
    const scriptId = "paystack-js";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.onload = () => setPaystackReady(true);
      document.body.appendChild(script);
    } else {
      setPaystackReady(true);
    }
  }, []);

  const occupied = room.availability === "Occupied";
  const booked = room.availability === "Booked";

  const handleBookNow = () => setShowModal(true);

  // ✅ Handle Paystack payment (fixed with currency GHS)
  const handlePayment = () => {
    if (!room?.booking_price) {
      toast.error("No booking fee found for this room.");
      return;
    }

    if (!userWhatsApp.trim()) {
      toast.error("Please enter your WhatsApp number.");
      return;
    }

    if (!paystackReady || typeof window.PaystackPop === "undefined") {
      toast.error("Payment service not loaded yet. Try again shortly.");
      return;
    }

    setPaying(true);

    // Confirm env key loaded
    console.log(
      "Using Paystack key:",
      process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
    );

    // ✅ Define safe callbacks
    function onPaymentSuccess(response) {
      toast.success("Payment successful!");
      setPaymentSuccess(true);

      // Save booking to Supabase (or your backend)
      fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_id: room.id,
          amount: room.booking_price,
          reference: response.reference,
          whatsapp: userWhatsApp,
        }),
      }).catch((err) => console.error("Booking save failed:", err));

      setTimeout(() => {
        window.location.href = "/dashboard/user";
      }, 2500);
    }

    function onPaymentClose() {
      toast("Payment window closed.");
      setPaying(false);
    }

    try {
      const paystack = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: "booking@roomquest.com", // Required
        amount: room.booking_price * 100,
        currency: "GHS", // ✅ Force Ghana Cedis currency
        reference: `RQ-${Date.now()}`,
        callback: onPaymentSuccess,
        onClose: onPaymentClose,
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
      paystack.openIframe();
    } catch (err) {
      console.error("Paystack init error:", err);
      toast.error("Something went wrong initializing payment.");
      setPaying(false);
    }
  };

  const handleImageClick = () => {
    if (!occupied) onOpenGallery?.(room.images || [], 0);
  };

  return (
    <>
      {/* 🏠 Room Card */}
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

        {/* Image */}
        <motion.div
          className={`relative h-48 overflow-hidden ${
            occupied ? "cursor-not-allowed" : "cursor-pointer group"
          }`}
          onClick={handleImageClick}
        >
          {room.images?.length ? (
            <img
              src={room.images[0]}
              alt={room.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
              <Home size={32} className="mb-2" />
              <span className="text-sm">No images</span>
            </div>
          )}
        </motion.div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <h3 className="text-xl font-bold text-gray-900 line-clamp-2 mb-2">
            {room.title}
          </h3>
          <div className="flex items-start gap-2 text-gray-600">
            <MapPin size={16} className="mt-0.5 flex-shrink-0" />
            <span className="text-sm line-clamp-2">{room.location}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-200">
              {room.type === "Other" ? room.customType || "Custom" : room.type}
            </span>
            <div className="flex items-center gap-1 text-gray-500 text-xs">
              <Calendar size={12} />
              {timeAgo(room.created_at)}
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold" style={{ color: NAVY }}>
                  ₵{room.price}
                </p>
                <p className="text-sm text-gray-600">per month</p>
              </div>
              <div
                className="text-xs px-3 py-2 rounded-xl font-medium backdrop-blur-sm border"
                style={{
                  backgroundColor: `${GOLD}15`,
                  color: NAVY,
                  borderColor: `${GOLD}40`,
                }}
              >
                <div className="font-semibold">10% agent fee</div>
              </div>
            </div>

            {room.booking_price && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-800 font-medium">
                    Booking Fee
                  </span>
                  <span className="text-green-700 font-bold">
                    ₵{room.booking_price}
                  </span>
                </div>
              </div>
            )}

            {!occupied && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBookNow}
                className="w-full bg-[#142B6F] text-white py-3 rounded-xl font-semibold hover:bg-[#1A2D7A] transition-all duration-200 shadow-lg hover:shadow-xl"
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
                  <h2
                    className="text-2xl font-bold mb-3 text-center"
                    style={{ color: NAVY }}
                  >
                    Confirm Booking
                  </h2>
                  <p className="text-gray-600 text-center mb-5">
                    Pay a one-time{" "}
                    <span className="font-semibold text-[#142B6F]">
                      Service & Agent Viewing Fee
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
