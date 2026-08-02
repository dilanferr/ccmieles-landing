"use server";

import { createServerSupabase } from "@/src/utils/supabase-server";

/**
 * Server Actions de Turnos y Servidores.
 * RLS restringe a admin/pastor/lider. No se expone en la web pública.
 */

export type TurnoInput = {
  fecha: string;
  equipo_id: string;
  miembro_id: string | null;
  rol_en_equipo: string | null;
  notas: string | null;
};

export type TurnoRow = {
  id: string;
  fecha: string;
  equipo_id: string;
  miembro_id: string | null;
  rol_en_equipo: string | null;
  notas: string | null;
};

export type Resultado<T = undefined> = { ok: boolean; error?: string; data?: T };

const COLS = "id, fecha, equipo_id, miembro_id, rol_en_equipo, notas";

async function getAdmin() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? supabase : null;
}

function prep(input: TurnoInput): { error: string } | { data: TurnoInput } {
  if (!input.fecha) return { error: "La fecha es obligatoria." };
  if (!input.equipo_id) return { error: "El equipo es obligatorio." };
  if (!input.miembro_id) return { error: "Debes seleccionar un servidor." };
  return {
    data: {
      fecha: input.fecha,
      equipo_id: input.equipo_id,
      miembro_id: input.miembro_id,
      rol_en_equipo: input.rol_en_equipo?.trim() || null,
      notas: input.notas?.trim() || null,
    },
  };
}

/** Crea un turno (INSERT) y devuelve la fila creada. */
export async function crearTurno(
  input: TurnoInput,
): Promise<Resultado<TurnoRow>> {
  const supabase = await getAdmin();
  if (!supabase) return { ok: false, error: "Sesión expirada." };
  const p = prep(input);
  if ("error" in p) return { ok: false, error: p.error };

  const { data, error } = await supabase
    .from("turnos_servidores")
    .insert(p.data)
    .select(COLS)
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: data as TurnoRow };
}

/** Actualiza un turno (UPDATE) y devuelve la fila actualizada. */
export async function actualizarTurno(
  id: string,
  input: TurnoInput,
): Promise<Resultado<TurnoRow>> {
  const supabase = await getAdmin();
  if (!supabase) return { ok: false, error: "Sesión expirada." };
  const p = prep(input);
  if ("error" in p) return { ok: false, error: p.error };

  const { data, error } = await supabase
    .from("turnos_servidores")
    .update(p.data)
    .eq("id", id)
    .select(COLS)
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: data as TurnoRow };
}

/** Elimina un turno (DELETE). */
export async function eliminarTurno(id: string): Promise<Resultado> {
  const supabase = await getAdmin();
  if (!supabase) return { ok: false, error: "Sesión expirada." };
  const { error } = await supabase
    .from("turnos_servidores")
    .delete()
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
