"use server";

import { createServerSupabase } from "@/src/utils/supabase-server";

/**
 * Server Actions de Consolidación de Visitantes (pipeline pastoral).
 * Tablas `consolidacion` y `consolidacion_notas`. Validan sesión + rol
 * (admin/pastor/lider/secretaria) como defensa en profundidad sobre la RLS,
 * y sanean el input. La auditoría la registran los triggers de BD (M8).
 *
 * `convertirEnMiembro` crea una ficha en `miembros_iglesia` (datos sensibles):
 * por eso queda restringida a admin/pastor.
 */

const ROLES_OK = ["admin", "pastor", "lider", "secretaria"];
const ROLES_MIEMBRO = ["admin", "pastor"]; // crear ficha sensible

export type EstadoConsolidacion =
  | "recibido"
  | "contactado"
  | "en_proceso"
  | "integrado"
  | "no_continua";

export type TipoNota = "llamada" | "visita" | "oracion" | "general";

const ESTADOS: EstadoConsolidacion[] = [
  "recibido",
  "contactado",
  "en_proceso",
  "integrado",
  "no_continua",
];
const TIPOS_NOTA: TipoNota[] = ["llamada", "visita", "oracion", "general"];

export type ContactoInput = {
  nombre: string;
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
};

export type ConsolidacionRow = {
  id: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  estado: EstadoConsolidacion;
  responsable_id: string | null;
  origen: "asistencia" | "manual" | "web";
  asistencia_id: string | null;
  miembro_id: string | null;
  bautizado: boolean;
  fecha_bautismo: string | null;
  fecha_recepcion: string | null;
  creado_at: string | null;
};

export type NotaRow = {
  id: string;
  consolidacion_id: string;
  autor_id: string | null;
  tipo: TipoNota;
  nota: string;
  creado_at: string | null;
};

export type Resultado<T = undefined> = { ok: boolean; error?: string; data?: T };

const COLS =
  "id, nombre, telefono, email, direccion, estado, responsable_id, origen, asistencia_id, miembro_id, bautizado, fecha_bautismo, fecha_recepcion, creado_at";
const NOTA_COLS = "id, consolidacion_id, autor_id, tipo, nota, creado_at";

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
const hoyISO = () => new Date().toISOString().slice(0, 10);

const SIN_SESION = {
  ok: false as const,
  error: "Sesión expirada. Vuelve a iniciar sesión.",
};
const SIN_PERMISO = {
  ok: false as const,
  error: "No tienes permisos para gestionar la consolidación.",
};

// ---------- Alta ----------

/** Crea una consolidación manual (contacto que no vino por check-in). */
export async function crearConsolidacion(
  input: ContactoInput,
): Promise<Resultado<ConsolidacionRow>> {
  const ctx = await getCtx();
  if (!ctx) return SIN_SESION;
  if (!ROLES_OK.includes(ctx.rol)) return SIN_PERMISO;

  const nombre = (input.nombre ?? "").trim();
  if (!nombre) return { ok: false, error: "El nombre es obligatorio." };

  const { data, error } = await ctx.supabase
    .from("consolidacion")
    .insert({
      nombre,
      telefono: t(input.telefono),
      email: t(input.email),
      direccion: t(input.direccion),
      origen: "manual",
      estado: "recibido",
    })
    .select(COLS)
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: data as ConsolidacionRow };
}

/**
 * Envía un visitante del check-in al pipeline de consolidación. Idempotente:
 * el índice único parcial `(asistencia_id) where eliminado_at is null` impide
 * duplicar; si ya existe se traduce el 23505 a un mensaje claro.
 */
