"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/src/utils/supabase-server";

/**
 * Revalidación bajo demanda del sitio público tras cambios de configuración/SEO.
 * `site_settings` afecta los metadatos (title/description) y el pie de página en
 * TODO el layout, por eso se revalida a nivel de layout. Requiere sesión.
 * (Eventos y noticias ya revalidan en sus propias Server Actions.)
 */
export async function revalidarSitio(): Promise<{ ok: boolean }> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };
  revalidatePath("/", "layout");
  return { ok: true };
}
