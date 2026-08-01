"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "./icons";
import type { NavLink } from "@/app/data/iglesia";

/**
 * Navegación entre ministerios con diseño HÍBRIDO e inclusivo:
 *
 * - Escritorio (md+): barra horizontal deslizable pulida (flechas inteligentes,
 *   fade en los bordes, scrollbar fino celeste, centra el activo + auto-nudge).
 * - Celular (< md): lista vertical de botones grandes a ancho completo, fáciles
 *   de presionar con el pulgar y de leer — sin scroll horizontal que "se mueva".
 */
export default function MinisteriosNav({
  items,
  activeHref,
}: {
  items: NavLink[];
  activeHref: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false); // acordeón móvil

  const activeLabel =
    items.find((g) => g.href === activeHref)?.label ?? "Ministerios";

  const actualizar = () => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    actualizar();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", actualizar, { passive: true });
    window.addEventListener("resize", actualizar);
    return () => {
      el.removeEventListener("scroll", actualizar);
      window.removeEventListener("resize", actualizar);
    };
  }, []);

  // Al montar (solo afecta a la barra de escritorio): centra el ministerio
  // activo y hace un "nudge" para revelar que se desliza.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    activeRef.current?.scrollIntoView({ inline: "center", block: "nearest" });

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;

    const overflow = el.scrollWidth - el.clientWidth;
    if (overflow <= 8) return;

    const nudge = window.setTimeout(() => {
      el.scrollBy({ left: 28, behavior: "smooth" });
      window.setTimeout(
        () => el.scrollBy({ left: -28, behavior: "smooth" }),
        450,
      );
    }, 650);
    return () => window.clearTimeout(nudge);
  }, []);

  const desplazar = (dir: 1 | -1) =>
    ref.current?.scrollBy({ left: dir * 240, behavior: "smooth" });

  return (
    <div className="border-b border-slate-100 bg-white">
      {/* ================= ESCRITORIO (md+): barra horizontal ================= */}
      <div className="relative mx-auto hidden max-w-7xl px-6 md:block lg:px-8">
        {/* Fade izquierdo */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-white to-transparent transition-opacity duration-300 ${
            canLeft ? "opacity-100" : "opacity-0"
          }`}
        />
        {/* Flecha izquierda */}
        <button
          type="button"
          onClick={() => desplazar(-1)}
          aria-label="Desplazar a la izquierda"
          disabled={!canLeft}
          className={`absolute left-3 top-[calc(50%-0.5rem)] z-20 grid -translate-y-1/2 place-items-center rounded-full border border-slate-200 bg-white p-1.5 text-slate-600 shadow-md transition-all hover:bg-blue-50 hover:text-blue-700 ${
            canLeft ? "opacity-100" : "cursor-default opacity-30"
          }`}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Contenedor deslizable + snap + scrollbar fino celeste */}
        <div
          ref={ref}
          className="flex snap-x snap-mandatory gap-2 overflow-x-auto py-4 [scrollbar-color:#bfdbfe_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-blue-200 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:h-1.5"
        >
          {items.map((g) => {
            const active = g.href === activeHref;
            return (
              <Link
                key={g.href}
                href={g.href}
                ref={active ? activeRef : undefined}
                aria-current={active ? "page" : undefined}
                className={`shrink-0 snap-start whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-700 text-white shadow-sm shadow-blue-600/25"
                    : "bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                {g.label}
              </Link>
            );
          })}
        </div>

        {/* Fade derecho */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-white to-transparent transition-opacity duration-300 ${
            canRight ? "opacity-100" : "opacity-0"
          }`}
        />
        {/* Flecha derecha */}
        <button
          type="button"
          onClick={() => desplazar(1)}
          aria-label="Desplazar a la derecha"
          disabled={!canRight}
          className={`absolute right-3 top-[calc(50%-0.5rem)] z-20 grid -translate-y-1/2 place-items-center rounded-full border border-slate-200 bg-white p-1.5 text-slate-600 shadow-md transition-all hover:bg-blue-50 hover:text-blue-700 ${
            canRight ? "opacity-100" : "cursor-default opacity-30"
          }`}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* ============ CELULAR (< md): acordeón desplegable ============ */}
      <div className="block px-6 py-4 md:hidden">
        {/* Disparador: muestra el ministerio actual */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          className="flex w-full items-center justify-between gap-3 rounded-2xl bg-linear-to-r from-blue-700 to-sky-600 px-5 py-3.5 text-left text-white shadow-md shadow-blue-600/25"
        >
          <span className="flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-100/80">
              Estás en
            </span>
            <span className="text-base font-semibold">{activeLabel}</span>
          </span>
          <ChevronDown
            className={`h-5 w-5 shrink-0 transition-transform duration-300 ${
              mobileOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Lista completa de ministerios (se despliega) */}
        <div
          className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
            mobileOpen ? "max-h-[44rem]" : "max-h-0"
          }`}
        >
          <div className="space-y-2.5 pt-2.5">
            {items.map((g) => {
              const active = g.href === activeHref;
              return (
                <Link
                  key={g.href}
                  href={g.href}
                  aria-current={active ? "page" : undefined}
                  className={`block w-full rounded-2xl px-5 py-3.5 text-base font-semibold transition-colors ${
                    active
                      ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  {g.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
