"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/src/utils/supabase-server";

/**
 * Server Actions del módulo de Noticias / Blog.
 * Toda ESCRITURA pasa por aquí para respetar RLS con la sesión del
 * administrador y revalidar la web pública (testimonios en /testimonios y la
 * home) al instante.
 */

export type NoticiaInput = {
  titulo: string;
  autor: string | null;
  tipo: string;
  imagen_url: string | null;
  contenido: string;
};

export type Resultado = { ok: boolean; error?: string };

async function getAdminClient() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? supabase : null;
}

/** Revalida las rutas públicas que muestran contenido de `noticias`. */
function revalidarPublico() {
  revalidatePath("/testimonios");
  revalidatePath("/comunidad");
  revalidatePath("/");
}

/** Normaliza y valida el input; devuelve null si falta algo obligatorio. */
function normalizar(input: NoticiaInput) {
  const titulo = input.titulo.trim();
  const contenido = input.contenido.trim();
  if (!titulo || !contenido) return null;
  return {
    titulo,
    autor: input.autor?.trim() || null,
    tipo: input.tipo,
    imagen_url: input.imagen_url?.trim() || null,
    contenido,
  };
}

/** Crea una publicación (INSERT) y refresca la web pública. */
export async function crearNoticia(input: NoticiaInput): Promise<Resultado> {
  const supabase = await getAdminClient();
  if (!supabase) {
    return { ok: false, error: "Sesión expirada. Vuelve a iniciar sesión." };
  }
  const data = normalizar(input);
  if (!data) {
    return { ok: false, error: "El título y el contenido son obligatorios." };
  }

  const { error } = await supabase.from("noticias").insert(data);
  if (error) return { ok: false, error: error.message };

  revalidarPublico();
  return { ok: true };
}

/** Actualiza una publicación (UPDATE) y refresca la web pública. */
export async function actualizarNoticia(
  id: string | number,
  input: NoticiaInput,
): Promise<Resultado> {
  const supabase = await getAdminClient();
  if (!supabase) {
    return { ok: false, error: "Sesión expirada. Vuelve a iniciar sesión." };
  }
  const data = normalizar(input);
  if (!data) {
    return { ok: false, error: "El título y el contenido son obligatorios." };
  }

  const { error } = await supabase
    .from("noticias")
    .update(data)
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidarPublico();
  return { ok: true };
}

/** Elimina una publicación (DELETE) y refresca la web pública. */
export async function eliminarNoticia(id: string | number): Promise<Resultado> {
  const supabase = await getAdminClient();
  if (!supabase) {
    return { ok: false, error: "Sesión expirada. Vuelve a iniciar sesión." };
  }

  const { error } = await supabase.from("noticias").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidarPublico();
  return { ok: true };
}
