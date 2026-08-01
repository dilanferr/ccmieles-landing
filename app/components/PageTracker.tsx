"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** ID de sesión (anónimo) por pestaña. */
function sessionId(): string {
  let id = sessionStorage.getItem("mieles.sid");
  if (!id) {
    id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    sessionStorage.setItem("mieles.sid", id);
  }
  return id;
}

function device(): string {
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    ? "mobile"
    : "desktop";
}

function post(body: Record<string, unknown>, keepalive = false) {
  try {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, session_id: sessionId(), device: device() }),
      keepalive,
    }).catch(() => {});
  } catch {
    /* ignora */
  }
}

/**
 * Registra la vista de página (con geo en el servidor) y, al salir de la
 * página, el tiempo de permanencia como evento `duration`. Solo se monta en
 * las páginas públicas.
 */
export default function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const inicio = Date.now();
    post({ type: "page_view", path: pathname, referrer: document.referrer || null });

    return () => {
      const ms = Date.now() - inicio;
      if (ms > 1500) {
        post(
          { type: "event", name: "duration", path: pathname, meta: { ms } },
          true,
        );
      }
    };
  }, [pathname]);

  return null;
}
