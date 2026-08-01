import type { MetadataRoute } from "next";

/** URL absoluta de producción. */
const SITE = "https://ccmieles.cl";

/**
 * robots.txt nativo del App Router.
 * - Permite el rastreo de todo el contenido público a cualquier bot limpio.
 * - Bloquea el panel administrativo (/admin y subrutas), el login y la API,
 *   que no deben indexarse.
 * - Declara el sitemap absoluto para Google Search Console.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/login", "/api/"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
