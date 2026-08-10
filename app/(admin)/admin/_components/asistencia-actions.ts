"use server";

import { createServerSupabase } from "@/src/utils/supabase-server";

/**
 * Server Actions de Asistencia y Check-in (tablas `eventos_cultos` y
 * `asistencias`). Validan sesión + rol (admin/pastor/lider/secretaria) como
 * defensa en profundidad sobre la RLS, y sanean el input. La auditoría la
 * registran los triggers de BD (M8).
 */

const ROLES_OK = ["admin", "pastor", "lider", "secretaria"];

export type TipoSesion = "culto" | "evento";

export type SesionInput = {
  nombre: string;
  tipo: TipoSesion;
  fecha: string; // YYYY-MM-DD
  hora: string | null;
  descripcion: string | null;
};

export type SesionRow = {
  id: string;
  nombre: string;
  tipo: TipoSesion;
  fecha: string;
  hora: string | null;
  descripcion: string | null;
  cerrada_at: string | null;
  creado_at: string | null;
};

export type CheckInInput = {
  evento_culto_id: string;
  miembro_id?: string | null;
  visitante_nombre?: string | null;
};

export type AsistenciaRow = {
  id: string;
  evento_culto_id: string;
  miembro_id: string | null;
  visitante_nombre: string | null;
  tipo_asistente: "miembro" | "visitante";
  registrado_at: string;
};

export type Resultado<T = undefined> = { ok: boolean; error?: string; data?: T };

const SES_COLS =
  "id, nombre, tipo, fecha, hora, descripcion, cerrada_at, creado_at";
const ASIS_COLS =
  "id, evento_culto_id, miembro_id, visitante_nombre, tipo_asistente, registrado_at";

async function getCtx() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: rol } = await supabase.rpc("mi_rol");
  return { supabase, userId: user.id, rol: (rol as string | null) ?? "" };
}

const t = (v: string | null | undefined) => {
  const s = (v ?? "").trim();
  return s === "" ? null : s;
};

const SIN_SESION = { ok: false as const, error: "Sesión expirada. Vuelve a iniciar sesión." };
const SIN_PERMISO = {
  ok: false as const,
  error: "No tienes permisos para gestionar la asistencia.",
};

// ---------- Sesiones (eventos_cultos) ----------

/** Crea (apertura) un culto/evento para tomar asistencia. */
export async function crearSesionCulto(
  input: SesionInput,
): Promise<Resultado<SesionRow>> {
  const ctx = await getCtx();
  if (!ctx) return SIN_SESION;
  if (!ROLES_OK.includes(ctx.rol)) return SIN_PERMISO;

  const nombre = (input.nombre ?? "").trim();
  if (!nombre) return { ok: false, error: "El nombre de la sesión es obligatorio." };
  if (input.tipo !== "culto" && input.tipo !== "evento") {
    return { ok: false, error: "El tipo debe ser culto o evento." };
  }

  const fila = {
    nombre,
    tipo: input.tipo,
    fecha: input.fecha || new Date().toISOString().slice(0, 10),
    hora: t(input.hora),
    descripcion: t(input.descripcion),
  };
  const { data, error } = await ctx.supabase
    .from("eventos_cultos")
    .insert(fila)
    .select(SES_COLS)
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: data as SesionRow };
}

/** Edita los datos de una sesión. */
export async function actualizarSesionCulto(
  id: string,
  input: SesionInput,
): Promise<Resultado<SesionRow>> {
  const ctx = await getCtx();
  if (!ctx) return SIN_SESION;
  if (!ROLES_OK.includes(ctx.rol)) return SIN_PERMISO;

  const nombre = (input.nombre ?? "").trim();
  if (!nombre) return { ok: false, error: "El nombre de la sesión es obligatorio." };
  if (input.tipo !== "culto" && input.tipo !== "evento") {
    return { ok: false, error: "El tipo debe ser culto o evento." };
  }

  const { data, error } = await ctx.supabase
    .from("eventos_cultos")
    .update({
      nombre,
      tipo: input.tipo,
      fecha: input.fecha,
      hora: t(input.hora),
      descripcion: t(input.descripcion),
      actualizado_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(SES_COLS)
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: data as SesionRow };
}

/** Marca la sesión como finalizada (o la reabre con cerrar=false). */
export async function cerrarSesionCulto(
  id: string,
  cerrar = true,
): Promise<Resultado<SesionRow>> {
  const ctx = await getCtx();
  if (!ctx) return SIN_SESION;
  if (!ROLES_OK.includes(ctx.rol)) return SIN_PERMISO;

  const { data, error } = await ctx.supabase
    .from("eventos_cultos")
    .update({
      cerrada_at: cerrar ? new Date().toISOString() : null,
      actualizado_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(SES_COLS)
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: data as SesionRow };
}

/** Elimina una sesión (SOFT-DELETE: marca `eliminado_at`). */
export async function eliminarSesionCulto(id: string): Promise<Resultado> {
  const ctx = await getCtx();
  if (!ctx) return SIN_SESION;
  if (!ROLES_OK.includes(ctx.rol)) return SIN_PERMISO;

  const { error } = await ctx.supabase
    .from("eventos_cultos")
    .update({ eliminado_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ---------- Check-in / Check-out (asistencias) ----------

/** Registra la asistencia de un miembro (miembro_id) o un visitante. */
export async function registrarCheckIn(
  input: CheckInInput,
): Promise<Resultado<AsistenciaRow>> {
  const ctx = await getCtx();
  if (!ctx) return SIN_SESION;
  if (!ROLES_OK.includes(ctx.rol)) return SIN_PERMISO;

  if (!input.evento_culto_id) {
    return { ok: false, error: "Falta la sesión de culto/evento." };
  }
  const miembroId = input.miembro_id || null;
  const visitante = t(input.visitante_nombre);
  if (!miembroId && !visitante) {
    return { ok: false, error: "Indica un miembro o el nombre del visitante." };
  }

  const fila: {
    evento_culto_id: string;
    miembro_id?: string;
    visitante_nombre?: string;
    tipo_asistente: "miembro" | "visitante";
  } = {
    evento_culto_id: input.evento_culto_id,
    tipo_asistente: miembroId ? "miembro" : "visitante",
  };
  if (miembroId) fila.miembro_id = miembroId;
  else if (visitante) fila.visitante_nombre = visitante;

  const { data, error } = await ctx.supabase
    .from("asistencias")
    .insert(fila)
    .select(ASIS_COLS)
    .single();
  if (error) {
    // 23505 = violación del índice único parcial → miembro ya presente.
    if (error.code === "23505") {
      return { ok: false, error: "El miembro ya está registrado en esta sesión." };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true, data: data as AsistenciaRow };
}

/** Deshace una asistencia (SOFT-DELETE reversible: marca `eliminado_at`). */
export async function registrarCheckOut(
  asistenciaId: string,
): Promise<Resultado> {
  const ctx = await getCtx();
  if (!ctx) return SIN_SESION;
  if (!ROLES_OK.includes(ctx.rol)) return SIN_PERMISO;

  const { error } = await ctx.supabase
    .from("asistencias")
    .update({ eliminado_at: new Date().toISOString() })
    .eq("id", asistenciaId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
