"use server";

import { createServerSupabase } from "@/src/utils/supabase-server";

/**
 * Server Actions de la Papelera / Centro de Restauración.
 * Lista, restaura y purga registros con soft-delete (eliminado_at) de las
 * tablas que lo soportan. Restaurar: admin/pastor · Purgar (borrado físico
 * irreversible): SOLO admin. Allowlist estricta de tablas (evita inyección).
 * La auditoría (restauración/purga) la registran los triggers de BD.
 */

const ROLES_RESTAURAR = ["admin", "pastor"];
const ROLES_PURGAR = ["admin"]; // borrado definitivo solo admin

export type PapeleraTabla =
  | "transacciones_financieras"
  | "miembros_iglesia"
  | "bienes"
  | "asistencias"
  | "eventos_cultos";

const TABLAS: PapeleraTabla[] = [
  "transacciones_financieras",
  "miembros_iglesia",
  "bienes",
  "asistencias",
  "eventos_cultos",
];

export type PapeleraItem = {
  tabla: PapeleraTabla;
  tipo: string; // etiqueta de origen (Finanzas, Fichas, …)
  id: string;
  etiqueta: string;
  detalle: string;
  eliminado_at: string;
};

export type Resultado<T = undefined> = { ok: boolean; error?: string; data?: T };

const SIN_SESION = {
  ok: false as const,
  error: "Sesión expirada. Vuelve a iniciar sesión.",
};
const SIN_PERMISO = {
  ok: false as const,
  error: "No tienes permisos para gestionar la papelera.",
};

async function getCtx() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: rol } = await supabase.rpc("mi_rol");
  return { supabase, userId: user.id, rol: (rol as string | null) ?? "" };
}

const clp = (v: unknown) => "$" + Number(v ?? 0).toLocaleString("es-CL");

// Config por tabla: columnas a leer + cómo construir etiqueta/detalle.
type Cfg = {
  tabla: PapeleraTabla;
  tipo: string;
  cols: string;
  map: (r: Record<string, unknown>) => { etiqueta: string; detalle: string };
};

const CONFIGS: Cfg[] = [
  {
    tabla: "transacciones_financieras",
    tipo: "Finanzas",
    cols: "id, tipo, monto, categoria, fecha, eliminado_at",
    map: (r) => ({
      etiqueta: `${r.tipo === "ingreso" ? "Ingreso" : "Egreso"} · ${clp(r.monto)}`,
      detalle: `${r.categoria ?? "—"} · ${r.fecha ?? ""}`,
    }),
  },
  {
    tabla: "miembros_iglesia",
    tipo: "Fichas",
    cols: "id, nombre_completo, eliminado_at",
    map: (r) => ({
      etiqueta: String(r.nombre_completo ?? "—"),
      detalle: "Ficha de miembro",
    }),
  },
  {
    tabla: "bienes",
    tipo: "Inventario",
    cols: "id, nombre, categoria, eliminado_at",
    map: (r) => ({
      etiqueta: String(r.nombre ?? "—"),
      detalle: String(r.categoria ?? "—"),
    }),
  },
  {
    tabla: "asistencias",
    tipo: "Asistencia",
    cols: "id, visitante_nombre, tipo_asistente, eliminado_at",
    map: (r) => ({
      etiqueta:
        r.tipo_asistente === "visitante"
          ? String(r.visitante_nombre ?? "Visitante")
          : "Asistencia de miembro",
      detalle: "Registro de asistencia",
    }),
  },
  {
    tabla: "eventos_cultos",
    tipo: "Cultos",
    cols: "id, nombre, tipo, fecha, eliminado_at",
    map: (r) => ({
      etiqueta: String(r.nombre ?? "—"),
      detalle: `${r.tipo === "culto" ? "Culto" : "Evento"} · ${r.fecha ?? ""}`,
    }),
  },
];

/** Lista todos los registros eliminados (eliminado_at IS NOT NULL). */
export async function listarPapelera(): Promise<Resultado<PapeleraItem[]>> {
  const ctx = await getCtx();
  if (!ctx) return SIN_SESION;
  if (!ROLES_RESTAURAR.includes(ctx.rol)) return SIN_PERMISO;

  const porTabla = await Promise.all(
    CONFIGS.map(async (c): Promise<PapeleraItem[]> => {
      const { data, error } = await ctx.supabase
        .from(c.tabla)
        .select(c.cols)
        .not("eliminado_at", "is", null)
        .order("eliminado_at", { ascending: false });
      if (error || !data) return [];
      return (data as unknown as Record<string, unknown>[]).map((r) => {
        const { etiqueta, detalle } = c.map(r);
        return {
          tabla: c.tabla,
          tipo: c.tipo,
          id: String(r.id),
          etiqueta,
          detalle,
          eliminado_at: String(r.eliminado_at),
        };
      });
    }),
  );

  const items = porTabla
    .flat()
    .sort((a, b) => (a.eliminado_at < b.eliminado_at ? 1 : -1));
  return { ok: true, data: items };
}

/** Restaura un registro (eliminado_at = NULL). Admin/pastor. */
export async function restaurarRegistro(
  tabla: PapeleraTabla,
  id: string,
): Promise<Resultado> {
  const ctx = await getCtx();
  if (!ctx) return SIN_SESION;
  if (!ROLES_RESTAURAR.includes(ctx.rol)) return SIN_PERMISO;
  if (!TABLAS.includes(tabla)) return { ok: false, error: "Tabla no permitida." };

  const { error } = await ctx.supabase
    .from(tabla)
    .update({ eliminado_at: null })
    .eq("id", id);
  if (error) {
    // 23505: al restaurar chocaría con un registro activo equivalente.
    if (error.code === "23505") {
      return {
        ok: false,
        error: "Ya existe un registro activo equivalente; no se puede restaurar.",
      };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/** Elimina definitivamente (borrado físico irreversible). SOLO admin. */
export async function purgarRegistro(
  tabla: PapeleraTabla,
  id: string,
): Promise<Resultado> {
  const ctx = await getCtx();
  if (!ctx) return SIN_SESION;
  if (!ROLES_PURGAR.includes(ctx.rol)) {
    return {
      ok: false,
      error: "Solo un administrador puede eliminar definitivamente.",
    };
  }
  if (!TABLAS.includes(tabla)) return { ok: false, error: "Tabla no permitida." };

  const { error } = await ctx.supabase.from(tabla).delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
