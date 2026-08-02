"use server";

import { createServerSupabase } from "@/src/utils/supabase-server";
import type { Rol } from "./types";

/**
 * Server Actions de gestión de usuarios (RBAC).
 * La RLS de `perfiles` ya restringe la escritura a admin/pastor; aquí
 * validamos y damos mensajes claros. Un usuario no puede cambiar su propio
 * rol ni desactivarse a sí mismo (evita auto-bloqueo).
 */

const ROLES: Rol[] = ["admin", "pastor", "tesorero", "lider", "secretaria"];

export type Resultado = { ok: boolean; error?: string };

async function getAdmin() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { supabase, userId: user.id } : null;
}

/** Cambia el rol de un usuario. */
export async function actualizarRolUsuario(
  id: string,
  rol: Rol,
): Promise<Resultado> {
  const ctx = await getAdmin();
  if (!ctx) return { ok: false, error: "Sesión expirada." };
  if (!ROLES.includes(rol)) return { ok: false, error: "Rol inválido." };
  if (id === ctx.userId) {
    return { ok: false, error: "No puedes cambiar tu propio rol." };
  }

  const { error } = await ctx.supabase
    .from("perfiles")
    .update({ rol })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Activa o desactiva un usuario (un usuario inactivo pierde todo acceso). */
export async function cambiarEstadoUsuario(
  id: string,
  activo: boolean,
): Promise<Resultado> {
  const ctx = await getAdmin();
  if (!ctx) return { ok: false, error: "Sesión expirada." };
  if (id === ctx.userId) {
    return { ok: false, error: "No puedes desactivar tu propia cuenta." };
  }

  const { error } = await ctx.supabase
    .from("perfiles")
    .update({ activo })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
