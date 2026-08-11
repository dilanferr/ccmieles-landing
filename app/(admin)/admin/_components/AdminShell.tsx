"use client";

import { useEffect, useMemo, useState } from "react";
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
  IdCardIcon,
  WalletIcon,
  LockIcon,
  BookIcon,
  BoxIcon,
  UserCheckIcon,
  SparkIcon,
  TrashIcon,
  ChevronLeft,
  CloseIcon,
  MenuIcon,
  type Icon,
} from "@/app/components/icons";
import type { TabId, Rol } from "./types";
import DashboardModule from "./DashboardModule";
import NoticiasModule from "./NoticiasModule";
import ClasificadosModule from "./ClasificadosModule";
import EventosModule from "./EventosModule";
import ServiciosModule from "./ServiciosModule";
import TurnosModule from "./TurnosModule";
import MiembrosModule from "./MiembrosModule";
import FinanzasModule from "./FinanzasModule";
import PeticionesModule from "./PeticionesModule";
import ConfigModule from "./ConfigModule";
import MultimediaModule from "./MultimediaModule";
import AnaliticasModule from "./AnaliticasModule";
import SeoModule from "./SeoModule";
import ImpactoModule from "./ImpactoModule";
import UsuariosModule from "./UsuariosModule";
import AuditoriaModule from "./AuditoriaModule";
import InventarioModule from "./InventarioModule";
import AsistenciaModule from "./AsistenciaModule";
import PapeleraModule from "./PapeleraModule";
import ConsolidacionModule from "./ConsolidacionModule";
import { getDb } from "./db";

type NavItem = { id: TabId; label: string; Icon: Icon; soon?: boolean };

/* ============ RBAC — control de acceso por rol ============
   admin/pastor ven TODO. El resto solo las pestañas listadas aquí. */
const ROLES_TOTALES: Rol[] = ["admin", "pastor"];
const ACCESO_EXTRA: Partial<Record<TabId, Rol[]>> = {
  dashboard: ["tesorero", "lider", "secretaria", "intercesion", "logistica"],
  servicios: ["lider", "secretaria", "logistica"],
  turnos: ["lider", "logistica"],
  asistencia: ["lider", "secretaria"],
  inventario: ["logistica"],
  miembros: ["secretaria"],
  consolidacion: ["lider", "secretaria"],
  finanzas: ["tesorero"],
  peticiones: ["intercesion"],
};
function puedeVer(rol: Rol, id: TabId): boolean {
  return ROLES_TOTALES.includes(rol) || (ACCESO_EXTRA[id]?.includes(rol) ?? false);
}

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
      { id: "servicios", label: "Servicios semanales", Icon: GridIcon },
      { id: "turnos", label: "Turnos y Servidores", Icon: UsersIcon },
      { id: "asistencia", label: "Asistencia y Check-in", Icon: UserCheckIcon },
      { id: "inventario", label: "Inventario y Bienes", Icon: BoxIcon },
      { id: "peticiones", label: "Peticiones", Icon: PrayingHands },
    ],
  },
  {
    group: "Pastoral",
    items: [
      { id: "miembros", label: "Fichas de Miembros", Icon: IdCardIcon },
      { id: "consolidacion", label: "Consolidación", Icon: SparkIcon },
    ],
  },
  {
    group: "Tesorería",
    items: [{ id: "finanzas", label: "Finanzas", Icon: WalletIcon }],
  },
  {
    group: "Plataforma",
    items: [
      { id: "multimedia", label: "Multimedia", Icon: ImageIcon },
      { id: "seo", label: "SEO", Icon: SearchIcon },
      { id: "config", label: "Configuración", Icon: CogIcon },
    ],
  },
  {
    group: "Administración",
    items: [
      { id: "usuarios", label: "Usuarios y Roles", Icon: LockIcon },
      { id: "auditoria", label: "Auditoría", Icon: BookIcon },
      { id: "papelera", label: "Papelera", Icon: TrashIcon },
    ],
  },
];

const TODOS = NAV.flatMap((g) => g.items);

