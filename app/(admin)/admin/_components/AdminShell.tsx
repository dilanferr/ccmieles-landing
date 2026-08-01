"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cerrarSesion } from "@/app/(admin)/actions";
import {
  GridIcon,
  ChartIcon,
  MegaphoneIcon,
  CalendarIcon,
  PrayingHands,
  ImageIcon,
  SearchIcon,
  CogIcon,
  SunIcon,
  MoonIcon,
  HeartIcon,
  UsersIcon,
  ChevronLeft,
  CloseIcon,
  type Icon,
} from "@/app/components/icons";
import type { TabId } from "./types";
import DashboardModule from "./DashboardModule";
import NoticiasModule from "./NoticiasModule";
import ClasificadosModule from "./ClasificadosModule";
import EventosModule from "./EventosModule";
import PeticionesModule from "./PeticionesModule";
import ConfigModule from "./ConfigModule";
import MultimediaModule from "./MultimediaModule";
import AnaliticasModule from "./AnaliticasModule";
import SeoModule from "./SeoModule";
import ImpactoModule from "./ImpactoModule";

type NavItem = { id: TabId; label: string; Icon: Icon; soon?: boolean };

const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: "General",
    items: [
      { id: "impacto", label: "Impacto del Ministerio", Icon: HeartIcon },
      { id: "dashboard", label: "Dashboard", Icon: GridIcon },
      { id: "analiticas", label: "Analíticas", Icon: ChartIcon },
    ],
  },
  {
    group: "Contenido",
    items: [
      { id: "noticias", label: "Noticias / Blog", Icon: MegaphoneIcon },
      { id: "clasificados", label: "Comunidad", Icon: UsersIcon },
    ],
  },
  {
    group: "Gestión",
    items: [
      { id: "eventos", label: "Eventos y Cultos", Icon: CalendarIcon },
      { id: "peticiones", label: "Peticiones", Icon: PrayingHands },
    ],
  },
  {
    group: "Plataforma",
    items: [
      { id: "multimedia", label: "Multimedia", Icon: ImageIcon },
      { id: "seo", label: "SEO", Icon: SearchIcon },
      { id: "config", label: "Configuración", Icon: CogIcon },
    ],
  },
];

const TODOS = NAV.flatMap((g) => g.items);

