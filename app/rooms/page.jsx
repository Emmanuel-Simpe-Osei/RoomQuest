"use client";

import { useEffect, useState, useCallback, startTransition } from "react";
import { supabase } from "@/lib/supabaseClient";
import RoomCard from "@/components/public/RoomCard";
import GalleryModal from "@/components/public/GalleryModal";
import SearchBar from "@/components/public/SearchBar";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Home } from "lucide-react";

const NAVY = "#142B6F";
const GOLD = "#FFD601";

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Modal state
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Search + filter
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    availability: "all",
    roomType: "all",
  });

  // Prevent hydration mismatch
  useEffect(() => setIsClient(true), []);

  // 🧩 Fetch all rooms
  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) console.error("Error fetching rooms:", error);
      else {
        setRooms(data || []);
        setFilteredRooms(data || []);
      }
      setLoading(false);
    };
    fetchRooms();
  }, []);

  // Scroll detection
  useEffect(() => {
    if (!isClient) return;
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isClient]);

  // 🧠 Filter Logic
  useEffect(() => {
    if (!rooms.length) return;

    const filtered = rooms.filter((room) => {
      const q = query.toLowerCase();
      const searchMatch =
        !q ||
        room.title?.toLowerCase().includes(q) ||
        room.location?.toLowerCase().includes(q) ||
        room.type?.toLowerCase().includes(q) ||
        room.description?.toLowerCase().includes(q);

      // Match prices too (₵500, 1000 etc.)
      const priceNum = parseFloat(q.replace(/[^\d.]/g, ""));
      const priceMatch = !priceNum || Math.abs(room.price - priceNum) <= 500;

      const availMatch =
        filters.availability === "all" ||
        room.availability?.toLowerCase() === filters.availability.toLowerCase();

      const typeMatch =
        filters.roomType === "all" ||
        room.type?.toLowerCase() === filters.roomType.toLowerCase();

      return searchMatch && priceMatch && availMatch && typeMatch;
    });

    startTransition(() => setFilteredRooms(filtered));
  }, [query, rooms, filters]);

  // Gallery controls
  const openGallery = useCallback((images, index = 0) => {
    setGalleryImages(images || []);
    setGalleryIndex(index);
    setGalleryOpen(true);
  }, []);

  const closeGallery = useCallback(() => setGalleryOpen(false), []);
  const nextImage = useCallback(() => {
    setGalleryIndex((i) => (i + 1) % (galleryImages?.length || 1));
  }, [galleryImages]);
  const prevImage = useCallback(() => {
    setGalleryIndex(
      (i) =>
        (i - 1 + (galleryImages?.length || 1)) % (galleryImages?.length || 1)
    );
  }, [galleryImages]);

  const handleQuickFilter = (type, value) => {
    startTransition(() => {
      if (type === "availability")
        setFilters((p) => ({ ...p, availability: value }));
      if (type === "roomType") setFilters((p) => ({ ...p, roomType: value }));
      if (type === "reset") {
        setFilters({ availability: "all", roomType: "all" });
        setQuery("");
      }
    });
  };

  if (!isClient)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin w-12 h-12 border-4 border-[#142B6F] border-t-transparent rounded-full"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Header */}
      <motion.header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-blue-100"
            : "bg-white/90 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#142B6F] to-[#1A2D7A] bg-clip-text text-transparent mb-2 sm:mb-3">
              Find Your Perfect Room
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Discover verified rooms with transparent pricing and easy booking
            </p>
          </div>

          {/* SearchBar */}
          <div className="relative mb-8 sm:mb-10 z-10">
            <SearchBar onSearch={setQuery} value={query} />
            {!loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute -bottom-8 left-0 right-0 text-center"
              >
                <span className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-gray-700 border border-gray-200 shadow-sm">
                  <Home size={16} />
                  {filteredRooms.length}{" "}
                  {filteredRooms.length === 1 ? "room" : "rooms"} found
                  {query && (
                    <span className="text-gray-500"> for “{query}”</span>
                  )}
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </motion.header>

      {/* Add spacing below sticky header */}
      <div className="mt-20 sm:mt-28"></div>

      {/* Rooms Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 relative z-0">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin w-12 h-12 border-4 border-[#142B6F] border-t-transparent rounded-full"></div>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-24 text-gray-500">
            No rooms found matching your search.
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredRooms.map((room) => (
              <RoomCard key={room.id} room={room} onOpenGallery={openGallery} />
            ))}
          </motion.div>
        )}
      </section>

      {/* ✅ Gallery Modal */}
      <GalleryModal
        open={galleryOpen}
        images={galleryImages}
        index={galleryIndex}
        onClose={closeGallery}
        onNext={nextImage}
        onPrev={prevImage}
        setGalleryIndex={setGalleryIndex}
      />
    </div>
  );
}
