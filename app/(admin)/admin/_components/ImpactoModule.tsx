"use client";

import { useEffect, useState } from "react";
import { Card, EstadoVacio, ModuleHeader } from "./ui";
import {
  HeartIcon,
  PrayingHands,
  MapPinIcon,
  CalendarIcon,
  PlayIcon,
  MegaphoneIcon,
  ChurchIcon,
} from "@/app/components/icons";
import type { Icon } from "@/app/components/icons";

type Data = {
  sinTabla?: boolean;
  sinDatos?: boolean;
  days: number;
  resumen: {
    alcanzadas: number;
    visitas: number;
    peticiones: number;
    peticionesPendientes: number;
    planificaron: number;
    testimonioPlays: number;
    nosotros: number;
    oracion: number;
    eventos: number;
    testimonios: number;
    tiempoPromedioMs: number;
  };
  indice: {
    score: number;
    nivel: string;
    deltaVisitas: number | null;
    factores: { label: string; peso: number; valor: number; n: number }[];
  };
  ministerios: { label: string; n: number }[];
  fuentes: { fuente: string; n: number; pct: number }[];
  motivos: { motivo: string; n: number }[];
  serie: { key: string; label: string; n: number }[];
  insights: string[];
  recomendaciones: string[];
};

const nf = (n: number) => n.toLocaleString("es-CL");
function fmtTiempo(ms: number) {
  if (!ms) return "—";
  const s = Math.round(ms / 1000);
  return s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;
}

const NIVEL_COLOR: Record<string, string> = {
  Excelente: "text-emerald-600 dark:text-emerald-400",
  Bueno: "text-blue-600 dark:text-blue-400",
  "En crecimiento": "text-amber-500",
  "Necesita atención": "text-red-500",
};

