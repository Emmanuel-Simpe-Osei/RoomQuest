"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";

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
  if (!open || !images.length) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/95 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal Content */}
          <motion.div
            className="relative w-full max-w-6xl max-h-[90vh] flex flex-col items-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Controls */}
            <div className="absolute -top-16 left-0 right-0 flex justify-between items-center z-10">
              {/* Close Button */}
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-200 border border-white/20"
              >
                <X size={24} />
              </motion.button>

              {/* Download Button */}
              <motion.button
                onClick={() => window.open(images[index], "_blank")}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-200 border border-white/20"
              >
                <Download size={24} />
              </motion.button>
            </div>

            {/* Main Image */}
            <div className="relative w-full h-full flex items-center justify-center">
              <motion.img
                key={index}
                src={images[index]}
                alt={`Room image ${index + 1}`}
                className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              />

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <motion.button
                    onClick={onPrev}
                    whileHover={{
                      scale: 1.1,
                      backgroundColor: "rgba(255,255,255,0.2)",
                    }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 text-white p-4 rounded-full backdrop-blur-sm transition-all duration-200 border border-white/20"
                  >
                    <ChevronLeft size={28} />
                  </motion.button>

                  <motion.button
                    onClick={onNext}
                    whileHover={{
                      scale: 1.1,
                      backgroundColor: "rgba(255,255,255,0.2)",
                    }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 text-white p-4 rounded-full backdrop-blur-sm transition-all duration-200 border border-white/20"
                  >
                    <ChevronRight size={28} />
                  </motion.button>
                </>
              )}
            </div>

            {/* Image Counter */}
            {images.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 text-white/80 text-lg font-medium bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20"
              >
                {index + 1} / {images.length}
              </motion.div>
            )}

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 flex gap-3 max-w-full overflow-x-auto py-4 px-4 scrollbar-hide"
              >
                {images.map((image, imgIndex) => (
                  <motion.button
                    key={imgIndex}
                    onClick={() => onNext(imgIndex)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
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

            {/* Instructions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 text-white/60 text-sm text-center"
            >
              Click outside or press ESC to close • Use arrow keys to navigate
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
