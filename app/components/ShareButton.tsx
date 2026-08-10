"use client";

import { track } from "./track";
import { ShareIcon } from "./icons";

/**
 * Botón "Compartir": usa la Web Share API (nativa en móvil) con fallback a
 * copiar el enlace. Registra el evento `share` para la analítica de Impacto.
 */
export default function ShareButton({ className }: { className?: string }) {
  async function compartir() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const titulo =
      typeof document !== "undefined"
        ? document.title
        : "Centro Cristiano Mieles";
    const path =
      typeof window !== "undefined" ? window.location.pathname : null;
    track("share", { path });
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: titulo, url });
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      /* el usuario canceló o el navegador no lo soporta */
    }
  }

  return (
    <button type="button" onClick={compartir} className={className}>
      <ShareIcon className="h-4 w-4" />
      Compartir
    </button>
  );
}
