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
            Making room hunting simple, transparent, and secure.
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
              Welcome to <strong>RoomQuest</strong>, a trusted platform
              dedicated to helping students and professionals find safe,
              comfortable, and affordable accommodation with ease.
            </p>

            <p className="mb-5 leading-relaxed text-gray-700 text-[15px]">
              We understand how stressful it can be to search for the right room
              or hostel, so we’ve made the process simple and reliable. On
              RoomQuest, you can explore available rooms and hostels, view
              details, and easily book a viewing when you find one that suits
              your needs.
            </p>

            <p className="mb-5 leading-relaxed text-gray-700 text-[15px]">
              Our mission is to connect you to verified, quality spaces while
              saving you time, money, and energy. Each listing on RoomQuest is
              carefully curated to ensure transparency and trust between tenants
              and property owners.
            </p>

            <p className="leading-relaxed text-gray-700 text-[15px]">
              At RoomQuest, we believe finding a place to stay shouldn’t be
              complicated — it should be{" "}
              <strong>convenient, transparent,</strong> and{" "}
              <strong>secure.</strong>
            </p>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-[#142B6F] mb-2">
                RoomQuest — Making room hunting simple.
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
            To simplify the accommodation experience by connecting people with
            verified and affordable spaces. Whether you’re a student seeking a
            peaceful study environment or a professional needing comfort and
            convenience, RoomQuest ensures your next move is stress-free and
            trustworthy.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
