"use client";

import { motion } from "framer-motion";
import { Phone, MessageCircle, MapPin, Clock } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  // 🧩 WhatsApp message template
  const whatsappNumber = "2335381713"; // Ghana country code added
  const message = encodeURIComponent(
    "Hello RoomQuest 👋, I’m interested in finding accommodation and would like to know more about available rooms or hostels."
  );
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <section className="min-h-screen bg-gray-50 text-gray-800 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* 🏠 Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-5xl font-extrabold text-[#142B6F] mb-3">
            Get in <span className="text-[#FFD601]">Touch</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-[15px]">
            Have questions or need help booking a room or hostel? We’re always
            ready to assist you.
          </p>
        </motion.div>

        {/* 📞 Contact Info + WhatsApp CTA */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Info Section */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-xl font-bold text-[#142B6F] mb-4">
              Let’s Make Room Hunting Simple
            </h2>
            <p className="text-gray-700 mb-6 text-[15px] leading-relaxed">
              Reach out to our team for inquiries, booking assistance, or
              collaboration opportunities. We’ll respond as soon as possible
              through WhatsApp — your fastest way to connect with us.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-700">
                <Phone className="text-[#142B6F]" size={20} />
                <span>+233 53 817 13</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <MapPin className="text-[#142B6F]" size={20} />
                <span>Accra, Ghana</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Clock className="text-[#142B6F]" size={20} />
                <span>Mon – Sat: 8:00 AM – 6:00 PM</span>
              </div>
            </div>

            {/* WhatsApp Button */}
            <Link
              href={whatsappLink}
              target="_blank"
              className="inline-flex items-center gap-2 mt-8 bg-[#25D366] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#20b857] transition-all shadow-md"
            >
              <MessageCircle size={20} />
              Chat with us on WhatsApp
            </Link>
          </motion.div>

          {/* Right Decorative Card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
          >
            <h3 className="text-lg font-bold text-[#142B6F] mb-4">
              Why Contact Us?
            </h3>
            <ul className="space-y-3 text-gray-700 text-[15px]">
              <li>✅ Get assistance finding a room or hostel</li>
              <li>✅ Verify listings before booking</li>
              <li>✅ Ask about viewing and service fees</li>
              <li>✅ Partner or list your property with RoomQuest</li>
            </ul>

            <div className="mt-6 text-center">
              <Link
                href={whatsappLink}
                target="_blank"
                className="inline-flex items-center justify-center gap-2 bg-[#FFD601] text-[#142B6F] px-5 py-3 font-semibold rounded-full hover:bg-[#e6c100] transition-all"
              >
                <MessageCircle size={18} />
                Message Now
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
