"use client";

import Link from "next/link";
import Image from "next/image";
import { IGLESIA, LOGO_URL } from "@/app/data/iglesia";

/**
 * Error Boundary global con la identidad del Centro Cristiano Mieles. Se muestra
 * si una ruta lanza un error en tiempo de ejecución, en vez de la pantalla cruda
 * de Next. Ofrece reintentar (reset) y volver al inicio.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-linear-to-br from-blue-950 via-blue-900 to-sky-800 px-4 py-10 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-sky-400/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-16 h-[28rem] w-[28rem] rounded-full bg-amber-400/15 blur-3xl"
      />

      <div className="relative z-10 w-full max-w-md">
        <span className="relative mx-auto grid h-24 w-24 place-items-center">
          <span
            aria-hidden
            className="absolute inset-0 rounded-full bg-white/10 blur-2xl"
          />
          <Image
            src={LOGO_URL}
            alt={IGLESIA.nombre}
            width={96}
            height={96}
            className="relative h-24 w-24 object-contain drop-shadow-[0_6px_20px_rgba(2,6,23,0.45)]"
          />
        </span>

        <h1 className="mt-8 text-2xl font-bold text-white">
          Algo salió mal
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-sky-100/80">
          Tuvimos un problema al mostrar esta página. Puedes intentarlo de nuevo;
          si persiste, vuelve al inicio y prueba más tarde.
        </p>
        {error?.digest && (
          <p className="mt-2 text-xs text-sky-100/40">Código: {error.digest}</p>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-blue-800 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-sky-50"
          >
            Reintentar
          </button>
          <Link
            href="/"
            className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
          >
            Volver al inicio
          </Link>
        </div>

        <p className="mt-8 text-xs text-sky-100/50">
          {IGLESIA.nombre} · Desde {IGLESIA.anioFundacion} en Quilicura
        </p>
      </div>
    </div>
  );
}
