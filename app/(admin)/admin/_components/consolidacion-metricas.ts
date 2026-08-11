/**
 * Lógica pura (sin React ni Supabase) de salud pastoral de la Consolidación:
 * detección de casos "en riesgo / estancado" y métricas del embudo.
 * Se aísla aquí para poder probarla con Vitest de forma determinista
 * (recibe `ahoraMs` en vez de leer el reloj).
 */

import type { EstadoConsolidacion } from "./consolidacion-actions";

/** Días sin actividad a partir de los cuales un caso se considera estancado. */
export const DIAS_RIESGO = 7;

/** Estados que exigen seguimiento activo (donde aplica la alerta de riesgo). */
export const ESTADOS_SEGUIMIENTO: EstadoConsolidacion[] = ["recibido", "contactado"];

const DIA_MS = 86_400_000;

export type ItemMetrica = {
  estado: EstadoConsolidacion;
  responsable_id: string | null;
  creado_at: string | null;
  actualizado_at: string | null;
  fecha_recepcion: string | null;
};

const parse = (s: string | null | undefined): number | null => {
  if (!s) return null;
  const ms = Date.parse(s.length === 10 ? `${s}T00:00:00` : s);
  return Number.isNaN(ms) ? null : ms;
};

/**
 * Momento (ms) de la última actividad = la más reciente entre la última nota,
 * la creación y la fecha de recepción. Si no hay ninguna fecha válida devuelve
 * `null`.
 */
export function msUltimaActividad(
  item: ItemMetrica,
  ultimaNotaISO: string | null,
): number | null {
  const cands = [
    parse(ultimaNotaISO),
    parse(item.creado_at),
    parse(item.fecha_recepcion),
  ].filter((n): n is number => n !== null);
  return cands.length ? Math.max(...cands) : null;
}

/** Días transcurridos desde la última actividad (0 si no hay fecha base). */
export function diasSinActividad(
  item: ItemMetrica,
  ultimaNotaISO: string | null,
  ahoraMs: number,
): number {
  const base = msUltimaActividad(item, ultimaNotaISO);
  if (base === null) return 0;
  return Math.max(0, Math.floor((ahoraMs - base) / DIA_MS));
}

/**
 * Un caso está "en riesgo / estancado" si sigue en un estado de seguimiento
 * (recibido/contactado) y lleva más de DIAS_RIESGO sin actividad (sin nota
 * nueva ni movimiento).
 */
export function enRiesgo(
  item: ItemMetrica,
  ultimaNotaISO: string | null,
  ahoraMs: number,
): boolean {
  if (!ESTADOS_SEGUIMIENTO.includes(item.estado)) return false;
  return diasSinActividad(item, ultimaNotaISO, ahoraMs) > DIAS_RIESGO;
}

export type MetricasSalud = {
  embudo: Record<EstadoConsolidacion, number>;
  totalPipeline: number; // total sin descartados (no_continua)
  integrados: number;
  conversion: number; // % integrados / totalPipeline
  tiempoPromedioDias: number | null; // aprox. recepción → integrado
  carga: { responsable_id: string | null; activos: number }[]; // desc
};

const EMBUDO_VACIO = (): Record<EstadoConsolidacion, number> => ({
  recibido: 0,
  contactado: 0,
  en_proceso: 0,
  integrado: 0,
  no_continua: 0,
});

/** Métricas agregadas de salud pastoral. */
export function metricasSalud(items: ItemMetrica[]): MetricasSalud {
  const embudo = EMBUDO_VACIO();
  for (const i of items) embudo[i.estado] = (embudo[i.estado] ?? 0) + 1;

  const integrados = embudo.integrado;
  const totalPipeline = items.length - embudo.no_continua;
  const conversion = totalPipeline
    ? Math.round((integrados / totalPipeline) * 100)
    : 0;

  // Tiempo aprox. de integración: actualizado_at - creado_at de los integrados.
  const tiempos = items
    .filter((i) => i.estado === "integrado")
    .map((i) => {
      const ini = parse(i.creado_at);
      const fin = parse(i.actualizado_at);
      return ini !== null && fin !== null ? (fin - ini) / DIA_MS : null;
    })
    .filter((n): n is number => n !== null && n >= 0);
  const tiempoPromedioDias = tiempos.length
    ? Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length)
    : null;

  // Carga activa por responsable (excluye integrados y descartados).
  const activos = items.filter(
    (i) => i.estado !== "integrado" && i.estado !== "no_continua",
  );
  const map = new Map<string | null, number>();
  for (const a of activos) map.set(a.responsable_id, (map.get(a.responsable_id) ?? 0) + 1);
  const carga = [...map.entries()]
    .map(([responsable_id, act]) => ({ responsable_id, activos: act }))
    .sort((a, b) => b.activos - a.activos);

  return { embudo, totalPipeline, integrados, conversion, tiempoPromedioDias, carga };
}