export async function consolidarDesdeAsistencia(
  asistenciaId: string,
): Promise<Resultado<ConsolidacionRow>> {
  const ctx = await getCtx();
  if (!ctx) return SIN_SESION;
  if (!ROLES_OK.includes(ctx.rol)) return SIN_PERMISO;
  if (!asistenciaId) return { ok: false, error: "Falta la asistencia de origen." };

  const { data: asis } = await ctx.supabase
    .from("asistencias")
    .select("id, visitante_nombre, miembro_id, tipo_asistente")
    .eq("id", asistenciaId)
    .maybeSingle();
  if (!asis) return { ok: false, error: "No se encontró la asistencia." };

  const a = asis as {
    visitante_nombre: string | null;
    miembro_id: string | null;
  };
  const nombre = (a.visitante_nombre ?? "").trim();
  if (!nombre) {
    return {
      ok: false,
      error: "La asistencia no tiene nombre de visitante para consolidar.",
    };
  }

  const fila: {
    nombre: string;
    origen: "asistencia";
    estado: "recibido";
    asistencia_id: string;
    miembro_id?: string;
  } = {
    nombre,
    origen: "asistencia",
    estado: "recibido",
    asistencia_id: asistenciaId,
  };
  if (a.miembro_id) fila.miembro_id = a.miembro_id;

  const { data, error } = await ctx.supabase
    .from("consolidacion")
    .insert(fila)
    .select(COLS)
    .single();
  if (error) {
    // 23505 = ya existe una consolidación activa para esta asistencia.
    if (error.code === "23505") {
      return { ok: false, error: "Este visitante ya está en consolidación." };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true, data: data as ConsolidacionRow };
}

// ---------- Edición ----------

/** Actualiza los datos de contacto. */
export async function actualizarContacto(
  id: string,
  input: ContactoInput,
): Promise<Resultado<ConsolidacionRow>> {
  const ctx = await getCtx();
  if (!ctx) return SIN_SESION;
  if (!ROLES_OK.includes(ctx.rol)) return SIN_PERMISO;

  const nombre = (input.nombre ?? "").trim();
  if (!nombre) return { ok: false, error: "El nombre es obligatorio." };

  const { data, error } = await ctx.supabase
    .from("consolidacion")
    .update({
      nombre,
      telefono: t(input.telefono),
      email: t(input.email),
      direccion: t(input.direccion),
      actualizado_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(COLS)
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: data as ConsolidacionRow };
}

/** Cambia la etapa del pipeline. */
export async function cambiarEstado(
  id: string,
  nuevoEstado: EstadoConsolidacion,
): Promise<Resultado<ConsolidacionRow>> {
  const ctx = await getCtx();
  if (!ctx) return SIN_SESION;
  if (!ROLES_OK.includes(ctx.rol)) return SIN_PERMISO;
  if (!ESTADOS.includes(nuevoEstado)) {
    return { ok: false, error: "Estado no válido." };
  }

  const { data, error } = await ctx.supabase
    .from("consolidacion")
    .update({ estado: nuevoEstado, actualizado_at: new Date().toISOString() })
    .eq("id", id)
    .select(COLS)
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: data as ConsolidacionRow };
}

/** Asigna (o quita, con null) el servidor/líder responsable. */
export async function asignarResponsable(
  id: string,
  responsableId: string | null,
): Promise<Resultado<ConsolidacionRow>> {
  const ctx = await getCtx();
  if (!ctx) return SIN_SESION;
  if (!ROLES_OK.includes(ctx.rol)) return SIN_PERMISO;

  const { data, error } = await ctx.supabase
    .from("consolidacion")
    .update({
      responsable_id: responsableId || null,
      actualizado_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(COLS)
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: data as ConsolidacionRow };
}

/** Elimina una consolidación (SOFT-DELETE → Papelera). */
export async function eliminarConsolidacion(id: string): Promise<Resultado> {
  const ctx = await getCtx();
  if (!ctx) return SIN_SESION;
  if (!ROLES_OK.includes(ctx.rol)) return SIN_PERMISO;

  const { error } = await ctx.supabase
    .from("consolidacion")
    .update({ eliminado_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ---------- Historial pastoral (notas append-only) ----------

/** Agrega una nota al historial (append-only; no se edita ni borra). */
export async function agregarNota(
  consolidacionId: string,
  tipo: TipoNota,
  nota: string,
): Promise<Resultado<NotaRow>> {
  const ctx = await getCtx();
  if (!ctx) return SIN_SESION;
  if (!ROLES_OK.includes(ctx.rol)) return SIN_PERMISO;

  const texto = (nota ?? "").trim();
  if (!texto) return { ok: false, error: "La nota no puede estar vacía." };
  if (!TIPOS_NOTA.includes(tipo)) return { ok: false, error: "Tipo de nota no válido." };

  const { data, error } = await ctx.supabase
    .from("consolidacion_notas")
    .insert({
      consolidacion_id: consolidacionId,
      autor_id: ctx.userId,
      tipo,
      nota: texto,
    })
    .select(NOTA_COLS)
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: data as NotaRow };
}

// ---------- Conversión visitante → miembro ----------

/**
 * Promueve la persona a miembro: crea su ficha en `miembros_iglesia`
 * (precargando contacto), vincula `miembro_id` y marca `integrado`.
 * Restringido a admin/pastor (tabla de datos sensibles).
 */
export async function convertirEnMiembro(
  consolidacionId: string,
): Promise<Resultado<{ miembroId: string }>> {
  const ctx = await getCtx();
  if (!ctx) return SIN_SESION;
  if (!ROLES_MIEMBRO.includes(ctx.rol)) {
    return {
      ok: false,
      error: "Solo un administrador o pastor puede crear la ficha de miembro.",
    };
  }

  const { data: cons } = await ctx.supabase
    .from("consolidacion")
    .select("id, nombre, telefono, email, direccion, miembro_id")
    .eq("id", consolidacionId)
    .maybeSingle();
  if (!cons) return { ok: false, error: "No se encontró la consolidación." };

  const c = cons as {
    nombre: string | null;
    telefono: string | null;
    email: string | null;
    direccion: string | null;
    miembro_id: string | null;
  };
  if (c.miembro_id) {
    return { ok: false, error: "Esta persona ya tiene una ficha de miembro vinculada." };
  }

  // 1) Crea la ficha de miembro (mapea email → correo).
  const { data: miembro, error: eMiembro } = await ctx.supabase
    .from("miembros_iglesia")
    .insert({
      nombre_completo: (c.nombre ?? "").trim() || "Sin nombre",
      telefono: t(c.telefono),
      correo: t(c.email),
      direccion: t(c.direccion),
      fecha_ingreso: hoyISO(),
    })
    .select("id")
    .single();
  if (eMiembro) return { ok: false, error: eMiembro.message };
  const miembroId = (miembro as { id: string }).id;

  // 2) Vincula y marca integrado.
  const { error: eLink } = await ctx.supabase
    .from("consolidacion")
    .update({
      miembro_id: miembroId,
      estado: "integrado",
      actualizado_at: new Date().toISOString(),
    })
    .eq("id", consolidacionId);
  if (eLink) return { ok: false, error: eLink.message };

  return { ok: true, data: { miembroId } };
}
