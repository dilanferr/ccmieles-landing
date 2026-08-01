"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/src/utils/supabase-server";

/**
 * Server Actions del módulo de Clasificados (diario mural).
 * Toda ESCRITURA pasa por aquí para respetar RLS con la sesión del
 * administrador y revalidar la web pública (/comunidad) al instante.
 */

export type ClasificadoInput = {
  categoria: string;
  titulo: string;
  descripcion: string;
  autor: string;
};

export type Resultado = { ok: boolean; error?: string };

async function getAdminClient() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? supabase : null;
}

/** Crea un aviso (INSERT) y refresca el diario mural público. */
export async function crearClasificado(
  input: ClasificadoInput,
): Promise<Resultado> {
  const supabase = await getAdminClient();
  if (!supabase) {
    return { ok: false, error: "Sesión expirada. Vuelve a iniciar sesión." };
  }

  const categoria = input.categoria.trim();
  const titulo = input.titulo.trim();
  const descripcion = input.descripcion.trim();
  const autor = input.autor.trim();

  if (!categoria || !titulo || !descripcion || !autor) {
    return { ok: false, error: "Todos los campos son obligatorios." };
  }

  const { error } = await supabase
    .from("clasificados")
    .insert({ categoria, titulo, descripcion, autor });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/comunidad");
  return { ok: true };
}

/** Actualiza un aviso (UPDATE) y refresca el diario mural público. */
export async function actualizarClasificado(
  id: string | number,
  input: ClasificadoInput,
): Promise<Resultado> {
  const supabase = await getAdminClient();
  if (!supabase) {
    return { ok: false, error: "Sesión expirada. Vuelve a iniciar sesión." };
  }

  const categoria = input.categoria.trim();
  const titulo = input.titulo.trim();
  const descripcion = input.descripcion.trim();
  const autor = input.autor.trim();

  if (!categoria || !titulo || !descripcion || !autor) {
    return { ok: false, error: "Todos los campos son obligatorios." };
  }

  const { error } = await supabase
    .from("clasificados")
    .update({ categoria, titulo, descripcion, autor })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/comunidad");
  return { ok: true };
}

/** Elimina un aviso (DELETE) y refresca el diario mural público. */
export async function eliminarClasificado(
  id: string | number,
): Promise<Resultado> {
  const supabase = await getAdminClient();
  if (!supabase) {
    return { ok: false, error: "Sesión expirada. Vuelve a iniciar sesión." };
  }

  const { error } = await supabase.from("clasificados").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/comunidad");
  return { ok: true };
}
