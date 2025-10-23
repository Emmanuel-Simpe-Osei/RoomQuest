"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

// ✅ Default export (very important!)
export default function ImageUploader({
  onUploadComplete,
  existingImages = [],
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // ✅ Upload to Cloudinary (unsigned)
  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    try {
      const uploaded = [];

      // Use environment variables for cloud name and preset
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);
        formData.append("folder", "roomquest/rooms");

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: formData }
        );

        const data = await uploadRes.json();

        if (data.secure_url) {
          uploaded.push(data.secure_url);
        } else {
          console.error("Upload error:", data);
        }
      }

      const allImages = [...existingImages, ...uploaded];
      onUploadComplete(allImages);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Cloudinary upload failed:", err);
      alert("❌ Upload failed. Please check your connection and try again.");
    } finally {
      setUploading(false);
    }
  };

  // ✅ Remove an image from preview list
  const handleRemove = (index) => {
    const updated = existingImages.filter((_, i) => i !== index);
    onUploadComplete(updated);
  };

  return (
    <div className="space-y-3">
      <label className="block font-semibold text-[#FFD601]">
        Upload Room Images
      </label>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        multiple
        onChange={handleUpload}
        disabled={uploading}
        className="w-full p-2 bg-[#1A2D7A] text-white rounded-lg border border-[#FFD601]/40 cursor-pointer hover:border-[#FFD601]/60 transition"
      />

      {uploading && (
        <p className="text-sm text-yellow-400 animate-pulse">
          Uploading images...
        </p>
      )}

      {/* ✅ Preview Section */}
      {existingImages.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-3">
          {existingImages.map((url, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-lg overflow-hidden border border-[#FFD601]/30 group"
            >
              <Image
                src={url}
                alt={`Room Image ${i + 1}`}
                width={200}
                height={150}
                className="object-cover w-full h-28 transition-transform duration-300 group-hover:scale-105"
              />
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-600 text-white text-xs px-2 py-1 rounded shadow"
              >
                ✕
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Debug Info */}
      <div className="text-xs text-blue-300 mt-2">
        Images in uploader: {existingImages.length}
      </div>
    </div>
  );
}