export function AdminShell({ email }: { email: string }) {
  const [tab, setTab] = useState<TabId>("impacto");
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);
  const [palette, setPalette] = useState(false);
  const [ready, setReady] = useState(false);

  // Recupera preferencias guardadas.
  useEffect(() => {
    setCollapsed(localStorage.getItem("mieles.admin.collapsed") === "1");
    setDark(localStorage.getItem("mieles.admin.theme") === "dark");
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem("mieles.admin.collapsed", collapsed ? "1" : "0");
  }, [collapsed, ready]);
  useEffect(() => {
    if (ready) localStorage.setItem("mieles.admin.theme", dark ? "dark" : "light");
  }, [dark, ready]);

  // Atajo ⌘K / Ctrl+K para la búsqueda.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((v) => !v);
      }
      if (e.key === "Escape") setPalette(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const actual = TODOS.find((t) => t.id === tab);

  function ir(id: TabId) {
    const item = TODOS.find((t) => t.id === id);
    if (item?.soon) return;
    setTab(id);
    setPalette(false);
  }

  return (
    <div className={dark ? "dark" : ""}>
      <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        {/* ============ SIDEBAR ============ */}
        <aside
          className={`sticky top-0 z-30 flex h-screen shrink-0 flex-col border-r border-slate-800 bg-slate-900 text-slate-300 transition-[width] duration-300 ${
            collapsed ? "w-[68px]" : "w-64"
          }`}
        >
          {/* Marca */}
          <div className="flex h-16 items-center gap-3 px-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-linear-to-br from-blue-600 to-sky-500 text-sm font-black text-white">
              M
            </span>
            {!collapsed && (
              <div className="leading-tight">
                <p className="text-sm font-bold text-white">Mieles</p>
                <p className="text-[11px] text-slate-400">Centro de control</p>
              </div>
            )}
          </div>

          {/* Navegación */}
          <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4 [scrollbar-width:thin]">
            {NAV.map((g) => (
              <div key={g.group}>
                {!collapsed && (
                  <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                    {g.group}
                  </p>
                )}
                <ul className="space-y-1">
                  {g.items.map((item) => {
                    const active = tab === item.id;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => ir(item.id)}
                          disabled={item.soon}
                          title={collapsed ? item.label : undefined}
                          aria-current={active ? "page" : undefined}
                          className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                            active
                              ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                              : item.soon
                                ? "cursor-not-allowed text-slate-500"
                                : "text-slate-300 hover:bg-slate-800 hover:text-white"
                          }`}
                        >
                          <item.Icon className="h-5 w-5 shrink-0" />
                          {!collapsed && (
                            <span className="flex-1 text-left">{item.label}</span>
                          )}
                          {!collapsed && item.soon && (
                            <span className="rounded-full bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-400">
                              Pronto
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {/* Colapsar */}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="flex items-center gap-3 border-t border-slate-800 px-4 py-3 text-xs font-semibold text-slate-400 transition-colors hover:text-white"
          >
            <ChevronLeft
              className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`}
            />
            {!collapsed && "Colapsar"}
          </button>
        </aside>

        {/* ============ ÁREA PRINCIPAL ============ */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Topbar */}
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/80 px-5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center gap-3">
              <h1 className="text-base font-bold text-slate-900 dark:text-white">
                {actual?.label ?? "Panel"}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPalette(true)}
                className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:border-blue-200 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 sm:flex"
              >
                <SearchIcon className="h-4 w-4" />
                Buscar
                <kbd className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                  ⌘K
                </kbd>
              </button>

              <button
                type="button"
                onClick={() => setDark((v) => !v)}
                aria-label="Cambiar tema"
                className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {dark ? <SunIcon className="h-4.5 w-4.5" /> : <MoonIcon className="h-4.5 w-4.5" />}
              </button>

              <Link
                href="/"
                className="hidden rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-blue-200 hover:text-blue-700 dark:border-slate-700 dark:text-slate-300 sm:block"
              >
                Ver sitio
              </Link>

              <span
                className="hidden max-w-40 truncate text-xs text-slate-400 lg:block"
                title={email}
              >
                {email}
              </span>

              <form action={cerrarSesion}>
                <button
                  type="submit"
                  className="rounded-full bg-blue-700 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-800"
                >
                  Salir
                </button>
              </form>
            </div>
          </header>

          {/* Contenido */}
          <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 sm:px-8">
            {tab === "impacto" && <ImpactoModule />}
            {tab === "dashboard" && <DashboardModule onIr={ir} />}
            {tab === "noticias" && <NoticiasModule />}
            {tab === "clasificados" && <ClasificadosModule />}
            {tab === "eventos" && <EventosModule />}
            {tab === "peticiones" && <PeticionesModule />}
            {tab === "config" && <ConfigModule />}
            {tab === "multimedia" && <MultimediaModule />}
            {tab === "analiticas" && <AnaliticasModule />}
            {tab === "seo" && <SeoModule />}
          </main>
        </div>
      </div>

      {/* ============ PALETA ⌘K ============ */}
      {palette && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 p-4 pt-[15vh] backdrop-blur-sm"
          onClick={() => setPalette(false)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 dark:border-slate-800">
              <SearchIcon className="h-5 w-5 text-slate-400" />
              <input
                autoFocus
                placeholder="Ir a…"
                className="flex-1 bg-transparent py-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                onChange={() => {}}
              />
              <button
                type="button"
                onClick={() => setPalette(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
            <ul className="max-h-72 overflow-y-auto p-2">
              {TODOS.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => ir(item.id)}
                    disabled={item.soon}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <item.Icon className="h-4.5 w-4.5" />
                    {item.label}
                    {item.soon && (
                      <span className="ml-auto text-[10px] font-bold uppercase text-slate-400">
                        Pronto
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
