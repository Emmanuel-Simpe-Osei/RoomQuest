"use client";
import { motion } from "framer-motion";
import StatCard from "@/components/admin/StatCard";
import { Bed, Building2, Users, Calendar } from "lucide-react";

export default function AdminDashboardPage() {
  const stats = [
    { label: "Total Rooms", value: 32, Icon: Bed },
    { label: "Total Hostels", value: 8, Icon: Building2 },
    { label: "Total Users", value: 120, Icon: Users },
    { label: "Bookings Made", value: 56, Icon: Calendar },
  ];

  const recentBookings = [
    {
      id: 1,
      user: "Kwame Ofori",
      room: "Deluxe Room A12",
      date: "2025-10-21",
      status: "Confirmed",
    },
    {
      id: 2,
      user: "Ama Boateng",
      room: "Hostel Block B3",
      date: "2025-10-20",
      status: "Pending",
    },
    {
      id: 3,
      user: "Emmanuel Simpe",
      room: "Executive Suite C5",
      date: "2025-10-19",
      status: "Cancelled",
    },
  ];

  return (
    <div className="min-h-screen bg-[#142B6F] text-white">
      {/* ✅ Main Content Container with Safe Padding */}
      <div className="pt-16 pb-6 px-3 sm:px-4 sm:py-6 sm:pt-6">
        {/* ✅ Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#FFD601]">
            Dashboard Overview
          </h1>
          <p className="text-white/70 text-sm mt-1">
            Welcome to your admin dashboard
          </p>
        </div>

        {/* ✅ Stat Cards Grid - Improved Responsiveness */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="w-full"
            >
              <StatCard {...stat} />
            </motion.div>
          ))}
        </div>

        {/* ✅ Recently Booked Section */}
        <div className="bg-[#1A2D7A] rounded-xl sm:rounded-2xl shadow-lg border border-[#FFD601]/30 p-3 sm:p-4 md:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#FFD601] mb-2 sm:mb-0">
              Recently Booked
            </h2>
            <button className="text-xs sm:text-sm bg-[#FFD601] text-[#142B6F] px-3 py-2 rounded-lg font-medium hover:bg-[#FFD601]/90 transition-colors">
              View All Bookings
            </button>
          </div>

          {/* ✅ Mobile Cards View */}
          <div className="block sm:hidden space-y-3">
            {recentBookings.map((booking, i) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#203785] rounded-lg p-3 border border-white/10"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-white">{booking.user}</p>
                    <p className="text-white/80 text-xs mt-1">{booking.room}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      booking.status === "Confirmed"
                        ? "bg-green-500/20 text-green-400"
                        : booking.status === "Pending"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
                <div className="flex items-center text-white/60 text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  {booking.date}
                </div>
              </motion.div>
            ))}
          </div>

          {/* ✅ Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm sm:text-base border-collapse">
              <thead>
                <tr className="text-[#FFD601] border-b border-[#FFD601]/30">
                  <th className="py-3 px-2 sm:px-4 font-semibold">Guest</th>
                  <th className="py-3 px-2 sm:px-4 font-semibold">
                    Room / Hostel
                  </th>
                  <th className="py-3 px-2 sm:px-4 font-semibold">Date</th>
                  <th className="py-3 px-2 sm:px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b, i) => (
                  <motion.tr
                    key={b.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-white/10 hover:bg-[#203785]/40 transition-colors duration-200"
                  >
                    <td className="py-3 px-2 sm:px-4">{b.user}</td>
                    <td className="py-3 px-2 sm:px-4">{b.room}</td>
                    <td className="py-3 px-2 sm:px-4">{b.date}</td>
                    <td className="py-3 px-2 sm:px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          b.status === "Confirmed"
                            ? "bg-green-500/20 text-green-400"
                            : b.status === "Pending"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ✅ Extra Bottom Spacing for Mobile */}
        <div className="h-4 sm:h-0"></div>
      </div>
    </div>
  );
}
