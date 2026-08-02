"use server";

import { createServerSupabase } from "@/src/utils/supabase-server";

/**
 * Server Actions de la matriz de Servicios Semanales.
 * Tabla interna (no pública): toda ESCRITURA pasa por aquí y respeta RLS
 * con la sesión del administrador. No revalida rutas públicas porque estos
 * datos no se muestran en el sitio.
 */

export type ServicioInput = {
  dia: string;
  fecha: string | null;
  hora: string | null;
  actividad: string;
  encargado: string | null;
};

export type ServicioRow = {
  id: string;
  dia: string;
  fecha: string | null;
  hora: string | null;
  actividad: string;
  encargado: string | null;
};

export type Resultado<T = undefined> = {
  ok: boolean;
  error?: string;
  data?: T;
};

async function getAdminClient() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? supabase : null;
}

/** Crea un servicio (INSERT) y devuelve la fila creada. */
export async function crearServicio(
  input: ServicioInput,
): Promise<Resultado<ServicioRow>> {
  const supabase = await getAdminClient();
  if (!supabase) {
    return { ok: false, error: "Sesión expirada. Vuelve a iniciar sesión." };
  }

  const dia = input.dia.trim();
  const actividad = input.actividad.trim();
  if (!dia || !actividad) {
    return { ok: false, error: "El día y la actividad son obligatorios." };
  }

  const { data, error } = await supabase
    .from("servicios_semanales")
    .insert({
      dia,
      fecha: input.fecha || null,
      hora: input.hora?.trim() || null,
      actividad,
      encargado: input.encargado?.trim() || null,
    })
    .select("id, dia, fecha, hora, actividad, encargado")
    .single();

  if (error) return { ok: false, error: error.message };

  return { ok: true, data: data as ServicioRow };
}

/** Actualiza un servicio (UPDATE) y devuelve la fila actualizada. */
export async function actualizarServicio(
  id: string | number,
  input: ServicioInput,
): Promise<Resultado<ServicioRow>> {
  const supabase = await getAdminClient();
  if (!supabase) {
    return { ok: false, error: "Sesión expirada. Vuelve a iniciar sesión." };
  }

  const dia = input.dia.trim();
  const actividad = input.actividad.trim();
  if (!dia || !actividad) {
    return { ok: false, error: "El día y la actividad son obligatorios." };
  }

  const { data, error } = await supabase
    .from("servicios_semanales")
    .update({
      dia,
      fecha: input.fecha || null,
      hora: input.hora?.trim() || null,
      actividad,
      encargado: input.encargado?.trim() || null,
    })
    .eq("id", id)
    .select("id, dia, fecha, hora, actividad, encargado")
    .single();

  if (error) return { ok: false, error: error.message };

  return { ok: true, data: data as ServicioRow };
}

/** Elimina un servicio (DELETE). */
export async function eliminarServicio(
  id: string | number,
): Promise<Resultado> {
  const supabase = await getAdminClient();
  if (!supabase) {
    return { ok: false, error: "Sesión expirada. Vuelve a iniciar sesión." };
  }

  const { error } = await supabase
    .from("servicios_semanales")
    .delete()
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  return { ok: true };
}