export function AdminShell({
  email,
  rol,
  userId,
}: {
  email: string;
  rol: Rol;
  userId: string;
}) {
  // Menú y buscador filtrados por rol (defensa en UI; la RLS es la real).
  const navVisible = useMemo(
    () =>
      NAV.map((g) => ({
        ...g,
        items: g.items.filter((it) => puedeVer(rol, it.id)),
      })).filter((g) => g.items.length > 0),
    [rol],
  );
  const todosVisibles = useMemo(
    () => navVisible.flatMap((g) => g.items),
    [navVisible],
  );

  const [tab, setTab] = useState<TabId>(
    () => TODOS.find((t) => puedeVer(rol, t.id))?.id ?? "dashboard",
  );
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);
  const [palette, setPalette] = useState(false);
  const [ready, setReady] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false); // drawer del sidebar en móvil
  const [riesgoCount, setRiesgoCount] = useState(0); // consolidaciones "en riesgo" (badge)

  // Recupera preferencias desde localStorage tras el montaje. Aquí setState en
  // efecto ES el patrón correcto: localStorage no existe en SSR y `ready` evita
  // el desajuste de hidratación. Por eso se exime la regla en este bloque.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setCollapsed(localStorage.getItem("mieles.admin.collapsed") === "1");
    setDark(localStorage.getItem("mieles.admin.theme") === "dark");
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem("mieles.admin.collapsed", collapsed ? "1" : "0");
  }, [collapsed, ready]);
  useEffect(() => {
    if (ready) localStorage.setItem("mieles.admin.theme", dark ? "dark" : "light");
  }, [dark, ready]);

  // Badge de alerta: cuenta liviana (un RPC escalar en BD) de consolidaciones
  // "en riesgo". Solo se pide si el rol puede ver el módulo. Falla en silencio
  // (si el RPC no existe aún o no hay permiso, el badge simplemente no aparece).
  useEffect(() => {
    if (!puedeVer(rol, "consolidacion")) return;
    let vivo = true;
    (async () => {
      const { data } = await getDb().rpc("fn_consolidacion_riesgo");
      if (vivo && typeof data === "number") setRiesgoCount(data);
    })();
    return () => {
      vivo = false;
    };
  }, [rol]);

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
    if (item?.soon || !puedeVer(rol, id)) return;
    setTab(id);
    setPalette(false);
    setMobileOpen(false); // cierra el drawer al elegir sección en móvil
  }

  return (
    <div className={dark ? "dark" : ""}>
      <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        {/* Backdrop del drawer (solo móvil) */}
        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            aria-hidden
            className="fixed inset-0 z-30 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          />
        )}

        {/* ============ SIDEBAR ============ */}
        {/* Móvil: drawer fijo que entra/sale con translate. Escritorio (lg):
            sticky en el flujo, con colapso de ancho. */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex h-screen w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-900 text-slate-300 transition-transform duration-300 lg:sticky lg:top-0 lg:z-30 lg:translate-x-0 lg:transition-[width] ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          } ${collapsed ? "lg:w-[68px]" : "lg:w-64"}`}
        >
          {/* Marca */}
          <div className="flex h-16 items-center gap-3 px-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-linear-to-br from-blue-600 to-sky-500 text-sm font-black text-white">
              M
            </span>
            <div className={`leading-tight ${collapsed ? "lg:hidden" : ""}`}>
              <p className="text-sm font-bold text-white">Mieles</p>
              <p className="text-[11px] text-slate-400">Centro de control</p>
            </div>
            {/* Cerrar drawer (solo móvil) */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Cerrar menú"
              className="ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-white lg:hidden"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Navegación */}
          <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4 [scrollbar-width:thin]">
            {navVisible.map((g) => (
              <div key={g.group}>
                <p
                  className={`mb-1 px-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 ${collapsed ? "lg:hidden" : ""}`}
                >
                  {g.group}
                </p>
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
                          className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                            active
                              ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                              : item.soon
                                ? "cursor-not-allowed text-slate-500"
                                : "text-slate-300 hover:bg-slate-800 hover:text-white"
                          }`}
                        >
                          <item.Icon className="h-5 w-5 shrink-0" />
                          <span
                            className={`flex-1 text-left ${collapsed ? "lg:hidden" : ""}`}
                          >
                            {item.label}
                          </span>
                          {item.id === "consolidacion" && riesgoCount > 0 && (
                            <>
                              <span
                                title={`${riesgoCount} en riesgo`}
                                className={`rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white ${collapsed ? "lg:hidden" : ""}`}
                              >
                                {riesgoCount}
                              </span>
                              {/* Colapsado: un punto rojo sobre el ícono. */}
                              <span
                                className={`absolute right-2 top-1.5 hidden h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-slate-900 ${collapsed ? "lg:block" : ""}`}
                              />
                            </>
                          )}
                          {item.soon && (
                            <span
                              className={`rounded-full bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-400 ${collapsed ? "lg:hidden" : ""}`}
                            >
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
            className="hidden items-center gap-3 border-t border-slate-800 px-4 py-3 text-xs font-semibold text-slate-400 transition-colors hover:text-white lg:flex"
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
            <div className="flex min-w-0 items-center gap-2">
              {/* Hamburguesa (solo móvil) */}
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Abrir menú"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <MenuIcon className="h-5 w-5" />
              </button>
              <h1 className="truncate text-base font-bold text-slate-900 dark:text-white">
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

              <span className="hidden items-center gap-2 lg:flex">
                <span
                  className="max-w-40 truncate text-xs text-slate-400"
                  title={email}
                >
                  {email}
                </span>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700 dark:bg-slate-800 dark:text-blue-300">
                  {rol}
                </span>
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
            {tab === "dashboard" && <DashboardModule onIr={ir} rol={rol} />}
            {tab === "noticias" && <NoticiasModule />}
            {tab === "clasificados" && <ClasificadosModule />}
            {tab === "eventos" && <EventosModule />}
            {tab === "servicios" && <ServiciosModule />}
            {tab === "turnos" && <TurnosModule />}
            {tab === "asistencia" && <AsistenciaModule />}
            {tab === "inventario" && <InventarioModule />}
            {tab === "miembros" && <MiembrosModule />}
            {tab === "finanzas" && <FinanzasModule />}
            {tab === "peticiones" && <PeticionesModule />}
            {tab === "config" && <ConfigModule />}
            {tab === "multimedia" && <MultimediaModule />}
            {tab === "analiticas" && <AnaliticasModule />}
            {tab === "seo" && <SeoModule />}
            {tab === "usuarios" && <UsuariosModule miId={userId} />}
            {tab === "auditoria" && <AuditoriaModule />}
            {tab === "papelera" && <PapeleraModule rol={rol} />}
            {tab === "consolidacion" && <ConsolidacionModule rol={rol} />}
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
              {todosVisibles.map((item) => (
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
