import { v2 as cloudinary } from "cloudinary";

// ✅ Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    // 🧠 Optional: Generate secure signature for signed uploads (if needed later)
    const timestamp = Math.round(new Date().getTime() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder: "roomquest/rooms",
      },
      process.env.CLOUDINARY_API_SECRET
    );

    // ✅ Return both unsigned + signed upload config
    return Response.json({
      message: "Cloudinary config ready",
      mode: "unsigned", // ✅ You’re currently using unsigned uploads
      timestamp,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET, // 🔑 this ensures the correct preset
      folder: "roomquest/rooms",
    });
  } catch (error) {
    console.error("Cloudinary Sign Error:", error);
    return Response.json(
      { error: "❌ Failed to generate Cloudinary config" },
      { status: 500 }
    );
  }
}
