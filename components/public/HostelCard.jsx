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
  Eye,
  EyeOff,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import GalleryModal from "@/components/public/GalleryModal";

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
  const [authPrompt, setAuthPrompt] = useState(false);
  const [userWhatsApp, setUserWhatsApp] = useState("");
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [agentPercentage, setAgentPercentage] = useState(null);
  const [book4meSelected, setBook4meSelected] = useState(false); // ✅ NEW: BOOK 4 Me state
  const [book4meFee, setBook4meFee] = useState(0); // ✅ NEW: BOOK 4 Me fee

  const images = Array.isArray(hostel?.images)
    ? hostel.images
    : hostel?.images
    ? JSON.parse(hostel.images)
    : [];

  const nextImage = () => setCurrentImage((p) => (p + 1) % images.length);
  const prevImage = () =>
    setCurrentImage((p) => (p - 1 + images.length) % images.length);

  // ✅ NEW: Calculate total price
  const calculateTotalPrice = () => {
    const basePrice = hostel.booking_fee || 197;
    const book4mePrice = book4meSelected ? book4meFee : 0;
    return basePrice + book4mePrice;
  };

  // Fetch agent percentage from database
  useEffect(() => {
    const fetchAgentPercentage = async () => {
      try {
        const { data, error } = await supabase
          .from("hostels")
          .select("agent_fee_percentage, book4me_fee")
          .eq("id", hostel.id)
          .single();

        if (error) {
          console.error("Error fetching agent percentage:", error);
          return;
        }

        if (data) {
          setAgentPercentage(data.agent_fee_percentage);
          setBook4meFee(data.book4me_fee || 0); // ✅ NEW: Load BOOK 4 Me fee
        }
      } catch (err) {
        console.error("Failed to fetch agent percentage:", err);
      }
    };

    if (hostel?.id) {
      fetchAgentPercentage();
    }
  }, [hostel?.id]);

  // ✅ NEW: Fetch BOOK 4 Me fee when modal opens
  useEffect(() => {
    if (showBookingModal && hostel?.id) {
      const fetchBook4meFee = async () => {
        try {
          const { data, error } = await supabase
            .from("hostels")
            .select("book4me_fee")
            .eq("id", hostel.id)
            .single();

          if (!error && data) {
            setBook4meFee(data.book4me_fee || 0);
          }
        } catch (err) {
          console.error("Failed to fetch BOOK 4 Me fee:", err);
        }
      };
      fetchBook4meFee();
    }
  }, [showBookingModal, hostel?.id]);

  useEffect(() => {
    if (paymentSuccess && showBookingModal) {
      const t = setTimeout(() => {
        setShowBookingModal(false);
        setPaymentSuccess(false);
        setPaying(false);
        setBook4meSelected(false); // ✅ NEW: Reset BOOK 4 Me selection
        router.push("/dashboard/user/bookings");
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [paymentSuccess, showBookingModal, router]);

  const handlePaymentSuccess = async (response, user) => {
    try {
      const { error } = await supabase.from("hostel_bookings").insert([
        {
          user_id: user.id,
          hostel_id: hostel.id,
          whatsapp: userWhatsApp,
          status: "paid",
          reference: response.reference,
          book4me_service: book4meSelected, // ✅ NEW: Save BOOK 4 Me selection
          amount: calculateTotalPrice(), // ✅ NEW: Save total amount
          created_at: new Date().toISOString(),
        },
      ]);
      if (error) {
        console.error("Booking save error:", error.message);
        toast.error("Payment successful but booking save failed.");
        setPaying(false);
        return;
      }
      setPaymentSuccess(true);
      toast.success("Payment successful! Redirecting...");
    } catch (err) {
      console.error("Post-payment error:", err);
      toast.error("Payment saved with issues. Redirecting soon...");
      setPaymentSuccess(true);
    }
  };

  /* -----------------------------------------------------
     💳 Paystack Payment (updated for BOOK 4 Me)
  ------------------------------------------------------ */
  const handlePayment = async () => {
    const totalAmount = calculateTotalPrice();
    if (totalAmount <= 0) return toast.error("Invalid booking amount.");
    if (!userWhatsApp.trim())
      return toast.error("Please enter your WhatsApp number.");

    setPaying(true);
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setAuthPrompt(true);
      setPaying(false);
      return;
    }

    try {
      const PaystackPop = await loadPaystack();
      const handler = PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: user.email || "booking@roomquest.com",
        amount: totalAmount * 100, // ✅ UPDATED: Use total amount
        currency: "GHS",
        reference: `RQ-HOSTEL-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        callback: (response) => handlePaymentSuccess(response, user),
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
              display_name: "BOOK 4 Me Service",
              variable_name: "book4me_service",
              value: book4meSelected ? "Yes" : "No",
            },
          ],
        },
      });

      if (!handler || typeof handler.openIframe !== "function")
        throw new Error("Paystack handler not ready yet.");
      handler.openIframe();
    } catch (err) {
      console.error("Paystack error:", err);
      toast.error("Payment could not start. Try again.");
      setPaying(false);
    }
  };

  const closeBookingModal = () => {
    if (!paying && !paymentSuccess) {
      setShowBookingModal(false);
      setUserWhatsApp("");
      setPaying(false);
      setPaymentSuccess(false);
      setBook4meSelected(false); // ✅ NEW: Reset BOOK 4 Me selection
    }
  };

  const handleBookNow = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setAuthPrompt(true);
      return;
    }
    setShowBookingModal(true);
  };

  /* -----------------------------------------------------
     🖼️ Render UI
  ------------------------------------------------------ */
  return (
    <>
      {/* 🏠 Hostel Card - ADDED ID HERE */}
      <motion.div
        id={`hostel-${hostel.id}`} // ✅ ADDED: This is the critical fix!
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
      >
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
            <div className="absolute top-3 right-3 bg-yellow-100 text-[#142B6F] text-xs font-semibold px-3 py-1 rounded-full border border-yellow-300 shadow-sm">
              ⭐ Verified
            </div>
          )}
        </div>

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

              {agentPercentage ? (
                <span className="text-xs font-medium bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                  {agentPercentage}% agent fee
                </span>
              ) : (
                <span className="text-xs font-medium bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                  Agent fee applies
                </span>
              )}
            </div>

            <div className="mt-2 bg-green-50 text-green-700 px-3 py-1 rounded-lg text-sm font-medium">
              Booking Fee: ₵{hostel.booking_fee || 197}
            </div>

            <button
              onClick={handleBookNow}
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
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg relative text-center"
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
                    Booking confirmed 🎉 Redirecting...
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-[#142B6F] mb-2">
                    Confirm Booking
                  </h2>
                  <p className="text-gray-600 text-sm mb-4">
                    Pay{" "}
                    <span className="font-semibold text-[#142B6F]">
                      Viewing Fee
                    </span>
                  </p>

                  {/* ✅ NEW: BOOK 4 Me Option */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 text-left">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="book4me"
                        checked={book4meSelected}
                        onChange={(e) => setBook4meSelected(e.target.checked)}
                        disabled={paying}
                        className="mt-1 w-4 h-4 text-[#142B6F] bg-white border-gray-300 rounded focus:ring-[#142B6F]"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor="book4me"
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <span className="font-semibold text-[#142B6F]">
                            BOOK 4 Me
                          </span>
                          {book4meSelected ? (
                            <Eye className="w-4 h-4 text-green-600" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-gray-500" />
                          )}
                        </label>
                        <p className="text-sm text-gray-600 mt-1">
                          Can't Inspect in Person? We've Got You Covered
                          {book4meFee > 0 && (
                            <span className="text-[#FFD601] font-semibold ml-1">
                              (+₵{book4meFee})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ✅ UPDATED: Price Display */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Base Booking Fee:</span>
                      <span className="font-semibold">
                        ₵{hostel.booking_fee || 197}
                      </span>
                    </div>
                    {book4meSelected && book4meFee > 0 && (
                      <div className="flex justify-between items-center text-sm mt-1">
                        <span className="text-gray-600">
                          BOOK 4 Me Service:
                        </span>
                        <span className="font-semibold text-[#FFD601]">
                          +₵{book4meFee}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-base font-bold mt-2 pt-2 border-t border-gray-200">
                      <span className="text-[#142B6F]">Total Amount:</span>
                      <span className="text-[#142B6F]">
                        ₵{calculateTotalPrice()}
                      </span>
                    </div>
                  </div>

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
                      `Pay ₵${calculateTotalPrice()}`
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

      {/* 🔐 Login Prompt */}
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
                You need to log in or create an account before booking.
              </p>

              <button
                onClick={() => {
                  setAuthPrompt(false);
                  router.push("/login");
                }}
                className="w-full bg-[#142B6F] text-white font-semibold py-2 rounded-lg hover:bg-[#1A2D7A] transition-all mb-2"
              >
                Log In / Sign Up
              </button>

              <button
                onClick={() => setAuthPrompt(false)}
                className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-100 transition-all"
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
