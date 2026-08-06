"use server";

import { createServerSupabase } from "@/src/utils/supabase-server";

/*
 * La auditoría se registra automáticamente por TRIGGERS de base de datos
 * (supabase/audit-triggers.sql), no desde la app: así es inalterable y ninguna
 * escritura puede saltársela. Por eso aquí ya NO llamamos a logAudit.
 */

/**
 * Server Actions de Tesorería (transacciones financieras).
 * Datos sensibles: toda operación respeta RLS (solo admin autenticado) y
 * registra `creado_por` desde la sesión. No se expone en la web pública.
 */

export type TipoTrx = "ingreso" | "egreso";

export type TransaccionInput = {
  tipo: TipoTrx;
  monto: number;
  categoria: string;
  descripcion: string | null;
  metodo_pago: string | null;
  fecha: string; // YYYY-MM-DD
  comprobante_url: string | null;
};

export type TransaccionRow = {
  id: string;
  tipo: TipoTrx;
  monto: number;
  categoria: string;
  descripcion: string | null;
  metodo_pago: string | null;
  fecha: string;
  comprobante_url: string | null;
  creado_por: string | null;
  created_at: string | null;
};

export type Resultado<T = undefined> = {
  ok: boolean;
  error?: string;
  data?: T;
};

const COLS =
  "id, tipo, monto, categoria, descripcion, metodo_pago, fecha, comprobante_url, creado_por, created_at";

async function getAdmin() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { supabase, userId: user.id } : null;
}

/** Valida y normaliza el input. Devuelve el objeto a persistir o un error. */
function preparar(input: TransaccionInput):
  | { error: string }
  | { data: Omit<TransaccionRow, "id" | "creado_por" | "created_at"> } {
  if (input.tipo !== "ingreso" && input.tipo !== "egreso") {
    return { error: "El tipo debe ser ingreso o egreso." };
  }
  const monto = Math.round(Number(input.monto));
  if (!Number.isFinite(monto) || monto <= 0) {
    return { error: "El monto debe ser un número mayor a 0." };
  }
  const categoria = input.categoria.trim();
  if (!categoria) return { error: "La categoría es obligatoria." };

  return {
    data: {
      tipo: input.tipo,
      monto,
      categoria,
      descripcion: input.descripcion?.trim() || null,
      metodo_pago: input.metodo_pago?.trim() || null,
      fecha: input.fecha || new Date().toISOString().slice(0, 10),
      comprobante_url: input.comprobante_url?.trim() || null,
    },
  };
}

/** Crea una transacción (INSERT) y devuelve la fila creada. */
export async function crearTransaccion(
  input: TransaccionInput,
): Promise<Resultado<TransaccionRow>> {
  const ctx = await getAdmin();
  if (!ctx) {
    return { ok: false, error: "Sesión expirada. Vuelve a iniciar sesión." };
  }

  const prep = preparar(input);
  if ("error" in prep) return { ok: false, error: prep.error };

  const { data, error } = await ctx.supabase
    .from("transacciones_financieras")
    .insert({ ...prep.data, creado_por: ctx.userId })
    .select(COLS)
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: data as TransaccionRow };
}

/** Actualiza una transacción (UPDATE) y devuelve la fila actualizada. */
export async function actualizarTransaccion(
  id: string | number,
  input: TransaccionInput,
): Promise<Resultado<TransaccionRow>> {
  const ctx = await getAdmin();
  if (!ctx) {
    return { ok: false, error: "Sesión expirada. Vuelve a iniciar sesión." };
  }

  const prep = preparar(input);
  if ("error" in prep) return { ok: false, error: prep.error };

  const { data, error } = await ctx.supabase
    .from("transacciones_financieras")
    .update({ ...prep.data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(COLS)
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: data as TransaccionRow };
}

/**
 * Elimina una transacción (SOFT-DELETE: marca `eliminado_at`).
 * La fila permanece en la base para trazabilidad; los listados la ocultan
 * filtrando `eliminado_at is null`. Evita pérdidas por clic accidental.
 */
export async function eliminarTransaccion(
  id: string | number,
): Promise<Resultado> {
  const ctx = await getAdmin();
  if (!ctx) {
    return { ok: false, error: "Sesión expirada. Vuelve a iniciar sesión." };
  }

  const { error } = await ctx.supabase
    .from("transacciones_financieras")
    .update({ eliminado_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
