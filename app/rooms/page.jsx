"use client";

import { useEffect, useState, useCallback, startTransition } from "react";
import { supabase } from "@/lib/supabaseClient";
import RoomCard from "@/components/public/RoomCard";
import GalleryModal from "@/components/public/GalleryModal";
import { motion } from "framer-motion";

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // 🖼️ Gallery states
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const [query, setQuery] = useState("");

  useEffect(() => setIsClient(true), []);

  // 🧩 Fetch rooms from Supabase
  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("rooms") // ✅ ensure table name matches Supabase
        .select("*")
        .order("created_at", { ascending: false });

      if (error) console.error("❌ Error fetching rooms:", error);
      else {
        setRooms(data || []);
        setFilteredRooms(data || []);
      }
      setLoading(false);
    };
    fetchRooms();
  }, []);

  // 🧠 Smart Search — optional (connect later with Navbar)
  const handleSearch = useCallback(
    (value) => {
      setQuery(value);
      const q = value.trim().toLowerCase();

      if (!q) {
        startTransition(() => setFilteredRooms(rooms));
        return;
      }

      const filtered = rooms.filter((room) => {
        const text = Object.values(room)
          .filter((v) => typeof v === "string" || typeof v === "number")
          .join(" ")
          .toLowerCase();

        return text.includes(q);
      });

      startTransition(() => setFilteredRooms(filtered));
    },
    [rooms]
  );

  // 🖼️ Gallery controls
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

  // 🌀 Prevent hydration mismatch
  if (!isClient)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin w-12 h-12 border-4 border-[#142B6F] border-t-transparent rounded-full"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* ✅ Removed NavbarPublic — ClientLayout handles it */}

      {/* 🏠 Room Cards Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin w-12 h-12 border-4 border-[#142B6F] border-t-transparent rounded-full"></div>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-24 text-gray-500 text-lg">
            No rooms found matching “{query}”. Try a different search.
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

      {/* 🖼️ Gallery Modal */}
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
