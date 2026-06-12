"use client";

import Link from "next/link";
import { useState } from "react";
import { LOGO_URL } from "@/app/data/iglesia";

/** Logotipo del Centro Cristiano Mieles (logo PNG transparente + texto). */
export default function Brand({
  className = "",
  tone = "dark",
}: {
  className?: string;
  tone?: "dark" | "light";
}) {
  const [error, setError] = useState(false);
  const main = tone === "light" ? "text-white" : "text-slate-900";
  const sub = tone === "light" ? "text-sky-200" : "text-blue-700";

  const showLogo = Boolean(LOGO_URL) && !error;

  return (
    <Link
      href="/"
      className={`group inline-flex shrink-0 items-center gap-3 ${className}`}
      aria-label="Centro Cristiano Mieles — inicio"
    >
      {showLogo ? (
        // Logo transparente, flota directamente sobre el fondo (sin recuadro).
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={LOGO_URL}
          alt="Logo Centro Cristiano Mieles"
          onError={() => setError(true)}
          className="h-12 w-auto max-w-44 object-contain transition-transform group-hover:scale-105 sm:h-14"
        />
      ) : (
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-linear-to-br from-blue-700 to-sky-500 text-xl font-bold text-white shadow-lg shadow-blue-600/25 transition-transform group-hover:scale-105 sm:h-14 sm:w-14">
          M
        </span>
      )}

      <span className="flex flex-col leading-tight">
        <span
          className={`whitespace-nowrap text-base font-bold tracking-tight ${main}`}
        >
          Centro Cristiano
        </span>
        <span
          className={`whitespace-nowrap text-xs font-semibold uppercase tracking-[0.2em] ${sub}`}
        >
          Mieles
        </span>
      </span>
    </Link>
  );
}
