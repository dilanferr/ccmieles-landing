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

/**
 * Envía al endpoint de tracking. Con `beacon=true` usa navigator.sendBeacon
 * (fiable al cerrar la pestaña o navegar hacia afuera); si no, fetch keepalive.
 */
function enviar(body: Record<string, unknown>, beacon = false) {
  try {
    const full = { ...body, session_id: sessionId(), device: device() };
    if (beacon && typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/track",
        new Blob([JSON.stringify(full)], { type: "application/json" }),
      );
      return;
    }
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(full),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* ignora */
  }
}

/**
 * Atribución de origen SOLO en la primera vista de la sesión: prioriza los
 * parámetros UTM sobre el referrer, y excluye el propio dominio (evita
 * auto-referencias al abrir enlaces internos en pestañas nuevas). En las vistas
 * siguientes de la sesión no se reenvía origen → las fuentes se cuentan por
 * sesión (la fila de entrada) en el RPC.
 */
function atribucionInicial(): Record<string, string | null> {
  if (sessionStorage.getItem("mieles.entry")) return {};
  sessionStorage.setItem("mieles.entry", "1");

  const params = new URLSearchParams(window.location.search);
  let referrer: string | null = document.referrer || null;
  if (referrer) {
    try {
      if (new URL(referrer).hostname === window.location.hostname) {
        referrer = null; // propio dominio → no es una fuente externa
      }
    } catch {
      referrer = null;
    }
  }
  return {
    referrer,
    utm_source: params.get("utm_source") || null,
    utm_medium: params.get("utm_medium") || null,
    utm_campaign: params.get("utm_campaign") || null,
  };
}

/**
 * Registra la vista de página (con geo en el servidor) y el tiempo de
 * permanencia como evento `duration`. La duración se envía en el primer evento
 * terminal (pestaña oculta / cierre / navegación externa o interna), con
 * sendBeacon, para no perderla en salidas ni rebotes. Solo se monta en público.
 */
export default function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const inicio = Date.now();
    let enviado = false;

    enviar({ type: "page_view", path: pathname, ...atribucionInicial() });

    const enviarDuracion = () => {
      if (enviado) return;
      const ms = Date.now() - inicio;
      if (ms > 1500) {
        enviado = true;
        enviar(
          { type: "event", name: "duration", path: pathname, meta: { ms } },
          true,
        );
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") enviarDuracion();
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", enviarDuracion);

    return () => {
      // Navegación interna (SPA) / desmontaje: también registra la duración.
      enviarDuracion();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", enviarDuracion);
    };
  }, [pathname]);

  return null;
}
