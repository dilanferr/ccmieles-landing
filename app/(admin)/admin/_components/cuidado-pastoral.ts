/**
 * Lógica pura (sin React ni Supabase) del Cuidado Pastoral: cálculo de
 * cumpleaños y aniversarios de bautismo a partir de una fecha `YYYY-MM-DD`,
 * ignorando el año para el "próximo" y manejando el cruce de fin de año.
 * Recibe `hoyMs` como parámetro (no lee el reloj) para poder testearse.
 * Todo el cálculo es en UTC para ser determinista, independiente de zona.
 */

const DIA_MS = 86_400_000;

export type Rango = "hoy" | "semana" | "mes";

export type Ocasion = {
  dias: number; // días hasta el próximo aniversario (0 = hoy)
  anios: number | null; // años que cumple en ese próximo aniversario
  mesActual: boolean; // el aniversario cae en el mes calendario actual
};

/** Parte una fecha ISO `YYYY-MM-DD` en {anio, mes(1-12), dia}. */
function partes(fechaISO: string): { anio: number; mes: number; dia: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(fechaISO);
  if (!m) return null;
  const anio = Number(m[1]);
  const mes = Number(m[2]);
  const dia = Number(m[3]);
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return null;
  return { anio, mes, dia };
}

/**
 * Calcula la próxima ocurrencia (ignorando el año) de la fecha dada respecto a
 * `hoyMs`. Devuelve días hasta ella (0 = hoy), los años que se cumplen y si cae
 * en el mes calendario actual. `null` si la fecha es inválida/ausente.
 */
export function calcularOcasion(
  fechaISO: string | null | undefined,
  hoyMs: number,
): Ocasion | null {
  if (!fechaISO) return null;
  const p = partes(fechaISO);
  if (!p) return null;

  const hoy = new Date(hoyMs);
  const hy = hoy.getUTCFullYear();
  const hoyMid = Date.UTC(hy, hoy.getUTCMonth(), hoy.getUTCDate());

  // Próxima ocurrencia este año; si ya pasó, el año siguiente.
  let anioObj = hy;
  let prox = Date.UTC(hy, p.mes - 1, p.dia);
  if (prox < hoyMid) {
    anioObj = hy + 1;
    prox = Date.UTC(anioObj, p.mes - 1, p.dia);
  }

  const dias = Math.round((prox - hoyMid) / DIA_MS);
  const anios = anioObj - p.anio; // años que cumple en esa fecha
  const mesActual = p.mes - 1 === hoy.getUTCMonth();

  return { dias, anios: Number.isFinite(anios) ? anios : null, mesActual };
}

/** ¿La ocasión cae dentro del rango pedido? */
export function enRango(oc: Ocasion, rango: Rango): boolean {
  switch (rango) {
    case "hoy":
      return oc.dias === 0;
    case "semana":
      return oc.dias >= 0 && oc.dias <= 7;
    case "mes":
      return oc.mesActual;
  }
}

/** Etiqueta legible de cuánto falta. */
export function etiquetaProximo(dias: number): string {
  if (dias === 0) return "¡Hoy!";
  if (dias === 1) return "Mañana";
  return `en ${dias} días`;
}
