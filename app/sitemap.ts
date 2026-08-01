import type { MetadataRoute } from "next";
import { createPublicClient } from "@/src/utils/supabase-public";
import { GRUPOS } from "@/app/data/iglesia";

/** URL absoluta de producción. */
const SITE = "https://ccmieles.cl";

// Regenera el sitemap cada hora para reflejar los eventos nuevos (ISR).
export const revalidate = 3600;

/**
 * sitemap.xml dinámico del App Router.
 * Combina TODAS las rutas públicas fijas + las páginas de ministerios
 * (/grupos/*) + una ruta por cada evento activo leído desde Supabase.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const ahora = new Date();

  // --- Rutas públicas fijas (prioridades y frecuencias definidas) ---
  const fijas: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, lastModified: ahora, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE}/nosotros`, lastModified: ahora, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/eventos`, lastModified: ahora, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE}/testimonios`, lastModified: ahora, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE}/comunidad`, lastModified: ahora, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE}/entrevistas`, lastModified: ahora, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE}/departamento-visitas`, lastModified: ahora, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/oracion-peticion`, lastModified: ahora, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/coro`, lastModified: ahora, changeFrequency: "monthly", priority: 0.5 },
  ];

  // --- Páginas de ministerios (/grupos/*), derivadas de los datos ---
  // Se agregan solas si en el futuro se crea un grupo nuevo en GRUPOS.
  const grupos: MetadataRoute.Sitemap = GRUPOS.map(
    (g): MetadataRoute.Sitemap[number] => ({
      url: `${SITE}/grupos/${g.slug}`,
      lastModified: ahora,
      changeFrequency: "monthly",
      priority: 0.7,
    }),
  );

  // --- Rutas dinámicas: un evento por slug, con creado_at como lastModified ---
  let eventos: MetadataRoute.Sitemap = [];
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("eventos")
      .select("slug, creado_at, estado");

    if (!error && data) {
      eventos = data
        .filter(
          (e) =>
            e.slug && e.estado !== "borrador" && e.estado !== "archivado",
        )
        .map((e): MetadataRoute.Sitemap[number] => ({
          url: `${SITE}/eventos/${e.slug}`,
          lastModified: e.creado_at ? new Date(e.creado_at) : ahora,
          changeFrequency: "weekly",
          priority: 0.6,
        }));
    }
  } catch {
    // Si Supabase no responde, el sitemap se genera igual con las rutas fijas.
  }

  return [...fijas, ...grupos, ...eventos];
}