export default function ImpactoModule() {
  const [days, setDays] = useState(30);
  const [d, setD] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/impacto?days=${days}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => setD(json))
      .catch(() => setD(null))
      .finally(() => setLoading(false));
  }, [days]);

  const header = (
    <ModuleHeader
      icon={<HeartIcon className="h-6 w-6" />}
      titulo="Impacto del Ministerio"
      descripcion="Cómo interactúan las personas con la plataforma digital."
      accion={
        <div className="flex gap-1 rounded-full border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
          {[7, 30, 90].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setDays(v)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                days === v
                  ? "bg-blue-600 text-white"
                  : "text-slate-500 hover:text-blue-700 dark:text-slate-400"
              }`}
            >
              {v}d
            </button>
          ))}
        </div>
      }
    />
  );

  if (loading || !d) {
    return (
      <div>
        {header}
        <EstadoVacio loading>Calculando impacto…</EstadoVacio>
      </div>
    );
  }

  // Solo bloqueamos cuando las tablas NO existen (42P01). Si existen pero
  // están vacías (sinDatos), renderizamos el panel completo con los KPIs en 0
  // y un aviso amable de "Recolectando datos".
  if (d.sinTabla) {
    return (
      <div>
        {header}
        <Card className="flex flex-col items-center py-16 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-blue-300">
            <HeartIcon className="h-8 w-8" />
          </span>
          <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
            Activa el tracking
          </h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Crea las tablas page_views y page_events en Supabase. Desde ese
            momento se registra el comportamiento real de los visitantes.
          </p>
        </Card>
      </div>
    );
  }

  const r = d.resumen;
  const maxSerie = Math.max(...d.serie.map((x) => x.n), 1);
  const maxMin = d.ministerios[0]?.n || 1;
  const maxMotivo = d.motivos[0]?.n || 1;

  const cards: { Icon: Icon; label: string; valor: string; sub?: string }[] = [
    { Icon: HeartIcon, label: "Personas alcanzadas", valor: nf(r.alcanzadas), sub: `${nf(r.visitas)} visitas` },
    { Icon: PrayingHands, label: "Peticiones de oración", valor: nf(r.peticiones), sub: `${nf(r.peticionesPendientes)} pendientes` },
    { Icon: MapPinIcon, label: "Planificaron visita", valor: nf(r.planificaron) },
    { Icon: CalendarIcon, label: "Interés en eventos", valor: nf(r.eventos) },
    { Icon: PlayIcon, label: "Testimonios (reprod.)", valor: nf(r.testimonioPlays), sub: `${nf(r.testimonios)} visitas` },
    { Icon: ChurchIcon, label: "Visitas a Nosotros", valor: nf(r.nosotros) },
    { Icon: MegaphoneIcon, label: "Buscaron oración", valor: nf(r.oracion) },
    { Icon: HeartIcon, label: "Tiempo promedio", valor: fmtTiempo(r.tiempoPromedioMs) },
  ];

  return (
    <div>
      {header}

      {/* Aviso: tablas creadas pero aún sin registros */}
      {d.sinDatos && (
        <Card className="mb-6 flex items-center gap-4 border-blue-200 bg-linear-to-br from-blue-50 to-sky-50 dark:border-slate-700 dark:from-slate-800 dark:to-slate-800/60">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-300">
            <MegaphoneIcon className="h-6 w-6" />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              Recolectando datos…
            </p>
            <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
              El tracking está activo y aún no hay visitas en este período.
              ¡Comparte el enlace de la iglesia y el impacto empezará a
              reflejarse aquí!
            </p>
          </div>
        </Card>
      )}

      {/* Índice de impacto */}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="relative grid h-24 w-24 shrink-0 place-items-center">
              <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" strokeWidth="10" className="stroke-slate-100 dark:stroke-slate-800" />
                <circle
                  cx="50" cy="50" r="42" fill="none" strokeWidth="10" strokeLinecap="round"
                  className="stroke-blue-600 transition-all duration-700"
                  strokeDasharray={`${(d.indice.score / 100) * 264} 264`}
                />
              </svg>
              <span className="absolute text-2xl font-bold text-slate-900 dark:text-white">
                {d.indice.score}
              </span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                Índice de impacto digital
              </p>
              <p className={`text-2xl font-bold ${NIVEL_COLOR[d.indice.nivel] ?? ""}`}>
                {d.indice.nivel}
              </p>
              {d.indice.deltaVisitas != null && (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {d.indice.deltaVisitas >= 0 ? "▲" : "▼"}{" "}
                  {Math.abs(d.indice.deltaVisitas)}% en visitas vs. período anterior
                </p>
              )}
            </div>
          </div>
          <p className="max-w-xs text-xs leading-relaxed text-slate-400">
            Mide el rendimiento de la plataforma digital, no la obra de Dios. Se
            calcula ponderando alcance, permanencia, acciones y contenido.
          </p>
        </div>

        <details className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
          <summary className="cursor-pointer text-sm font-semibold text-blue-700 dark:text-blue-400">
            ¿Cómo se calcula?
          </summary>
          <ul className="mt-3 space-y-2">
            {d.indice.factores.map((f) => (
              <li key={f.label} className="flex items-center gap-3 text-xs">
                <span className="w-44 shrink-0 text-slate-500 dark:text-slate-400">
                  {f.label} · {Math.round(f.peso * 100)}%
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full rounded-full bg-blue-500" style={{ width: `${f.n * 100}%` }} />
                </div>
                <span className="w-10 text-right text-slate-400">{nf(f.valor)}</span>
              </li>
            ))}
          </ul>
        </details>
      </Card>

      {/* Resumen */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <Card key={i} className="p-5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-300">
              <c.Icon className="h-5 w-5" />
            </span>
            <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {c.valor}
            </p>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {c.label}
            </p>
            {c.sub && <p className="mt-0.5 text-xs text-slate-400">{c.sub}</p>}
          </Card>
        ))}
      </div>

      {/* Tendencia */}
      <Card className="mt-6">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Tendencia de visitas
        </h3>
        <div className="mt-6 flex h-40 items-end gap-1.5">
          {d.serie.map((x) => (
            <div key={x.key} className="flex h-full flex-1 flex-col justify-end" title={`${x.label}: ${nf(x.n)}`}>
              <div
                className="w-full rounded-t bg-linear-to-t from-blue-600 to-sky-400"
                style={{ height: `${(x.n / maxSerie) * 100}%`, minHeight: x.n ? "4px" : "1px" }}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Ministerios + Motivos */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Ministerios con más interés
          </h3>
          {d.ministerios.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">Aún sin datos.</p>
          ) : (
            <Ranking items={d.ministerios.map((m) => ({ label: m.label, n: m.n }))} max={maxMin} />
          )}
        </Card>
        <Card>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Motivos de oración más frecuentes
          </h3>
          {d.motivos.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">Aún sin peticiones.</p>
          ) : (
            <Ranking items={d.motivos.map((m) => ({ label: m.motivo, n: m.n }))} max={maxMotivo} />
          )}
        </Card>
      </div>

      {/* Fuentes */}
      <Card className="mt-6">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Origen del tráfico
        </h3>
        <ul className="mt-4 space-y-2.5">
          {d.fuentes.map((f) => (
            <li key={f.fuente} className="flex items-center gap-3 text-sm">
              <span className="w-24 shrink-0 truncate font-medium text-slate-700 dark:text-slate-300">
                {f.fuente}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full rounded-full bg-blue-500" style={{ width: `${f.pct}%` }} />
              </div>
              <span className="w-10 shrink-0 text-right text-slate-400">{f.pct}%</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Insights + Recomendaciones */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ListaCard titulo="💡 Insights automáticos" items={d.insights} tono="blue" />
        <ListaCard titulo="✅ Recomendaciones" items={d.recomendaciones} tono="emerald" />
      </div>
    </div>
  );
}

function Ranking({ items, max }: { items: { label: string; n: number }[]; max: number }) {
  return (
    <ul className="mt-4 space-y-3">
      {items.map((it) => (
        <li key={it.label}>
          <div className="flex items-center justify-between text-sm">
            <span className="truncate font-medium text-slate-700 dark:text-slate-300">
              {it.label}
            </span>
            <span className="text-slate-400">{it.n.toLocaleString("es-CL")}</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="h-full rounded-full bg-linear-to-r from-blue-600 to-sky-500" style={{ width: `${(it.n / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function ListaCard({
  titulo,
  items,
  tono,
}: {
  titulo: string;
  items: string[];
  tono: "blue" | "emerald";
}) {
  const dot = tono === "blue" ? "bg-blue-500" : "bg-emerald-500";
  return (
    <Card>
      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{titulo}</h3>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">Sin observaciones por ahora.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((t, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot}`} />
              {t}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}