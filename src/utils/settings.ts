import { cache } from "react";
import { createPublicClient } from "@/src/utils/supabase-public";
import { IGLESIA } from "@/app/data/iglesia";

/**
 * Configuración del sitio editable desde el panel (tabla `site_settings`).
 * Si la tabla no existe o falla, devuelve los valores de `iglesia.ts` como
 * respaldo. `cache` deduplica la lectura dentro de un mismo render.
 */
export type SiteSettings = {
  nombre: string;
  ministerio: string;
  correo: string;
  direccion: string;
  mapsUrl: string;
  redes: {
    facebook: string;
    instagram: string;
    youtube: string;
    tiktok: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string;
  };
};

// Valores SEO por defecto (los del layout actual) como respaldo.
const SEO_DEFAULT = {
  title: "Centro Cristiano Mieles | Iglesia Cristiana en Quilicura",
  description:
    "Bienvenidos al Centro Cristiano Mieles en Quilicura. Ministerio Evangélico de Liberación del Espíritu Santo. Acompáñanos en nuestros cultos, eventos y ministerios familiares.",
  keywords:
    "iglesia cristiana en Quilicura, iglesia evangélica en Quilicura, Centro Cristiano Mieles, cultos cristianos en Quilicura, Ministerio Evangélico de Liberación del Espíritu Santo, iglesia en Quilicura Santiago, lugar de oración",
};

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const base: SiteSettings = {
    nombre: IGLESIA.nombre,
    ministerio: IGLESIA.ministerio,
    correo: IGLESIA.correo,
    direccion: IGLESIA.direccion,
    mapsUrl: IGLESIA.mapsUrl,
    redes: {
      facebook: IGLESIA.redes.facebook,
      instagram: IGLESIA.redes.instagram,
      youtube: IGLESIA.redes.youtube,
      tiktok: IGLESIA.redes.tiktok,
    },
    seo: { ...SEO_DEFAULT },
  };

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    if (error || !data) return base;

    return {
      nombre: data.nombre ?? base.nombre,
      ministerio: data.ministerio ?? base.ministerio,
      correo: data.correo ?? base.correo,
      direccion: data.direccion ?? base.direccion,
      mapsUrl: data.maps_url ?? base.mapsUrl,
      redes: {
        facebook: data.facebook ?? base.redes.facebook,
        instagram: data.instagram ?? base.redes.instagram,
        youtube: data.youtube ?? base.redes.youtube,
        tiktok: data.tiktok ?? base.redes.tiktok,
      },
      seo: {
        title: data.seo_title ?? base.seo.title,
        description: data.seo_description ?? base.seo.description,
        keywords: data.seo_keywords ?? base.seo.keywords,
      },
    };
  } catch {
    return base;
  }
});
