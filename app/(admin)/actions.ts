"use server";

import { redirect } from "next/navigation";
import { createServerSupabase } from "@/src/utils/supabase-server";

/* ============================================================
   CERRAR SESIÓN (usada por la cabecera del panel)
   ============================================================ */
export async function cerrarSesion(): Promise<void> {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/login");
}
