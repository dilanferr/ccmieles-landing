import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Protección ante "desfase de versiones" (version skew). Al publicar una
  // versión nueva mientras alguien tiene el sitio abierto, si el cliente detecta
  // un ID de despliegue distinto al del servidor, Next hace una RECARGA COMPLETA
  // limpia en vez de fallar al pedir un archivo JS/CSS viejo (ChunkLoadError).
  // En Vercel, VERCEL_GIT_COMMIT_SHA cambia en cada despliegue; en local queda
  // sin definir y no afecta al desarrollo.
  deploymentId: process.env.VERCEL_GIT_COMMIT_SHA,

  images: {
    // Formatos modernos: sirve AVIF (más liviano) con fallback a WebP.
    formats: ["image/avif", "image/webp"],
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

  // Cabeceras de seguridad HTTP aplicadas a todas las rutas (M6).
  //  · HSTS: fuerza HTTPS (2 años + subdominios + preload).
  //  · X-Frame-Options DENY / X-Content-Type-Options nosniff: anti clickjacking/MIME-sniffing.
  //  · Referrer-Policy: no filtra la ruta completa a terceros.
  //  · Permissions-Policy: desactiva APIs de dispositivo que la app no usa.
  async headers() {
    const securityHeaders = [
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
      },
    ];
    return [{ source: "/:path*", headers: securityHeaders }];
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
