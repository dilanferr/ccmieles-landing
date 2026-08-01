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
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },

  // Redirecciones 301/308 permanentes hacia la URL canónica.
  // Limpian URLs viejas/malformadas que Google descubrió por enlaces externos.
  async redirects() {
    return [
      // URL malformada indexada (enlace externo roto) → página real de Entrevistas.
      {
        source: "/entrevistasEntrevistas",
        destination: "/entrevistas",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
