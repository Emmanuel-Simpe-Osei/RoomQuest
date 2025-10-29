"use client";

import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { useRef, useState } from "react";

const GOLD = "#FFD601";
const NAVY = "#142B6F";

export default function GalleryModal({
  open,
  images,
  index,
  onClose,
  onNext,
  onPrev,
}) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const controls = useAnimation();
  const imgRef = useRef(null);

  if (!open || !images.length) return null;

  // 🧠 Handle swipe detection
  const handleDragEnd = (event, info) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset > 100 || velocity > 500) onPrev();
    else if (offset < -100 || velocity < -500) onNext();
  };

  // 🔍 Handle double-tap zoom
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

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* ✅ Backdrop — tap outside to close */}
          <motion.div
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* ✅ Modal Content */}
          <motion.div
            className="relative w-full max-w-5xl max-h-[90vh] flex flex-col items-center"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 260,
              duration: 0.25,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 🔘 Close & Download Buttons */}
            <div className="absolute top-3 right-3 z-20 flex gap-3">
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="bg-white/15 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm border border-white/20 transition-all duration-150"
              >
                <X size={22} />
              </motion.button>

              <motion.button
                onClick={() => window.open(images[index], "_blank")}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="bg-white/15 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm border border-white/20 transition-all duration-150"
              >
                <Download size={22} />
              </motion.button>
            </div>

            {/* 🖼️ Main Image — draggable and zoomable */}
            <motion.div
              className="relative w-full h-full flex items-center justify-center overflow-hidden"
              drag={!isZoomed ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 22,
                mass: 0.8,
              }}
            >
              <motion.img
                key={index}
                ref={imgRef}
                src={images[index]}
                alt={`Room image ${index + 1}`}
                className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl select-none touch-none"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={controls}
                onTap={handleDoubleTap}
                transition={{ duration: 0.25, ease: "easeOut" }}
              />

              {/* Arrows */}
              {images.length > 1 && (
                <>
                  <motion.button
                    onClick={onPrev}
                    whileHover={{
                      scale: 1.1,
                      backgroundColor: "rgba(255,255,255,0.25)",
                    }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/10 text-white p-3 rounded-full backdrop-blur-sm border border-white/20 transition-all duration-150"
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 text-white p-3 rounded-full backdrop-blur-sm border border-white/20 transition-all duration-150"
                  >
                    <ChevronRight size={26} />
                  </motion.button>
                </>
              )}
            </motion.div>

            {/* Counter */}
            {images.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-5 text-white/80 text-sm font-medium bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20"
              >
                {index + 1} / {images.length}
              </motion.div>
            )}

            {/* Thumbnails */}
            {images.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-4 flex gap-2 max-w-full overflow-x-auto py-3 px-3 scrollbar-hide"
              >
                {images.map((image, imgIndex) => (
                  <motion.button
                    key={imgIndex}
                    onClick={() => onNext(imgIndex)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-150 ${
                      imgIndex === index
                        ? "border-[#FFD601] scale-105 shadow-lg"
                        : "border-white/30 hover:border-white/50"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${imgIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.button>
                ))}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
