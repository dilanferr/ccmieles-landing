import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Autoriza la optimización de imágenes servidas desde Cloudinary.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
