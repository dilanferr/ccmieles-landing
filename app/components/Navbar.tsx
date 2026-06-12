"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Brand from "./Brand";
import { MenuIcon, CloseIcon, ChevronDown, PrayingHands } from "./icons";
import { NAV_SIMPLE, NAV_MAS, GRUPOS_DROPDOWN } from "@/app/data/iglesia";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false); // menú móvil
  const [grupos, setGrupos] = useState(false); // dropdown grupos (escritorio)
  const [mas, setMas] = useState(false); // dropdown "Más" (escritorio)
  const [gruposMobile, setGruposMobile] = useState(false); // acordeón móvil
  const navRef = useRef<HTMLUListElement>(null);

  // Cierra todo al cambiar de ruta.
  useEffect(() => {
    setOpen(false);
    setGrupos(false);
    setMas(false);
    setGruposMobile(false);
  }, [pathname]);

  // Bloquea el scroll del body con el menú móvil abierto.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Click fuera para cerrar los dropdowns de escritorio.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setGrupos(false);
        setMas(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const linkClass = (active: boolean) =>
    `whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-colors ${
      active
        ? "bg-blue-50 text-blue-700"
        : "text-slate-600 hover:bg-slate-50 hover:text-blue-700"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white shadow-sm">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Brand />

        {/* ---------- Navegación escritorio ---------- */}
        <ul ref={navRef} className="hidden items-center gap-1 xl:flex">
          {NAV_SIMPLE.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={linkClass(isActive(link.href))}>
                {link.label}
              </Link>
            </li>
          ))}

          {/* Dropdown Grupos y Ministerios */}
          <li
            className="relative"
            onMouseEnter={() => {
              setGrupos(true);
              setMas(false);
            }}
            onMouseLeave={() => setGrupos(false)}
          >
            <button
              type="button"
              onClick={() => {
                setGrupos((v) => !v);
                setMas(false);
              }}
              aria-expanded={grupos}
              className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                pathname.startsWith("/grupos")
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-blue-700"
              }`}
            >
              Grupos y Ministerios
              <ChevronDown
                className={`h-4 w-4 transition-transform ${grupos ? "rotate-180" : ""}`}
              />
            </button>

            <div
              className={`absolute right-0 top-full w-72 origin-top-right pt-2 transition-all ${
                grupos
                  ? "pointer-events-auto visible translate-y-0 opacity-100"
                  : "pointer-events-none invisible -translate-y-1 opacity-0"
              }`}
            >
              <ul className="overflow-hidden rounded-2xl border border-slate-100 bg-white p-2 shadow-xl shadow-slate-900/5">
                {GRUPOS_DROPDOWN.map((g) => (
                  <li key={g.slug}>
                    <Link
                      href={`/grupos/${g.slug}`}
                      className="block rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
                    >
                      {g.titulo}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </li>

          {/* Dropdown Más */}
          <li
            className="relative"
            onMouseEnter={() => {
              setMas(true);
              setGrupos(false);
            }}
            onMouseLeave={() => setMas(false)}
          >
            <button
              type="button"
              onClick={() => {
                setMas((v) => !v);
                setGrupos(false);
              }}
              aria-expanded={mas}
              className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                NAV_MAS.some((l) => isActive(l.href))
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-blue-700"
              }`}
            >
              Más
              <ChevronDown
                className={`h-4 w-4 transition-transform ${mas ? "rotate-180" : ""}`}
              />
            </button>

            <div
              className={`absolute right-0 top-full w-56 origin-top-right pt-2 transition-all ${
                mas
                  ? "pointer-events-auto visible translate-y-0 opacity-100"
                  : "pointer-events-none invisible -translate-y-1 opacity-0"
              }`}
            >
              <ul className="overflow-hidden rounded-2xl border border-slate-100 bg-white p-2 shadow-xl shadow-slate-900/5">
                {NAV_MAS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        </ul>

        {/* ---------- Acciones ---------- */}
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/oracion-peticion"
            className="hidden items-center gap-2 whitespace-nowrap rounded-full bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:-translate-y-0.5 hover:bg-blue-800 sm:inline-flex"
          >
            <PrayingHands className="h-4 w-4" />
            Petición de Oración
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            className="grid h-10 w-10 place-items-center rounded-xl text-slate-700 transition-colors hover:bg-slate-50 xl:hidden"
          >
            {open ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* ---------- Menú móvil ---------- */}
      <div
        className={`overflow-y-auto overscroll-contain border-t border-slate-100 bg-white transition-[max-height,opacity] duration-300 xl:hidden ${
          open ? "max-h-[85vh] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="space-y-1.5 px-4 py-5">
          {[...NAV_SIMPLE, ...NAV_MAS].map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`block rounded-xl px-4 py-3 text-base font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}

          {/* Acordeón Grupos y Ministerios */}
          <li className="mt-1 border-t border-slate-100 pt-2">
            <button
              type="button"
              onClick={() => setGruposMobile((v) => !v)}
              aria-expanded={gruposMobile}
              className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-base font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Grupos y Ministerios
              <ChevronDown
                className={`h-5 w-5 transition-transform ${gruposMobile ? "rotate-180" : ""}`}
              />
            </button>
            <div
              className={`overflow-hidden transition-[max-height] duration-300 ${
                gruposMobile ? "max-h-96" : "max-h-0"
              }`}
            >
              <ul className="space-y-1 py-1 pl-3">
                {GRUPOS_DROPDOWN.map((g) => (
                  <li key={g.slug}>
                    <Link
                      href={`/grupos/${g.slug}`}
                      className="block rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                    >
                      {g.titulo}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </li>

          <li>
            <Link
              href="/oracion-peticion"
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-base font-semibold text-white"
            >
              <PrayingHands className="h-5 w-5" />
              Petición de Oración
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
