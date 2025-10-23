"use client";
import { motion } from "framer-motion";

export default function StatCard({ label, value, Icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[#1A2D7A] text-white rounded-xl shadow-md p-5 flex items-center justify-between border border-[#FFD601]/40 hover:border-[#FFD601] hover:shadow-[0_0_12px_rgba(255,214,1,0.4)] hover:scale-[1.02] transition-all duration-300"
    >
      <div>
        <p className="text-sm text-gray-300">{label}</p>
        <h2 className="text-3xl font-extrabold text-[#FFD601] drop-shadow-[0_0_6px_rgba(255,214,1,0.6)]">
          {value}
        </h2>
      </div>

      <div className="bg-[#FFD601]/20 p-3 rounded-lg flex items-center justify-center">
        <Icon
          className="text-[#FFD601] drop-shadow-[0_0_5px_rgba(255,214,1,0.5)]"
          size={28}
        />
      </div>
    </motion.div>
  );
}
