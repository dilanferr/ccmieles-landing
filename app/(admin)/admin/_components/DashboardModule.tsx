"use client";

import { useEffect, useState, type ReactNode } from "react";
import { getDb } from "./db";
import { Card, EstadoVacio, ModuleHeader } from "./ui";
import type { Rol, TabId } from "./types";
import {
  GridIcon,
  ChartIcon,
  MegaphoneIcon,
  CalendarIcon,
  PrayingHands,
  WalletIcon,
  UsersIcon,
  HeartIcon,
  type Icon,
} from "@/app/components/icons";

type TurnoResumen = {
  fecha: string;
  equipo: string;
  miembro: string;
  rol: string | null;
};

type Datos = {
  visitasHoy: number;
  visitasMes: number;
  activos: number;
  topPaginas: { path: string; n: number }[];
  fuentes: { fuente: string; n: number }[];
  sinAnalitica: boolean;
  noticias: number;
  eventos: number;
  peticiones: number;
  pendientes: number;
  supabaseOk: boolean;
  // Widgets según rol (null = el rol no tiene acceso a esa fuente).
  balance: { ingresos: number; egresos: number } | null;
  turnos: TurnoResumen[] | null;
  cumples: { nombre: string; dia: number }[] | null;
};

const nf = (n: number) => n.toLocaleString("es-CL");
const clp = (n: number) => "$" + Math.round(n).toLocaleString("es-CL");
const ymd = (dt: Date) =>
  `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(
    dt.getDate(),
  ).padStart(2, "0")}`;

const DIAS_CORTOS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const fechaCorta = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return `${DIAS_CORTOS[dt.getDay()]} ${d}/${m}`;
};

const FINANZAS_ROLES: Rol[] = ["admin", "pastor", "tesorero"];
const TURNOS_ROLES: Rol[] = ["admin", "pastor", "lider"];
const MIEMBROS_ROLES: Rol[] = ["admin", "pastor", "secretaria"];

function fuenteDe(ref: string | null): string {
  if (!ref) return "Directo";
  try {
    const h = new URL(ref).hostname.replace("www.", "");
    if (h.includes("google")) return "Google";
    if (h.includes("facebook") || h.includes("fb.")) return "Facebook";
    if (h.includes("instagram")) return "Instagram";
    if (h.includes("whatsapp") || h.includes("wa.me")) return "WhatsApp";
    if (h.includes("bing")) return "Bing";
    return h;
  } catch {
    return "Directo";
  }
}

