"use client";

import { useEffect, useState } from "react";
import { getDb } from "./db";
import { Card, EstadoVacio, ModuleHeader } from "./ui";
import { ChartIcon, GridIcon, MegaphoneIcon } from "@/app/components/icons";

type Dia = { key: string; label: string; n: number };
type Pagina = { path: string; n: number };

type Datos = {
  total: number;
  unicas: number;
  hoy: number;
  dias: Dia[];
  paginas: Pagina[];
  sinTabla: boolean;
};

const nf = (n: number) => n.toLocaleString("es-CL");

export default function AnaliticasModule() {
  const supabase = getDb();
  const [d, setD] = useState<Datos | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const now = new Date();
      const inicioHoy = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
      );
      const hace30 = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
      const hace7 = new Date(now.getTime() - 6 * 24 * 3600 * 1000);
      hace7.setUTCHours(0, 0, 0, 0);

      // Total (todo el histórico) — también detecta si la tabla existe.
      const totalRes = await supabase
        .from("page_views")
        .select("*", { count: "exact", head: true });
      if (totalRes.error) {
        setD({
          total: 0,
          unicas: 0,
          hoy: 0,
          dias: [],
          paginas: [],
          sinTabla: true,
        });
        setLoading(false);
        return;
      }

      const hoyRes = await supabase
        .from("page_views")
        .select("*", { count: "exact", head: true })
        .gte("creado_at", inicioHoy.toISOString());

      // Sesiones únicas + páginas (últimos 30 días).
      const { data: muestra30 } = await supabase
        .from("page_views")
        .select("session_id, path")
        .gte("creado_at", hace30.toISOString())
        .limit(8000);
      const sesiones = new Set<string>();
      const paths: Record<string, number> = {};
      (muestra30 ?? []).forEach((r: { session_id: string; path: string }) => {
        if (r.session_id) sesiones.add(r.session_id);
        paths[r.path] = (paths[r.path] ?? 0) + 1;
      });
      const paginas = Object.entries(paths)
        .map(([path, n]) => ({ path, n }))
        .sort((a, b) => b.n - a.n)
        .slice(0, 8);

      // Tendencia de 7 días.
      const { data: muestra7 } = await supabase
        .from("page_views")
        .select("creado_at")
        .gte("creado_at", hace7.toISOString())
        .limit(8000);
      const buckets: Record<string, number> = {};
      (muestra7 ?? []).forEach((r: { creado_at: string }) => {
        const k = r.creado_at.slice(0, 10);
        buckets[k] = (buckets[k] ?? 0) + 1;
      });
      const dias: Dia[] = Array.from({ length: 7 }, (_, i) => {
        const dt = new Date(now.getTime() - (6 - i) * 24 * 3600 * 1000);
        const key = dt.toISOString().slice(0, 10);
        return {
          key,
          label: new Date(`${key}T12:00:00Z`).toLocaleDateString("es-CL", {
            weekday: "short",
          }),
          n: buckets[key] ?? 0,
        };
      });

      setD({
        total: totalRes.count ?? 0,
        unicas: sesiones.size,
        hoy: hoyRes.count ?? 0,
        dias,
        paginas,
        sinTabla: false,
      });
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || !d) {
    return (
      <div>
        <ModuleHeader
          icon={<ChartIcon className="h-6 w-6" />}
          titulo="Analíticas"
          descripcion="Tendencia de visitas de la iglesia digital."
        />
        <EstadoVacio loading>Cargando analíticas…</EstadoVacio>
      </div>
    );
  }

  // Solo bloqueamos la pantalla cuando la tabla NO existe. Si existe pero está
  // vacía (total === 0), renderizamos el módulo completo con los KPIs y
  // gráficos en cero, encabezado por el banner de "Recolectando datos".
  if (d.sinTabla) {
    return (
      <div>
        <ModuleHeader
          icon={<ChartIcon className="h-6 w-6" />}
          titulo="Analíticas"
          descripcion="Tendencia de visitas de la iglesia digital."
        />
        <Card className="flex flex-col items-center py-16 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-blue-300">
            <ChartIcon className="h-8 w-8" />
          </span>
          <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
            Conecta la analítica
          </h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Crea la tabla page_views en Supabase y las visitas empezarán a
            registrarse solas.
          </p>
        </Card>
      </div>
    );
  }

  const maxN = Math.max(...d.dias.map((x) => x.n), 1);
  const maxPagina = d.paginas[0]?.n || 1;

  return (
    <div>
      <ModuleHeader
        icon={<ChartIcon className="h-6 w-6" />}
        titulo="Analíticas"
        descripcion="Tendencia de visitas de la iglesia digital."
      />

      {/* Aviso de estado inicial: tabla conectada pero aún sin visitas.
          Mismo lenguaje visual que el banner del Dashboard y de Impacto. */}
      {d.total === 0 && (
        <Card className="mb-6 flex items-center gap-4 border-blue-200 bg-linear-to-br from-blue-50 to-sky-50 dark:border-slate-700 dark:from-slate-800 dark:to-slate-800/60">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-300">
            <MegaphoneIcon className="h-6 w-6" />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              Recolectando datos…
            </p>
            <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
              ¡Comparte el enlace de la iglesia para ver las tendencias día a
              día!
            </p>
          </div>
        </Card>
      )}

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Visitas totales", valor: d.total, Icon: ChartIcon },
          { label: "Visitas únicas", valor: d.unicas, Icon: GridIcon, sub: "30 días" },
          { label: "Visitas hoy", valor: d.hoy, Icon: MegaphoneIcon },
        ].map((k) => (
          <Card key={k.label} className="p-5">
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
              {nf(k.valor)}
            </p>
            <p className="mt-0.5 text-sm font-medium text-slate-500 dark:text-slate-400">
              {k.label}
            </p>
          </Card>
        ))}
      </div>

      {/* Gráfico de 7 días (Tailwind puro) */}
      <Card className="mt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Visitas · últimos 7 días
          </h3>
          <span className="text-xs text-slate-400">
            {nf(d.dias.reduce((a, x) => a + x.n, 0))} en total
          </span>
        </div>

        <div className="mt-6 flex h-48 items-end gap-2 sm:gap-4">
          {d.dias.map((dia) => (
            <div
              key={dia.key}
              className="flex h-full flex-1 flex-col items-center justify-end gap-2"
            >
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {dia.n > 0 ? nf(dia.n) : ""}
              </span>
              <div
                className="w-full rounded-t-lg bg-linear-to-t from-blue-600 to-sky-400 transition-all"
                style={{ height: `${(dia.n / maxN) * 100}%`, minHeight: dia.n > 0 ? "6px" : "2px" }}
                title={`${nf(dia.n)} visitas`}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-2 sm:gap-4">
          {d.dias.map((dia) => (
            <span
              key={dia.key}
              className="flex-1 text-center text-xs capitalize text-slate-400"
            >
              {dia.label.replace(".", "")}
            </span>
          ))}
        </div>
      </Card>

      {/* Páginas más vistas */}
      <Card className="mt-6">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Páginas más vistas
        </h3>
        {d.paginas.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">
            Aún sin datos en los últimos 30 días.
          </p>
        ) : (
        <ul className="mt-4 space-y-3">
          {d.paginas.map((p) => (
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
    </div>
  );
}
