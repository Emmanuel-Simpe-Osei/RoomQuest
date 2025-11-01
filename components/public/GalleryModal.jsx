"use client";

import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { useRef, useState, useEffect, useMemo } from "react";

export default function GalleryModal({
  open,
  images = [],
  index = 0,
  onClose,
  onNext,
  onPrev,
  title = "Image Preview",
}) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const controls = useAnimation();
  const imgRef = useRef(null);

  // ✅ Always declared hooks first — consistent order
  const parsedImages = useMemo(() => {
    if (typeof images === "string") {
      try {
        return JSON.parse(images);
      } catch {
        return [images];
      }
    }
    return Array.isArray(images) ? images : [];
  }, [images]);

  // ✅ Reset zoom when image changes
  useEffect(() => {
    setIsZoomed(false);
    controls.start({ scale: 1 });
  }, [index]);

  // 🔍 Double tap zoom
  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap < 300) {
      setIsZoomed((prev) => !prev);
      controls.start({
        scale: isZoomed ? 1 : 2,
        transition: { type: "spring", stiffness: 200, damping: 20 },
      });
    }
    setLastTap(now);
  };

  // 📱 Touch swipe
  const handleTouchStart = (e) => setTouchStartX(e.touches[0].clientX);
  const handleTouchMove = (e) => setTouchEndX(e.touches[0].clientX);
  const handleTouchEnd = () => {
    const swipe = touchStartX - touchEndX;
    if (swipe > 75) onNext?.();
    if (swipe < -75) onPrev?.();
  };

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: open ? 1 : 0 }}
        exit={{ opacity: 0 }}
      >
        {/* 🔘 Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: open ? 1 : 0 }}
          exit={{ opacity: 0 }}
        />

        {/* 💎 Modal Content */}
        {parsedImages.length > 0 && (
          <motion.div
            className="relative w-full max-w-5xl max-h-[90vh] flex flex-col items-center"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{
              scale: open ? 1 : 0.95,
              opacity: open ? 1 : 0,
            }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{
              type: "spring",
              damping: 18,
              stiffness: 250,
              duration: 0.15,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="absolute top-3 left-0 right-0 flex justify-between items-center px-4 z-20">
              <h3 className="text-white/90 font-semibold text-sm sm:text-base">
                {title}
              </h3>
              <div className="flex gap-3">
                <motion.button
                  onClick={() => window.open(parsedImages[index], "_blank")}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="bg-white/15 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm border border-white/20"
                >
                  <Download size={22} />
                </motion.button>
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="bg-white/15 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm border border-white/20"
                >
                  <X size={22} />
                </motion.button>
              </div>
            </div>

            {/* 🖼️ Main Image */}
            <motion.div
              className="relative w-full h-full flex items-center justify-center overflow-hidden"
              drag={!isZoomed ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(e, info) => {
                const offset = info.offset.x;
                const velocity = info.velocity.x;
                if (offset > 100 || velocity > 500) onPrev?.();
                else if (offset < -100 || velocity < -500) onNext?.();
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <motion.img
                key={index}
                ref={imgRef}
                src={parsedImages[index]}
                alt={`${title} ${index + 1}`}
                className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl select-none touch-none"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                onTap={handleDoubleTap}
                onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
              />
              {/* Preload next */}
              {parsedImages[index + 1] && (
                <link rel="preload" href={parsedImages[index + 1]} as="image" />
              )}

              {/* Arrows */}
              {parsedImages.length > 1 && (
                <>
                  <motion.button
                    onClick={onPrev}
                    whileHover={{
                      scale: 1.1,
                      backgroundColor: "rgba(255,255,255,0.25)",
                    }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/10 text-white p-3 rounded-full backdrop-blur-sm border border-white/20"
                  >
                    <ChevronLeft size={26} />
                  </motion.button>
                  <motion.button
                    onClick={onNext}
                    whileHover={{
                      scale: 1.1,
                      backgroundColor: "rgba(255,255,255,0.25)",
                    }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 text-white p-3 rounded-full backdrop-blur-sm border border-white/20"
                  >
                    <ChevronRight size={26} />
                  </motion.button>
                </>
              )}
            </motion.div>

            {/* Counter */}
            {parsedImages.length > 1 && (
              <div className="mt-4 text-white/80 text-sm font-medium bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                {index + 1} / {parsedImages.length}
              </div>
            )}

            {/* Thumbnails */}
            {parsedImages.length > 1 && (
              <div className="mt-4 flex gap-2 max-w-full overflow-x-auto py-3 px-3 scrollbar-hide">
                {parsedImages.map((img, i) => (
                  <motion.button
                    key={i}
                    onClick={() => onNext(i)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-150 ${
                      i === index
                        ? "border-[#FFD601] scale-105 shadow-lg"
                        : "border-white/30 hover:border-white/50"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
