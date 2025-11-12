"use client";

import { motion, AnimatePresence, useAnimation } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useRef, useState, useEffect, useMemo, useCallback } from "react";

// Network monitoring hook
function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [effectiveType, setEffectiveType] = useState("");

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    if (navigator.connection) {
      const updateConnection = () => {
        setEffectiveType(navigator.connection.effectiveType);
        setIsOnline(navigator.onLine);
      };

      navigator.connection.addEventListener("change", updateConnection);
      updateConnection();

      return () => {
        navigator.connection.removeEventListener("change", updateConnection);
      };
    } else {
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  return { isOnline, effectiveType };
}

// Image preloading helper
function useImagePreload(images, currentIndex) {
  const [loadedImages, setLoadedImages] = useState(new Set());

  useEffect(() => {
    const preloadImages = async () => {
      const imagesToPreload = [
        images[currentIndex], // Current image
        images[currentIndex + 1], // Next image
        images[currentIndex - 1], // Previous image
      ].filter(Boolean); // Remove undefined values

      for (const imageUrl of imagesToPreload) {
        if (!loadedImages.has(imageUrl)) {
          try {
            await new Promise((resolve, reject) => {
              const img = new Image();
              img.onload = resolve;
              img.onerror = reject;
              img.src = imageUrl;
            });
            setLoadedImages((prev) => new Set(prev).add(imageUrl));
          } catch (error) {
            console.warn(`Failed to preload image: ${imageUrl}`);
          }
        }
      }
    };

    if (images.length > 0) {
      preloadImages();
    }
  }, [images, currentIndex, loadedImages]);

  return { isImageLoaded: (url) => loadedImages.has(url) };
}

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
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const controls = useAnimation();
  const imgRef = useRef(null);

  // Network status monitoring
  const { isOnline, effectiveType } = useNetworkStatus();

  // Parse images
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

  // Image preloading
  const { isImageLoaded } = useImagePreload(parsedImages, index);

  // Reset states when image changes
  useEffect(() => {
    setIsZoomed(false);
    setImageLoading(true);
    setImageError(false);
    controls.start({ scale: 1 });
  }, [index, controls]);

  // Double tap zoom with better animation
  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap < 300) {
      const newZoomState = !isZoomed;
      setIsZoomed(newZoomState);
      controls.start({
        scale: newZoomState ? 2 : 1,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration: 0.3,
        },
      });
    }
    setLastTap(now);
  }, [lastTap, isZoomed, controls]);

  // Enhanced touch handlers for smoother swipes
  const handleTouchStart = useCallback((e) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchEndX(e.touches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e) => {
    setTouchEndX(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    const swipeDistance = touchStartX - touchEndX;
    const minSwipeDistance = 50;

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        onNext?.();
      } else {
        onPrev?.();
      }
    }
  }, [touchStartX, touchEndX, onNext, onPrev]);

  // Image load handlers
  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageLoading(false);
    setImageError(true);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!open) return;

      switch (e.key) {
        case "ArrowLeft":
          onPrev?.();
          break;
        case "ArrowRight":
          onNext?.();
          break;
        case "Escape":
          onClose?.();
          break;
        case " ":
          handleDoubleTap();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onPrev, onNext, onClose, handleDoubleTap]);

  const currentImage = parsedImages[index];

  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Network Status Indicator */}
          {!isOnline && (
            <motion.div
              className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500/90 text-white px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-sm"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <WifiOff size={16} />
              <span className="text-sm font-medium">
                No Internet Connection
              </span>
            </motion.div>
          )}

          {effectiveType && effectiveType !== "4g" && isOnline && (
            <motion.div
              className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-500/90 text-white px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-sm"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <Wifi size={16} />
              <span className="text-sm font-medium">
                Slow Network ({effectiveType})
              </span>
            </motion.div>
          )}

          {/* Modal Content */}
          {parsedImages.length > 0 && (
            <motion.div
              className="relative w-full max-w-5xl max-h-[90vh] flex flex-col items-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
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
                    onClick={() => window.open(currentImage, "_blank")}
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

              {/* Main Image Container */}
              <motion.div
                className="relative w-full h-full flex items-center justify-center overflow-hidden"
                drag={!isZoomed ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
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
                {/* Loading State */}
                {imageLoading && isImageLoaded(currentImage) && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </motion.div>
                )}

                {/* Error State */}
                {imageError && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-gray-800/50 rounded-2xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="text-white text-center">
                      <p className="text-lg font-medium">
                        Failed to load image
                      </p>
                      <p className="text-sm opacity-75 mt-1">
                        Please check your connection
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Main Image */}
                <motion.img
                  key={index}
                  ref={imgRef}
                  src={currentImage}
                  alt={`${title} ${index + 1}`}
                  className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl select-none touch-none"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{
                    duration: 0.3,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  onTap={handleDoubleTap}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  style={{
                    cursor: isZoomed ? "grab" : "default",
                  }}
                  whileDrag={{ cursor: "grabbing" }}
                />

                {/* Navigation Arrows */}
                {parsedImages.length > 1 && (
                  <>
                    <motion.button
                      onClick={onPrev}
                      whileHover={{
                        scale: 1.1,
                        backgroundColor: "rgba(255,255,255,0.25)",
                      }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/10 text-white p-3 rounded-full backdrop-blur-sm border border-white/20 z-10"
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 text-white p-3 rounded-full backdrop-blur-sm border border-white/20 z-10"
                    >
                      <ChevronRight size={26} />
                    </motion.button>
                  </>
                )}
              </motion.div>

              {/* Counter */}
              {parsedImages.length > 1 && (
                <motion.div
                  className="mt-4 text-white/80 text-sm font-medium bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {index + 1} / {parsedImages.length}
                </motion.div>
              )}

              {/* Thumbnails */}
              {parsedImages.length > 1 && (
                <motion.div
                  className="mt-4 flex gap-2 max-w-full overflow-x-auto py-3 px-3 scrollbar-hide"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {parsedImages.map((img, i) => (
                    <motion.button
                      key={i}
                      onClick={() => {
                        // This should probably be a separate callback like onThumbnailClick
                        if (i > index) onNext?.(i - index);
                        else if (i < index) onPrev?.(index - i);
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        i === index
                          ? "border-[#FFD601] scale-105 shadow-lg"
                          : "border-white/30 hover:border-white/50"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${i + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
