"use server";

import { createServerSupabase } from "@/src/utils/supabase-server";

/**
 * Server Actions del Inventario (tabla `bienes`).
 * Validan sesión + rol (admin/pastor/logistica) como defensa en profundidad
 * sobre la RLS, y sanean el input. La auditoría la registran los triggers de BD.
 */

const ROLES_OK = ["admin", "pastor", "logistica"];

export type EstadoBien = "nuevo" | "bueno" | "regular" | "reparacion" | "baja";
const ESTADOS: EstadoBien[] = [
  "nuevo",
  "bueno",
  "regular",
  "reparacion",
  "baja",
];

export type BienInput = {
  nombre: string;
  categoria: string;
  cantidad: number;
  estado: EstadoBien;
  ubicacion: string | null;
  responsable_id: string | null;
  valor: number;
  fecha_adquisicion: string | null; // YYYY-MM-DD
  nro_serie: string | null;
  foto_url: string | null;
  notas: string | null;
};

export type BienRow = BienInput & { id: string; creado_at: string | null };

export type Resultado<T = undefined> = { ok: boolean; error?: string; data?: T };

const COLS =
  "id, nombre, categoria, cantidad, estado, ubicacion, responsable_id, valor, fecha_adquisicion, nro_serie, foto_url, notas, creado_at";

async function getCtx() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: rol } = await supabase.rpc("mi_rol");
  return { supabase, userId: user.id, rol: (rol as string | null) ?? "" };
}

function preparar(
  input: BienInput,
): { error: string } | { data: Omit<BienRow, "id" | "creado_at"> } {
  const nombre = (input.nombre ?? "").trim();
  if (!nombre) return { error: "El nombre del bien es obligatorio." };
  const categoria = (input.categoria ?? "").trim();
  if (!categoria) return { error: "La categoría es obligatoria." };
  if (!ESTADOS.includes(input.estado)) return { error: "Estado inválido." };

  const cantidad = Math.round(Number(input.cantidad));
  if (!Number.isFinite(cantidad) || cantidad < 0) {
    return { error: "La cantidad debe ser 0 o más." };
  }
  const valor = Math.round(Number(input.valor));
  if (!Number.isFinite(valor) || valor < 0) {
    return { error: "El valor no puede ser negativo." };
  }

  const t = (v: string | null) => {
    const s = (v ?? "").trim();
    return s === "" ? null : s;
  };

  return {
    data: {
      nombre,
      categoria,
      cantidad,
      estado: input.estado,
      ubicacion: t(input.ubicacion),
      responsable_id: input.responsable_id || null,
      valor,
      fecha_adquisicion: input.fecha_adquisicion || null,
      nro_serie: t(input.nro_serie),
      foto_url: t(input.foto_url),
      notas: t(input.notas),
    },
  };
}

/** Crea un bien (INSERT) y devuelve la fila creada. */
export async function crearBien(input: BienInput): Promise<Resultado<BienRow>> {
  const ctx = await getCtx();
  if (!ctx) return { ok: false, error: "Sesión expirada. Vuelve a iniciar sesión." };
  if (!ROLES_OK.includes(ctx.rol)) {
    return { ok: false, error: "No tienes permisos para gestionar el inventario." };
  }
  const p = preparar(input);
  if ("error" in p) return { ok: false, error: p.error };

  const { data, error } = await ctx.supabase
    .from("bienes")
    .insert(p.data)
    .select(COLS)
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: data as BienRow };
}

/** Actualiza un bien (UPDATE) y devuelve la fila actualizada. */
export async function actualizarBien(
  id: string,
  input: BienInput,
): Promise<Resultado<BienRow>> {
  const ctx = await getCtx();
  if (!ctx) return { ok: false, error: "Sesión expirada. Vuelve a iniciar sesión." };
  if (!ROLES_OK.includes(ctx.rol)) {
    return { ok: false, error: "No tienes permisos para gestionar el inventario." };
  }
  const p = preparar(input);
  if ("error" in p) return { ok: false, error: p.error };

  const { data, error } = await ctx.supabase
    .from("bienes")
    .update({ ...p.data, actualizado_at: new Date().toISOString() })
    .eq("id", id)
    .select(COLS)
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: data as BienRow };
}

/** Elimina un bien (SOFT-DELETE: marca `eliminado_at`). */
export async function eliminarBien(id: string): Promise<Resultado> {
  const ctx = await getCtx();
  if (!ctx) return { ok: false, error: "Sesión expirada. Vuelve a iniciar sesión." };
  if (!ROLES_OK.includes(ctx.rol)) {
    return { ok: false, error: "No tienes permisos para gestionar el inventario." };
  }
  const { error } = await ctx.supabase
    .from("bienes")
    .update({ eliminado_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
