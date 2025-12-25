"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function AboutPage() {
  return (
    <section className="min-h-screen bg-white text-gray-800 py-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* 🏠 Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-14"
        >
          <h1 className="text-3xl md:text-5xl font-extrabold text-[#142B6F] mb-4">
            About <span className="text-[#FFD601]">RoomQuest</span>
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Ghana’s trusted platform for finding verified hostels and rooms in
            Accra.
          </p>
        </motion.div>

        {/* 💬 Main Content */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left text */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="mb-5 leading-relaxed text-gray-700 text-[15px]">
              Welcome to <strong>RoomQuest</strong>, a Ghana-based accommodation
              platform dedicated to helping students and young professionals
              find safe, affordable, and verified hostels and rooms across
              Accra, with plans to expand to Kumasi.
            </p>

            <p className="mb-5 leading-relaxed text-gray-700 text-[15px]">
              Searching for a reliable place to stay shouldn’t be stressful.
              RoomQuest makes it easy to explore available hostels and
              apartments, view detailed information, and book viewings for
              spaces that fit your needs.
            </p>

            <p className="mb-5 leading-relaxed text-gray-700 text-[15px]">
              Every listing on RoomQuest is carefully inspected and verified to
              ensure transparency and trust between tenants and property
              managers.
            </p>

            <p className="mb-5 leading-relaxed text-gray-700 text-[15px]">
              RoomQuest currently serves students and renters primarily in
              Accra, helping users avoid scams and unreliable listings, with
              future plans to cover Kumasi and other major cities in Ghana.
            </p>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-[#142B6F] mb-2">
                RoomQuest — Making Room Hunting Simple.
              </h3>
            </div>
          </motion.div>

          {/* Right image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100">
              <Image
                src="https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80"
                alt="About RoomQuest"
                width={800}
                height={500}
                className="object-cover w-full h-[350px] md:h-[400px]"
              />
            </div>
          </motion.div>
        </div>

        {/* 💡 Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20 bg-[#F9FAFB] border border-gray-100 rounded-2xl shadow-sm p-8 md:p-12 text-center"
        >
          <h2 className="text-2xl font-bold text-[#142B6F] mb-4">
            Our Mission
          </h2>
          <p className="text-gray-700 leading-relaxed max-w-3xl mx-auto">
            At RoomQuest, our goal is to simplify the accommodation experience
            by connecting students and young professionals in Accra to safe,
            affordable, and comfortable spaces, with plans to expand to Kumasi.
            Whether you’re a student looking for a peaceful place to stay or a
            professional seeking convenience and comfort, RoomQuest makes your
            next move easy, secure, and hassle-free.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
