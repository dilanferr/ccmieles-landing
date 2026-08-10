import Link from "next/link";
import Image from "next/image";
import { IGLESIA, LOGO_URL } from "@/app/data/iglesia";

/**
 * Página 404 con la identidad del Centro Cristiano Mieles (coherencia de marca
 * en pantallas de error). Se muestra en cualquier ruta inexistente.
 */
export default function NotFound() {
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
        <Link
          href="/"
          className="relative mx-auto grid h-24 w-24 place-items-center transition-transform hover:scale-105"
        >
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
        </Link>

        <p className="mt-8 text-6xl font-black tracking-tight text-white/90">404</p>
        <h1 className="mt-3 text-2xl font-bold text-white">
          Esta página no está aquí…
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-sky-100/80">
          Pero en <strong className="font-semibold text-white">{IGLESIA.nombre}</strong>{" "}
          sí hay un lugar para ti. Te esperamos con los brazos abiertos.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-blue-800 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-sky-50"
          >
            Volver al inicio
          </Link>
          <Link
            href="/oracion-peticion"
            className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
          >
            Enviar una petición
          </Link>
        </div>

        <p className="mt-8 text-xs text-sky-100/50">
          «Hay un lugar para ti» · Desde {IGLESIA.anioFundacion} en Quilicura
        </p>
      </div>
    </div>
  );
}
