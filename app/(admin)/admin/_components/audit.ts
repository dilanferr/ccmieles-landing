import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Bitácora de auditoría (best-effort).
 * Se invoca desde las Server Actions de módulos sensibles (finanzas, fichas,
 * usuarios). La RLS de `audit_log` exige usuario_id = auth.uid(), así que
 * `usuarioId` debe ser el de la sesión. Si el registro falla NO rompe la
 * operación principal: la auditoría nunca debe bloquear al usuario.
 */

export type AccionAudit = "CREAR" | "EDITAR" | "ELIMINAR";

export async function logAudit(
  supabase: SupabaseClient,
  usuarioId: string,
  accion: AccionAudit,
  modulo: string,
  detalles?: Record<string, unknown>,
): Promise<void> {
  try {
    await supabase.from("audit_log").insert({
      usuario_id: usuarioId,
      accion,
      modulo,
      detalles: detalles ?? null,
    });
  } catch {
    // best-effort: no interrumpir la acción principal si la bitácora falla.
  }
}
