"use client";

/**
 * Helper para registrar eventos de interacción desde componentes cliente.
 * Ej: track("visit_plan_click", { slug: "home" })
 *     track("testimonio_play", { video_id })
 * Envía al endpoint seguro /api/track (falla en silencio).
 */
export function track(name: string, meta: Record<string, unknown> = {}) {
  try {
    const sid = sessionStorage.getItem("mieles.sid") ?? null;
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "event",
        name,
        path: typeof window !== "undefined" ? window.location.pathname : null,
        session_id: sid,
        meta,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* ignora */
  }
}
