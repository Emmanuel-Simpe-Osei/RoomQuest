"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Calendar,
  X,
  Loader2,
  CheckCircle2,
  LogIn,
  Home,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const NAVY = "#142B6F";

/* -----------------------------------------------------
   ✅ Safe Paystack Loader
------------------------------------------------------ */
async function loadPaystack() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject("Window unavailable");
    if (window.PaystackPop && typeof window.PaystackPop.setup === "function")
      return resolve(window.PaystackPop);

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => {
      if (window.PaystackPop && typeof window.PaystackPop.setup === "function")
        resolve(window.PaystackPop);
      else reject("Paystack failed to initialize");
    };
    script.onerror = () => reject("Paystack script failed to load");
    document.body.appendChild(script);
  });
}

export default function RoomCard({ room, onOpenGallery }) {
  const router = useRouter();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [authPrompt, setAuthPrompt] = useState(false);
  const [userWhatsApp, setUserWhatsApp] = useState("");
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const occupied = room.availability === "Occupied";

  const parsedImages = Array.isArray(room?.images)
    ? room.images
    : room?.images
    ? JSON.parse(room.images)
    : [];

  /* -----------------------------------------------------
     ✅ Save Booking to Supabase After Payment
  ------------------------------------------------------ */
  const handlePaymentSuccess = async (response, user) => {
    try {
      const { error } = await supabase.from("bookings").insert([
        {
          user_id: user.id,
          room_id: room.id,
          whatsapp: userWhatsApp,
          status: "paid",
          reference: response.reference,
          amount: room.booking_price || 197,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error(error);
        toast.error("Payment saved with issues. Please contact support.");
      } else {
        toast.success("Payment successful! Redirecting...");
      }

      setPaymentSuccess(true);
      setTimeout(() => {
        setShowBookingModal(false);
        setPaymentSuccess(false);
        router.push("/dashboard/user/bookings");
      }, 2000);
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error during saving.");
    }
  };

  /* -----------------------------------------------------
     ✅ Handle Paystack Payment
  ------------------------------------------------------ */
  const handlePayment = async () => {
    if (!userWhatsApp.trim())
      return toast.error("Please enter your WhatsApp number.");
    setPaying(true);

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      setAuthPrompt(true);
      setPaying(false);
      return;
    }

    try {
      const PaystackPop = await loadPaystack();
      const handler = PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: user.email || "booking@roomquest.com",
        amount: (room.booking_price || 197) * 100,
        currency: "GHS",
        reference: `RQ-ROOM-${Date.now()}`,
        callback: (response) => handlePaymentSuccess(response, user),
        onClose: () => {
          if (!paymentSuccess) toast("Payment window closed.");
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
              display_name: "Room Name",
              variable_name: "room_name",
              value: room.title,
            },
          ],
        },
      });

      handler.openIframe();
    } catch (err) {
      toast.error("Payment could not be started.");
      console.error(err);
      setPaying(false);
    }
  };

  /* -----------------------------------------------------
     ✅ Booking Button Action
  ------------------------------------------------------ */
  const handleBookNow = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data?.user) return setAuthPrompt(true);
    setShowBookingModal(true);
  };

  return (
    <>
      {/* 🏠 Room Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
      >
        <div
          className={`relative h-56 ${
            occupied
              ? "cursor-not-allowed grayscale opacity-60"
              : "cursor-pointer"
          }`}
          onClick={() => !occupied && onOpenGallery?.(parsedImages, 0)}
        >
          {parsedImages.length > 0 ? (
            <img
              src={parsedImages[0]}
              alt={room.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
              <Home size={24} className="mr-1" /> No image
            </div>
          )}

          {room.verified && (
            <div className="absolute top-3 right-3 bg-yellow-100 text-[#142B6F] text-xs font-semibold px-3 py-1 rounded-full">
              ⭐ Verified
            </div>
          )}
        </div>

        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-900">{room.title}</h3>

          <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
            <MapPin size={15} />
            <span>{room.location}</span>
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className="text-sm font-medium text-[#142B6F] bg-[#E9EEFF] px-3 py-1 rounded-full">
              {room.type || "Room"}
            </span>
            <div className="flex items-center gap-1 text-gray-500 text-xs">
              <Calendar size={13} />
              <span>{new Date(room.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          <p className="text-gray-600 text-sm mt-3 line-clamp-2">
            {room.description}
          </p>

          <div className="mt-4 border-t border-gray-100 pt-3">
            <p className="text-lg font-semibold text-gray-900">
              ₵{room.price?.toLocaleString() || "—"}
              <span className="text-gray-500 text-sm ml-1">/ month</span>
            </p>

            <div className="mt-2 bg-green-50 text-green-700 px-3 py-1 rounded-lg text-sm font-medium">
              Booking Fee: ₵{room.booking_price || 197}
            </div>

            <button
              onClick={handleBookNow}
              disabled={occupied}
              className={`mt-4 w-full text-center text-white text-sm font-semibold py-2 rounded-lg transition-all ${
                occupied
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#142B6F] hover:bg-[#1A2D7A]"
              }`}
            >
              Book Now
            </button>
          </div>
        </div>
      </motion.div>

      {/* 💳 Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg relative text-center"
            >
              {!paymentSuccess && (
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                  disabled={paying}
                >
                  <X size={20} />
                </button>
              )}

              {paymentSuccess ? (
                <div className="py-6 flex flex-col items-center">
                  <CheckCircle2 className="text-green-500 mb-3" size={60} />
                  <h3 className="text-lg font-bold text-green-700">
                    Payment Successful!
                  </h3>
                  <p className="text-gray-600 text-sm mt-2">
                    Booking confirmed 🎉 Redirecting...
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-[#142B6F] mb-2">
                    Confirm Booking
                  </h2>

                  <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm text-left">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking Fee:</span>
                      <span className="font-semibold text-[#142B6F]">
                        ₵{room.booking_price || 197}
                      </span>
                    </div>
                  </div>

                  <input
                    type="tel"
                    placeholder="Enter your WhatsApp number"
                    value={userWhatsApp}
                    onChange={(e) => setUserWhatsApp(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm mb-4"
                    disabled={paying}
                  />

                  <motion.button
                    disabled={paying || !userWhatsApp.trim()}
                    onClick={handlePayment}
                    className="w-full bg-[#FFD601] text-[#142B6F] font-semibold py-3 rounded-lg hover:bg-[#ffdf3b] transition-all duration-200 flex justify-center items-center gap-2 disabled:opacity-60"
                  >
                    {paying ? (
                      <>
                        <Loader2 className="animate-spin w-5 h-5" />{" "}
                        Processing...
                      </>
                    ) : (
                      `Pay ₵${room.booking_price || 197}`
                    )}
                  </motion.button>

                  <button
                    onClick={() => setShowBookingModal(false)}
                    disabled={paying}
                    className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔐 Login Prompt Modal */}
      <AnimatePresence>
        {authPrompt && (
          <motion.div
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-gray-100"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <LogIn className="text-[#142B6F] w-12 h-12 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-[#142B6F] mb-2">
                Login Required
              </h2>
              <p className="text-gray-600 text-sm mb-5">
                You need to log in or create an account before booking a room.
              </p>

              <button
                onClick={() => router.push("/login")}
                className="w-full bg-[#142B6F] text-white font-semibold py-2 rounded-lg hover:bg-[#1A2D7A] transition-all"
              >
                Log In / Sign Up
              </button>

              <button
                onClick={() => setAuthPrompt(false)}
                className="w-full mt-3 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
