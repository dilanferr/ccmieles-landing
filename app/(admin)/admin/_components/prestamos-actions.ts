"use server";

import { createServerSupabase } from "@/src/utils/supabase-server";

/**
 * Server Actions de préstamos de bienes (tabla `prestamos_bienes`).
 * Un préstamo con `fecha_devolucion_real IS NULL` está vigente. Validan
 * sesión + rol (admin/pastor/logistica) y sanean el input; la auditoría la
 * registran los triggers de BD.
 */

const ROLES_OK = ["admin", "pastor", "logistica"];

export type PrestamoInput = {
  bien_id: string;
  miembro_id: string | null;
  cantidad: number;
  fecha_prestamo: string; // YYYY-MM-DD
  fecha_devolucion_esperada: string | null;
  notas: string | null;
};

export type PrestamoRow = {
  id: string;
  bien_id: string;
  miembro_id: string | null;
  cantidad: number;
  fecha_prestamo: string;
  fecha_devolucion_esperada: string | null;
  fecha_devolucion_real: string | null;
  notas: string | null;
};

export type Resultado<T = undefined> = { ok: boolean; error?: string; data?: T };

const COLS =
  "id, bien_id, miembro_id, cantidad, fecha_prestamo, fecha_devolucion_esperada, fecha_devolucion_real, notas";

async function getCtx() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: rol } = await supabase.rpc("mi_rol");
  return { supabase, userId: user.id, rol: (rol as string | null) ?? "" };
}

/** Registra un préstamo (INSERT) y devuelve la fila creada. */
export async function crearPrestamo(
  input: PrestamoInput,
): Promise<Resultado<PrestamoRow>> {
  const ctx = await getCtx();
  if (!ctx) return { ok: false, error: "Sesión expirada. Vuelve a iniciar sesión." };
  if (!ROLES_OK.includes(ctx.rol)) {
    return { ok: false, error: "No tienes permisos para gestionar préstamos." };
  }

  if (!input.bien_id) return { ok: false, error: "Falta el bien a prestar." };
  if (!input.miembro_id) {
    return { ok: false, error: "Debes indicar a quién se presta el bien." };
  }
  const cantidad = Math.round(Number(input.cantidad));
  if (!Number.isFinite(cantidad) || cantidad <= 0) {
    return { ok: false, error: "La cantidad debe ser mayor a 0." };
  }

  const fila = {
    bien_id: input.bien_id,
    miembro_id: input.miembro_id,
    cantidad,
    fecha_prestamo: input.fecha_prestamo || new Date().toISOString().slice(0, 10),
    fecha_devolucion_esperada: input.fecha_devolucion_esperada || null,
    notas: input.notas?.trim() || null,
  };

  const { data, error } = await ctx.supabase
    .from("prestamos_bienes")
    .insert(fila)
    .select(COLS)
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: data as PrestamoRow };
}

/**
 * Registra la devolución de un préstamo vigente (marca `fecha_devolucion_real`).
 * El filtro `.is("fecha_devolucion_real", null)` evita devolver dos veces.
 */
export async function registrarDevolucion(
  id: string,
  fecha?: string,
): Promise<Resultado<PrestamoRow>> {
  const ctx = await getCtx();
  if (!ctx) return { ok: false, error: "Sesión expirada. Vuelve a iniciar sesión." };
  if (!ROLES_OK.includes(ctx.rol)) {
    return { ok: false, error: "No tienes permisos para gestionar préstamos." };
  }

  const fecha_devolucion_real = fecha || new Date().toISOString().slice(0, 10);
  const { data, error } = await ctx.supabase
    .from("prestamos_bienes")
    .update({ fecha_devolucion_real })
    .eq("id", id)
    .is("fecha_devolucion_real", null)
    .select(COLS)
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data) {
    return { ok: false, error: "El préstamo ya fue devuelto o no existe." };
  }
  return { ok: true, data: data as PrestamoRow };
}

/** Elimina un registro de préstamo (para corregir un error de captura). */
export async function eliminarPrestamo(id: string): Promise<Resultado> {
  const ctx = await getCtx();
  if (!ctx) return { ok: false, error: "Sesión expirada. Vuelve a iniciar sesión." };
  if (!ROLES_OK.includes(ctx.rol)) {
    return { ok: false, error: "No tienes permisos para gestionar préstamos." };
  }
  const { error } = await ctx.supabase
    .from("prestamos_bienes")
    .delete()
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
