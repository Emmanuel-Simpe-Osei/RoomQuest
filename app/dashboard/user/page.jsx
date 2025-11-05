"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function UserDashboardPage() {
  const [userName, setUserName] = useState("");
  const [totalBookings, setTotalBookings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openFAQ, setOpenFAQ] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) return;

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", user.id)
          .single();

        if (profileError) {
          setUserName(user.email?.split("@")[0] || "User");
        } else {
          setUserName(profile?.full_name || user.email?.split("@")[0]);
        }

        const [roomBookings, hostelBookings] = await Promise.all([
          supabase
            .from("bookings")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id),
          supabase
            .from("hostel_bookings")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id),
        ]);

        const total = (roomBookings.count || 0) + (hostelBookings.count || 0);
        setTotalBookings(total);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const faqs = [
    {
      q: "💰 What are the booking fees for?",
      a: "The booking fee covers your service and agent viewing fee — meaning the small cost paid for an agent to accompany you to physically inspect the room or hostel. It ensures the property you’re interested in actually exists and matches the description before you make final payment to the landlord.",
    },
    {
      q: "⏳ How long do I have after booking a room or hostel?",
      a: "RoomQuest operates on a first-come, first-served basis. If you delay finalizing your booking and another user completes theirs first, they’ll get the room. However, your booking fee will be refunded in such cases.",
    },
    {
      q: "💵 Can I get a refund if I change my mind?",
      a: "If you cancel before inspection or before an agent is assigned, your booking fee can be refunded. Once an agent is scheduled or the viewing is completed, the fee becomes non-refundable since service costs are already incurred.",
    },
    {
      q: "🧾 How do I confirm my booking status?",
      a: "After successful payment, you can check your booking history under ‘My Bookings’. Each booking includes details such as payment status, date, and viewing updates.",
    },
    {
      q: "☎️ How can I contact support?",
      a: "If you have any issues with booking or refunds, visit the ‘Support’ section on your dashboard to chat directly with a RoomQuest representative or send an email to support@roomquest.com.",
    },
  ];

  return (
    <div className="space-y-8">
      {/* 👋 Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-md p-6 border border-gray-100"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-[#142B6F] mb-2">
          {loading ? "Loading..." : `Welcome back, ${userName} 👋🏽`}
        </h1>
        <p className="text-gray-600">
          Here’s your latest RoomQuest booking summary.
        </p>
      </motion.div>

      {/* 📊 Total Bookings */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex items-center gap-4 hover:shadow-lg transition-all duration-300">
          <div className="p-3 rounded-full bg-[#142B6F]/10 text-[#142B6F] flex items-center justify-center">
            <Home size={22} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Bookings</p>
            <h3 className="text-lg font-bold text-gray-800">
              {loading ? "..." : totalBookings}
            </h3>
          </div>
        </div>
      </motion.div>

      {/* ❓ FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-md p-6 border border-gray-100"
      >
        <h2 className="text-2xl font-bold text-[#142B6F] mb-5">
          Frequently Asked Questions
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                className="flex justify-between items-center w-full text-left px-4 py-3 font-medium text-gray-800 hover:bg-gray-50 transition-all"
              >
                <span>{faq.q}</span>
                <motion.div
                  animate={{ rotate: openFAQ === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {openFAQ === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-4 pb-4 text-gray-600 text-sm leading-relaxed bg-gray-50"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
