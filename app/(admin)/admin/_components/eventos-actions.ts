"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/src/utils/supabase-server";

/**
 * Server Actions del módulo de Eventos.
 *
 * Se ejecutan SIEMPRE en el servidor para poder:
 *  - respetar RLS con la sesión del administrador (cookies de la petición),
 *  - revalidar la web pública tras cada cambio (ISR on-demand).
 *
 * La lista lateral del panel se lee desde el cliente (RLS de lectura pública),
 * pero toda ESCRITURA pasa por aquí.
 */

export type EventoInput = {
  nombre: string;
  descripcion: string | null;
  fecha_evento: string;
  hora_inicio: string | null;
  lugar: string | null;
  categoria: string;
  ministerio: string | null;
  predicador: string | null;
  imagen_url: string | null;
  /** Opcional: el botón "Cómo llegar" se arma solo desde la dirección (lugar). */
  mapa_url?: string | null;
  destacado: boolean;
  slug: string;
};

export type Resultado = { ok: boolean; error?: string };

/** Verifica que haya una sesión de administrador y devuelve el cliente server. */
async function getAdminClient() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? supabase : null;
}

/** Revalida las rutas públicas que muestran eventos. */
function revalidarPublico() {
  revalidatePath("/eventos");
  revalidatePath("/");
}

/** Crea un evento (INSERT) y refresca la web pública. */
export async function crearEvento(input: EventoInput): Promise<Resultado> {
  const supabase = await getAdminClient();
  if (!supabase) {
    return { ok: false, error: "Sesión expirada. Vuelve a iniciar sesión." };
  }

  if (!input.nombre.trim() || !input.fecha_evento) {
    return { ok: false, error: "El nombre y la fecha son obligatorios." };
  }

  const { error } = await supabase.from("eventos").insert({
    nombre: input.nombre.trim(),
    descripcion: input.descripcion?.trim() || null,
    fecha_evento: input.fecha_evento,
    hora_inicio: input.hora_inicio || null,
    lugar: input.lugar?.trim() || null,
    categoria: input.categoria,
    ministerio: input.ministerio?.trim() || null,
    predicador: input.predicador?.trim() || null,
    imagen_url: input.imagen_url?.trim() || null,
    mapa_url: input.mapa_url?.trim() || null,
    destacado: Boolean(input.destacado),
    slug: input.slug,
    estado: "publicado",
  });

  if (error) return { ok: false, error: error.message };

  revalidarPublico();
  return { ok: true };
}

/** Actualiza un evento existente (UPDATE) y refresca la web pública. */
export async function actualizarEvento(
  id: string | number,
  input: EventoInput,
): Promise<Resultado> {
  const supabase = await getAdminClient();
  if (!supabase) {
    return { ok: false, error: "Sesión expirada. Vuelve a iniciar sesión." };
  }

  if (!input.nombre.trim() || !input.fecha_evento) {
    return { ok: false, error: "El nombre y la fecha son obligatorios." };
  }

  const { error } = await supabase
    .from("eventos")
    .update({
      nombre: input.nombre.trim(),
      descripcion: input.descripcion?.trim() || null,
      fecha_evento: input.fecha_evento,
      hora_inicio: input.hora_inicio || null,
      lugar: input.lugar?.trim() || null,
      categoria: input.categoria,
      ministerio: input.ministerio?.trim() || null,
      predicador: input.predicador?.trim() || null,
      imagen_url: input.imagen_url?.trim() || null,
      mapa_url: input.mapa_url?.trim() || null,
      destacado: Boolean(input.destacado),
      slug: input.slug,
    })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidarPublico();
  return { ok: true };
}

/** Elimina un evento (DELETE) y refresca la web pública. */
export async function eliminarEvento(id: string | number): Promise<Resultado> {
  const supabase = await getAdminClient();
  if (!supabase) {
    return { ok: false, error: "Sesión expirada. Vuelve a iniciar sesión." };
  }

  const { error } = await supabase.from("eventos").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidarPublico();
  return { ok: true };
}
