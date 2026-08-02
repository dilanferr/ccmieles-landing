"use server";

import { createServerSupabase } from "@/src/utils/supabase-server";

/**
 * Server Actions del Registro Pastoral (fichas de miembros).
 * Tabla con datos SENSIBLES: toda operación pasa por aquí y respeta RLS
 * (solo administradores autenticados). No se expone en la web pública.
 */

export type MiembroInput = {
  nombre_completo: string;
  rut: string | null;
  telefono: string | null;
  correo: string | null;
  direccion: string | null;
  fecha_nacimiento: string | null;
  salud: string | null;
  tipo_sangre: string | null;
  contacto_emergencia_nombre: string | null;
  contacto_emergencia_telefono: string | null;
  firma: string | null;
};

export type MiembroRow = MiembroInput & { id: string; creado_at: string | null };

export type Resultado<T = undefined> = {
  ok: boolean;
  error?: string;
  data?: T;
};

const COLS =
  "id, nombre_completo, rut, telefono, correo, direccion, fecha_nacimiento, salud, tipo_sangre, contacto_emergencia_nombre, contacto_emergencia_telefono, firma, creado_at";

async function getAdminClient() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? supabase : null;
}

/** Limpia el input: recorta strings y convierte los vacíos en null. */
function normalizar(input: MiembroInput) {
  const t = (v: string | null) => {
    const s = (v ?? "").trim();
    return s === "" ? null : s;
  };
  return {
    nombre_completo: (input.nombre_completo ?? "").trim(),
    rut: t(input.rut),
    telefono: t(input.telefono),
    correo: t(input.correo),
    direccion: t(input.direccion),
    fecha_nacimiento: input.fecha_nacimiento || null,
    salud: t(input.salud),
    tipo_sangre: t(input.tipo_sangre),
    contacto_emergencia_nombre: t(input.contacto_emergencia_nombre),
    contacto_emergencia_telefono: t(input.contacto_emergencia_telefono),
    firma: input.firma?.startsWith("data:image") ? input.firma : null,
  };
}

/** Crea una ficha (INSERT) y devuelve la fila creada. */
export async function crearMiembro(
  input: MiembroInput,
): Promise<Resultado<MiembroRow>> {
  const supabase = await getAdminClient();
  if (!supabase) {
    return { ok: false, error: "Sesión expirada. Vuelve a iniciar sesión." };
  }

  const fila = normalizar(input);
  if (!fila.nombre_completo) {
    return { ok: false, error: "El nombre completo es obligatorio." };
  }

  const { data, error } = await supabase
    .from("miembros_iglesia")
    .insert(fila)
    .select(COLS)
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: data as MiembroRow };
}

/** Actualiza una ficha (UPDATE) y devuelve la fila actualizada. */
export async function actualizarMiembro(
  id: string | number,
  input: MiembroInput,
): Promise<Resultado<MiembroRow>> {
  const supabase = await getAdminClient();
  if (!supabase) {
    return { ok: false, error: "Sesión expirada. Vuelve a iniciar sesión." };
  }

  const fila = normalizar(input);
  if (!fila.nombre_completo) {
    return { ok: false, error: "El nombre completo es obligatorio." };
  }

  const { data, error } = await supabase
    .from("miembros_iglesia")
    .update({ ...fila, actualizado_at: new Date().toISOString() })
    .eq("id", id)
    .select(COLS)
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: data as MiembroRow };
}

/** Elimina una ficha (DELETE). */
export async function eliminarMiembro(
  id: string | number,
): Promise<Resultado> {
  const supabase = await getAdminClient();
  if (!supabase) {
    return { ok: false, error: "Sesión expirada. Vuelve a iniciar sesión." };
  }

  const { error } = await supabase
    .from("miembros_iglesia")
    .delete()
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
