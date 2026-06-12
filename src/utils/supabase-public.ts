import { createClient } from "@supabase/supabase-js";

/**
 * Cliente de solo lectura para las páginas públicas (Server Components).
 * No usa cookies ni sesión: aprovecha las políticas RLS de "lectura pública".
 */
export const createPublicClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