export default function DashboardModule({
  onIr,
  rol,
}: {
  onIr: (t: TabId) => void;
  rol: Rol;
}) {
  const supabase = getDb();
  const [d, setD] = useState<Datos | null>(null);
  const [loading, setLoading] = useState(true);

  const verFinanzas = FINANZAS_ROLES.includes(rol);
  const verTurnos = TURNOS_ROLES.includes(rol);
  const verMiembros = MIEMBROS_ROLES.includes(rol);

  useEffect(() => {
    (async () => {
      const now = new Date();
      const hoy = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const mes = new Date(now.getFullYear(), now.getMonth(), 1);
      const cinco = new Date(now.getTime() - 5 * 60 * 1000);
      const mesActual = now.getMonth() + 1;
      // Semana actual (lunes → domingo) para el widget de turnos.
      const offLun = (now.getDay() + 6) % 7;
      const lunes = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offLun);
      const domingo = new Date(lunes.getFullYear(), lunes.getMonth(), lunes.getDate() + 6);

      const countRows = async (
        tabla: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        filtro?: (q: any) => any,
      ): Promise<number | null> => {
        let q = supabase.from(tabla).select("*", { count: "exact", head: true });
        if (filtro) q = filtro(q);
        const { count, error } = await q;
        return error ? null : (count ?? 0);
      };

      // Contenido (siempre disponible).
      const [noticias, eventos, peticiones, pendientes] = await Promise.all([
        countRows("noticias"),
        countRows("eventos"),
        countRows("peticiones_oracion"),
        countRows("peticiones_oracion", (q) => q.eq("leido", false)),
      ]);

      // Analítica (tabla page_views — puede no existir todavía).
      const visitasHoy = await countRows("page_views", (q) =>
        q.gte("creado_at", hoy.toISOString()),
      );
      const sinAnalitica = visitasHoy === null;

      let visitasMes = 0;
      let activos = 0;
      let topPaginas: { path: string; n: number }[] = [];
      let fuentes: { fuente: string; n: number }[] = [];

      if (!sinAnalitica) {
        visitasMes = (await countRows("page_views", (q) =>
          q.gte("creado_at", mes.toISOString()),
        )) as number;

        const { data: recientes } = await supabase
          .from("page_views")
          .select("session_id")
          .gte("creado_at", cinco.toISOString())
          .limit(1000);
        activos = new Set(
          (recientes ?? []).map((r: { session_id: string }) => r.session_id),
        ).size;

        const { data: muestra } = await supabase
          .from("page_views")
          .select("path, referrer")
          .gte("creado_at", mes.toISOString())
          .limit(3000);
        const paths: Record<string, number> = {};
        const refs: Record<string, number> = {};
        (muestra ?? []).forEach((r: { path: string; referrer: string | null }) => {
          paths[r.path] = (paths[r.path] ?? 0) + 1;
          const f = fuenteDe(r.referrer);
          refs[f] = (refs[f] ?? 0) + 1;
        });
        topPaginas = Object.entries(paths)
          .map(([path, n]) => ({ path, n }))
          .sort((a, b) => b.n - a.n)
          .slice(0, 6);
        fuentes = Object.entries(refs)
          .map(([fuente, n]) => ({ fuente, n }))
          .sort((a, b) => b.n - a.n)
          .slice(0, 6);
      }

      // ── Widgets según rol. La RLS es la barrera real; aquí sólo pedimos
      //    lo que el rol puede ver para no mostrar tarjetas vacías/erróneas.
      let balance: Datos["balance"] = null;
      if (verFinanzas) {
        const { data: trx } = await supabase
          .from("transacciones_financieras")
          .select("tipo, monto")
          .is("eliminado_at", null)
          .gte("fecha", ymd(mes));
        if (trx) {
          let ingresos = 0;
          let egresos = 0;
          (trx as { tipo: string; monto: number }[]).forEach((t) => {
            if (t.tipo === "ingreso") ingresos += t.monto;
            else egresos += t.monto;
          });
          balance = { ingresos, egresos };
        }
      }

      let turnos: Datos["turnos"] = null;
      if (verTurnos) {
        const [tRes, eRes, dRes] = await Promise.all([
          supabase
            .from("turnos_servidores")
            .select("fecha, equipo_id, miembro_id, rol_en_equipo")
            .gte("fecha", ymd(hoy))
            .lte("fecha", ymd(domingo))
            .order("fecha", { ascending: true }),
          supabase.from("equipos").select("id, nombre"),
          supabase.rpc("directorio_miembros"),
        ]);
        const eqMap = new Map(
          ((eRes.data as { id: string; nombre: string }[]) ?? []).map((e) => [
            e.id,
            e.nombre,
          ]),
        );
        const miMap = new Map(
          ((dRes.data as { id: string; nombre: string }[]) ?? []).map((m) => [
            m.id,
            m.nombre,
          ]),
        );
        turnos = (
          (tRes.data as {
            fecha: string;
            equipo_id: string;
            miembro_id: string | null;
            rol_en_equipo: string | null;
          }[]) ?? []
        )
          .slice(0, 8)
          .map((t) => ({
            fecha: t.fecha,
            equipo: eqMap.get(t.equipo_id) ?? "Equipo",
            miembro: t.miembro_id ? (miMap.get(t.miembro_id) ?? "—") : "Sin asignar",
            rol: t.rol_en_equipo,
          }));
      }

      let cumples: Datos["cumples"] = null;
      if (verMiembros) {
        const { data: ms } = await supabase
          .from("miembros_iglesia")
          .select("nombre_completo, fecha_nacimiento")
          .is("eliminado_at", null)
          .not("fecha_nacimiento", "is", null);
        if (ms) {
          cumples = (
            ms as { nombre_completo: string; fecha_nacimiento: string }[]
          )
            .filter((m) => Number(m.fecha_nacimiento.slice(5, 7)) === mesActual)
            .map((m) => ({
              nombre: m.nombre_completo,
              dia: Number(m.fecha_nacimiento.slice(8, 10)),
            }))
            .sort((a, b) => a.dia - b.dia);
        }
      }

      setD({
        visitasHoy: visitasHoy ?? 0,
        visitasMes,
        activos,
        topPaginas,
        fuentes,
        sinAnalitica,
        noticias: noticias ?? 0,
        eventos: eventos ?? 0,
        peticiones: peticiones ?? 0,
        pendientes: pendientes ?? 0,
        supabaseOk: noticias !== null,
        balance,
        turnos,
        cumples,
      });
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || !d) {
    return (
      <div>
        <ModuleHeader
          icon={<GridIcon className="h-6 w-6" />}
          titulo="Dashboard"
          descripcion="Estado general de la iglesia digital."
        />
        <EstadoVacio loading>Cargando panel…</EstadoVacio>
      </div>
    );
  }

  const kpis: { label: string; valor: string; sub?: string; Icon: Icon }[] = [
    {
      label: "Visitas hoy",
      valor: d.sinAnalitica ? "—" : nf(d.visitasHoy),
      Icon: ChartIcon,
    },
    {
      label: "Visitas este mes",
      valor: d.sinAnalitica ? "—" : nf(d.visitasMes),
      Icon: ChartIcon,
    },
    {
      label: "Activos ahora",
      valor: d.sinAnalitica ? "—" : nf(d.activos),
      sub: "últimos 5 min",
      Icon: GridIcon,
    },
    {
      label: "Peticiones pendientes",
      valor: nf(d.pendientes),
      sub: `${nf(d.peticiones)} en total`,
      Icon: PrayingHands,
    },
  ];

  const totalFuentes = d.fuentes.reduce((a, f) => a + f.n, 0) || 1;
  const maxPagina = d.topPaginas[0]?.n || 1;

  return (
    <div>
      <ModuleHeader
        icon={<GridIcon className="h-6 w-6" />}
        titulo="Dashboard"
        descripcion="El estado completo de la iglesia digital, de un vistazo."
      />

      {/* Aviso de estado inicial: analítica conectada pero aún sin visitas.
          Mismo lenguaje visual que el banner del módulo de Impacto. */}
      {!d.sinAnalitica && d.visitasMes === 0 && (
        <Card className="mb-6 flex items-center gap-4 border-blue-200 bg-linear-to-br from-blue-50 to-sky-50 dark:border-slate-700 dark:from-slate-800 dark:to-slate-800/60">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-300">
            <MegaphoneIcon className="h-6 w-6" />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              Recolectando datos…
            </p>
            <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
              ¡Comparte el enlace de la iglesia para empezar a medir el
              movimiento!
            </p>
          </div>
        </Card>
      )}

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-300">
                <k.Icon className="h-5 w-5" />
              </span>
              {k.sub && (
                <span className="text-[11px] font-medium text-slate-400">
                  {k.sub}
                </span>
              )}
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {k.valor}
            </p>
            <p className="mt-0.5 text-sm font-medium text-slate-500 dark:text-slate-400">
              {k.label}
            </p>
          </Card>
        ))}
      </div>

      {/* Widgets según rol: finanzas, turnos de la semana y cumpleaños. */}
      {(d.balance || d.turnos || d.cumples) && (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {d.balance && (
            <Card className="flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Balance del mes
                </h3>
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <WalletIcon className="h-5 w-5" />
                </span>
              </div>
              {(() => {
                const saldo = d.balance.ingresos - d.balance.egresos;
                return (
                  <>
                    <p
                      className={`mt-4 text-3xl font-bold tracking-tight ${
                        saldo >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {clp(saldo)}
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-slate-500 dark:text-slate-400">
                      Saldo del mes actual
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl bg-emerald-50/70 p-3 dark:bg-emerald-950/30">
                        <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                          Ingresos
                        </p>
                        <p className="mt-0.5 font-bold text-slate-900 dark:text-white">
                          {clp(d.balance.ingresos)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-rose-50/70 p-3 dark:bg-rose-950/30">
                        <p className="text-xs font-medium text-rose-700 dark:text-rose-300">
                          Egresos
                        </p>
                        <p className="mt-0.5 font-bold text-slate-900 dark:text-white">
                          {clp(d.balance.egresos)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onIr("finanzas")}
                      className="mt-4 self-start text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      Ver tesorería →
                    </button>
                  </>
                );
              })()}
            </Card>
          )}

          {d.turnos && (
            <Card className="flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Turnos de la semana
                </h3>
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-300">
                  <UsersIcon className="h-5 w-5" />
                </span>
              </div>
              {d.turnos.length === 0 ? (
                <p className="mt-4 text-sm text-slate-400">
                  Sin turnos asignados esta semana.
                </p>
              ) : (
                <ul className="mt-4 flex-1 space-y-2.5">
                  {d.turnos.map((t, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-800 dark:text-slate-100">
                          {t.miembro}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                          {t.equipo}
                          {t.rol ? ` · ${t.rol}` : ""}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {fechaCorta(t.fecha)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                onClick={() => onIr("turnos")}
                className="mt-4 self-start text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Ver planilla →
              </button>
            </Card>
          )}

          {d.cumples && (
            <Card className="flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Cumpleaños del mes
                </h3>
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300">
                  <HeartIcon className="h-5 w-5" />
                </span>
              </div>
              {d.cumples.length === 0 ? (
                <p className="mt-4 text-sm text-slate-400">
                  Nadie cumple años este mes.
                </p>
              ) : (
                <ul className="mt-4 flex-1 space-y-2.5">
                  {d.cumples.map((c, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="truncate font-medium text-slate-700 dark:text-slate-300">
                        {c.nombre}
                      </span>
                      <span className="shrink-0 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:bg-rose-950/40 dark:text-rose-300">
                        Día {c.dia}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                onClick={() => onIr("miembros")}
                className="mt-4 self-start text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Ver fichas →
              </button>
            </Card>
          )}
        </div>
      )}

      {/* Analítica */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Páginas más visitadas
          </h3>
          {d.sinAnalitica ? (
            <ConectarAnalitica />
          ) : d.topPaginas.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">Aún sin datos este mes.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {d.topPaginas.map((p) => (
                <li key={p.path}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate font-medium text-slate-700 dark:text-slate-300">
                      {p.path}
                    </span>
                    <span className="text-slate-400">{nf(p.n)}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-blue-600 to-sky-500"
                      style={{ width: `${(p.n / maxPagina) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Origen del tráfico
          </h3>
          {d.sinAnalitica ? (
            <ConectarAnalitica />
          ) : d.fuentes.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">Aún sin datos este mes.</p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {d.fuentes.map((f) => (
                <li key={f.fuente} className="flex items-center gap-3 text-sm">
                  <span className="w-24 shrink-0 truncate font-medium text-slate-700 dark:text-slate-300">
                    {f.fuente}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: `${(f.n / totalFuentes) * 100}%` }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right text-slate-400">
                    {Math.round((f.n / totalFuentes) * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Contenido + sistema */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Contenido publicado
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Atajo
              icon={<MegaphoneIcon className="h-5 w-5" />}
              valor={d.noticias}
              label="Publicaciones"
              onClick={() => onIr("noticias")}
            />
            <Atajo
              icon={<CalendarIcon className="h-5 w-5" />}
              valor={d.eventos}
              label="Eventos"
              onClick={() => onIr("eventos")}
            />
            <Atajo
              icon={<PrayingHands className="h-5 w-5" />}
              valor={d.peticiones}
              label="Peticiones"
              onClick={() => onIr("peticiones")}
            />
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Estado del sistema
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <Estado nombre="Supabase" ok={d.supabaseOk} />
            <Estado nombre="Analítica" ok={!d.sinAnalitica} nota={d.sinAnalitica ? "sin conectar" : undefined} />
            <Estado nombre="Cloudinary" ok />
            <Estado nombre="Vercel · SSL" ok />
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Atajo({
  icon,
  valor,
  label,
  onClick,
}: {
  icon: ReactNode;
  valor: number;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-slate-200 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:border-slate-800 dark:hover:border-slate-700"
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-300">
        {icon}
      </span>
      <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
        {nf(valor)}
      </p>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </button>
  );
}

function Estado({
  nombre,
  ok,
  nota,
}: {
  nombre: string;
  ok: boolean;
  nota?: string;
}) {
  return (
    <li className="flex items-center justify-between">
      <span className="text-slate-600 dark:text-slate-300">{nombre}</span>
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
          ok ? "text-emerald-600 dark:text-emerald-400" : "text-amber-500"
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${ok ? "bg-emerald-500" : "bg-amber-400"}`}
        />
        {nota ?? (ok ? "Operativo" : "Revisar")}
      </span>
    </li>
  );
}

function ConectarAnalitica() {
  return (
    <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400">
      <p className="font-semibold text-slate-700 dark:text-slate-200">
        Conecta la analítica
      </p>
      <p className="mt-1 leading-relaxed">
        Crea la tabla <code className="rounded bg-slate-200 px-1 dark:bg-slate-700">page_views</code>{" "}
        en Supabase y las visitas empezarán a registrarse automáticamente.
      </p>
    </div>
  );
}
