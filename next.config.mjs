/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // ✅ For Cloudinary-hosted images
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com", // ✅ For Unsplash hero/about images
      },
    ],
  },
};

export default nextConfig;
