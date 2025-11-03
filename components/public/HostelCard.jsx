"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, X, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import GalleryModal from "@/components/public/GalleryModal";

const NAVY = "#142B6F";
const GOLD = "#FFD601";

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

/* -----------------------------------------------------
   🏠 HostelCard Component
------------------------------------------------------ */
export default function HostelCard({ hostel }) {
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [userWhatsApp, setUserWhatsApp] = useState("");
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // ✅ Parse Cloudinary images safely
  const images = Array.isArray(hostel?.images)
    ? hostel.images
    : hostel?.images
    ? JSON.parse(hostel.images)
    : [];

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

  /* -----------------------------------------------------
     🔄 Redirect Effect
  ------------------------------------------------------ */
  useEffect(() => {
    if (paymentSuccess && showBookingModal) {
      const redirectTimer = setTimeout(() => {
        // Close modal first
        setShowBookingModal(false);
        setPaymentSuccess(false);
        setPaying(false);

        // Redirect to bookings page
        router.push("/dashboard/user/bookings");
      }, 2000);

      return () => clearTimeout(redirectTimer);
    }
  }, [paymentSuccess, showBookingModal, router]);

  /* -----------------------------------------------------
     ✅ Separate function for payment success handling
  ------------------------------------------------------ */
  const handlePaymentSuccess = async (response, user) => {
    try {
      // ✅ Save booking in Supabase
      const { error } = await supabase.from("hostel_bookings").insert([
        {
          user_id: user.id,
          hostel_id: hostel.id,
          whatsapp: userWhatsApp,
          status: "paid",
          reference: response.reference,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("Booking save error:", error.message);
        toast.error(
          "Payment successful but booking save failed. Please contact support."
        );
        setPaying(false);
        return;
      }

      // ✅ Trigger success state to start redirect
      setPaymentSuccess(true);
      toast.success("Payment successful! Redirecting to bookings...");
    } catch (err) {
      console.error("Post-payment error:", err);
      toast.error(
        "Payment successful but something went wrong. You will be redirected."
      );
      setPaymentSuccess(true);
    }
  };

  /* -----------------------------------------------------
     💳 Paystack Payment + Supabase Save
  ------------------------------------------------------ */
  const handlePayment = async () => {
    if (!hostel?.booking_fee)
      return toast.error("No booking fee for this hostel.");
    if (!userWhatsApp.trim())
      return toast.error("Please enter your WhatsApp number.");

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
        amount: hostel.booking_fee * 100,
        currency: "GHS",
        reference: `RQ-HOSTEL-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        callback: (response) => {
          handlePaymentSuccess(response, user);
        },
        onClose: () => {
          if (!paymentSuccess) {
            toast("Payment window closed.");
            setPaying(false);
          }
        },
        metadata: {
          custom_fields: [
            {
              display_name: "WhatsApp Number",
              variable_name: "whatsapp_number",
              value: userWhatsApp,
            },
            {
              display_name: "Hostel Name",
              variable_name: "hostel_name",
              value: hostel.title,
            },
            {
              display_name: "User ID",
              variable_name: "user_id",
              value: user.id,
            },
          ],
        },
      });

      if (!handler || typeof handler.openIframe !== "function") {
        throw new Error("Paystack handler not ready yet.");
      }

      handler.openIframe();
    } catch (err) {
      console.error("Paystack error:", err);
      toast.error("Payment could not start. Please try again.");
      setPaying(false);
    }
  };

  /* -----------------------------------------------------
     🎯 Close Modal Handler
  ------------------------------------------------------ */
  const closeBookingModal = () => {
    if (!paying && !paymentSuccess) {
      setShowBookingModal(false);
      setUserWhatsApp("");
      setPaying(false);
      setPaymentSuccess(false);
    }
  };

  /* -----------------------------------------------------
     🖼️ Render
  ------------------------------------------------------ */
  return (
    <>
      {/* 🏠 Hostel Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
      >
        {/* Image */}
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
            <div className="absolute top-3 right-3 bg-yellow-100 text-[#142B6F] text-xs font-semibold px-3 py-1 rounded-full border border-[#FFD601]/40 shadow-sm">
              ⭐ Verified
            </div>
          )}
        </div>

        {/* Content */}
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
              Booking Fee: ₵{hostel.booking_fee || 197}
            </div>

            <button
              onClick={() => setShowBookingModal(true)}
              className="mt-4 block text-center w-full bg-[#142B6F] text-white text-sm font-semibold py-2 rounded-lg hover:bg-[#1A2D7A] transition-all"
            >
              Book Now
            </button>
          </div>
        </div>
      </motion.div>

      {/* 🖼️ Gallery Modal */}
      <GalleryModal
        open={isModalOpen}
        images={images}
        index={currentImage}
        title={hostel.title || "Hostel Gallery"}
        onClose={() => setIsModalOpen(false)}
        onNext={nextImage}
        onPrev={prevImage}
      />

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
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-lg relative text-center"
            >
              {!paymentSuccess && (
                <button
                  onClick={closeBookingModal}
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
                    Booking confirmed 🎉 Redirecting to your bookings...
                  </p>
                  <div className="mt-4 w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full animate-pulse"></div>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-[#142B6F] mb-2">
                    Confirm Booking
                  </h2>
                  <p className="text-gray-600 text-sm mb-4">
                    Pay a one-time{" "}
                    <span className="font-semibold text-[#142B6F]">
                      Service & Agent Viewing Fee
                    </span>{" "}
                    of{" "}
                    <span className="text-[#FFD601] font-bold">
                      ₵{hostel.booking_fee || 197}
                    </span>
                    .
                  </p>

                  <input
                    type="tel"
                    placeholder="Enter your WhatsApp number"
                    value={userWhatsApp}
                    onChange={(e) => setUserWhatsApp(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm mb-4 focus:ring-2 focus:ring-[#FFD601]/60 outline-none"
                    disabled={paying}
                  />

                  <motion.button
                    whileHover={!paying ? { scale: 1.02 } : {}}
                    whileTap={!paying ? { scale: 0.98 } : {}}
                    disabled={paying || !userWhatsApp.trim()}
                    onClick={handlePayment}
                    className="w-full bg-[#FFD601] text-[#142B6F] font-semibold py-3 rounded-lg hover:bg-[#ffdf3b] transition-all duration-200 flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {paying ? (
                      <>
                        <Loader2 className="animate-spin w-5 h-5" />{" "}
                        Processing...
                      </>
                    ) : (
                      "Confirm & Pay"
                    )}
                  </motion.button>

                  <button
                    onClick={closeBookingModal}
                    disabled={paying}
                    className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
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
