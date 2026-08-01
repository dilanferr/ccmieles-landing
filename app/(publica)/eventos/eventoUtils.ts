import type { EventoPublico } from "@/src/utils/publico";

export const CAT_LABEL: Record<string, string> = {
  culto: "Culto",
  administrativo: "Administrativo",
  conferencia: "Conferencia",
  evangelizacion: "Evangelización",
  dorcas: "Dorcas",
  jovenes: "Jóvenes",
  "escuela-dominical": "Escuela Dominical",
  coro: "Coro",
  vigilia: "Vigilia",
  campana: "Campaña",
  especial: "Especial",
};

export const TONO: Record<string, string> = {
  green: "bg-emerald-500 text-white",
  sky: "bg-sky-500 text-white",
  blue: "bg-blue-600 text-white",
  slate: "bg-slate-400 text-white",
};

/** Datos temporales mínimos de un evento para calcular su estado. */
export type EventoTiempo = {
  fecha: string;
  hora: string | null;
  horaFin: string | null;
};

const MS_DIA = 86400000;

/**
 * Fecha y hora ACTUAL en la zona horaria de Chile (America/Santiago).
 * Devuelve strings comparables ("YYYY-MM-DD" y "HH:MM") para que el corte
 * "ya pasó" sea correcto tanto en el servidor (UTC) como en el cliente,
 * y se ajuste solo al horario de verano. hourCycle h23 → horas 00–23.
 */
function ahoraEnChile(): { fecha: string; hhmm: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const g = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return {
    fecha: `${g("year")}-${g("month")}-${g("day")}`,
    hhmm: `${g("hour")}:${g("minute")}`,
  };
}

function diasEntre(desde: string, hasta: string): number {
  const a = new Date(`${desde}T00:00:00`).getTime();
  const b = new Date(`${hasta}T00:00:00`).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.round((b - a) / MS_DIA);
}

/** Margen de gracia para eventos sin hora de término (cultos ~2 h). */
const MARGEN_MIN = 120;

/**
 * Suma minutos a un reloj de pared (fecha + "HH:MM") y devuelve el resultado
 * como "YYYY-MM-DDTHH:MM", avanzando la fecha si cruza la medianoche.
 * Se usa UTC solo como aritmética de calendario, sin significado horario.
 */
function sumarMinutos(fecha: string, hhmm: string, min: number): string {
  const d = new Date(`${fecha}T${hhmm}:00Z`);
  if (Number.isNaN(d.getTime())) return `${fecha}T${hhmm}`;
  d.setUTCMinutes(d.getUTCMinutes() + min);
  return d.toISOString().slice(0, 16);
}

/**
 * ¿El evento ya terminó? Compara la fecha + hora del evento con el momento
 * actual en Chile. Usa la hora de término si existe; si solo hay hora de
 * inicio, le da un margen de gracia de 2 horas (el evento sigue vigente
 * mientras dura); si no hay hora, se considera pasado al terminar el día.
 */
export function esPasado(ev: EventoTiempo | string): boolean {
  // Retrocompatibilidad: si llega solo la fecha (string), sin hora.
  const e: EventoTiempo =
    typeof ev === "string" ? { fecha: ev, hora: null, horaFin: null } : ev;
  if (!e.fecha) return false;

  let fin: string;
  if (e.horaFin) {
    fin = `${e.fecha}T${e.horaFin.slice(0, 5)}`;
  } else if (e.hora) {
    fin = sumarMinutos(e.fecha, e.hora.slice(0, 5), MARGEN_MIN);
  } else {
    fin = `${e.fecha}T23:59`;
  }

  const now = ahoraEnChile();
  return fin < `${now.fecha}T${now.hhmm}`;
}

/**
 * URL del botón "Cómo llegar". Se arma SOLA a partir de la dirección escrita
 * en el evento (campo Lugar): abre Google Maps con esa dirección. Si el evento
 * trae un enlace de mapa explícito (mapaUrl), lo respeta; y si no hay dirección
 * ni enlace, cae al mapa general de la iglesia.
 */
export function comoLlegarUrl(
  ev: { mapaUrl?: string | null; lugar?: string | null },
  fallback: string,
): string {
  if (ev.mapaUrl) return ev.mapaUrl;
  const dir = ev.lugar?.trim();
  if (dir) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dir)}`;
  }
  return fallback;
}

/**
 * Combina fecha (YYYY-MM-DD) + hora en un ISO válido "YYYY-MM-DDTHH:MM:SS".
 * Normaliza la hora venga como "HH:MM" o "HH:MM:SS" (Supabase la entrega con
 * segundos), evitando cadenas malformadas como "…T19:00:00:00" → NaN.
 */
export function fechaHoraISO(fecha: string, hora: string | null): string {
  const t = (hora || "18:00").slice(0, 8); // "HH:MM" o "HH:MM:SS"
  const hhmmss = t.length === 5 ? `${t}:00` : t; // asegura los segundos
  return `${fecha}T${hhmmss}`;
}

/** Estado + color del evento, calculado en tiempo real (hora de Chile). */
export function estadoDe(ev: EventoTiempo | string) {
  const e: EventoTiempo =
    typeof ev === "string" ? { fecha: ev, hora: null, horaFin: null } : ev;
  if (!e.fecha) return { label: "Programado", tone: "blue" };
  if (esPasado(e)) return { label: "Finalizado", tone: "slate" };
  const diff = diasEntre(ahoraEnChile().fecha, e.fecha);
  if (diff <= 0) return { label: "Hoy", tone: "green" };
  if (diff <= 7) return { label: "Esta semana", tone: "sky" };
  return { label: "Próximamente", tone: "blue" };
}

export function fechaLarga(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function diaMes(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return {
    dia: d.toLocaleDateString("es-CL", { day: "2-digit" }),
    mes: d
      .toLocaleDateString("es-CL", { month: "short" })
      .replace(".", "")
      .toUpperCase(),
  };
}

function calStr(fecha: string, hhmm: string | null) {
  const [Y, M, D] = fecha.split("-");
  const [h, m] = (hhmm || "18:00").split(":");
  return `${Y}${M}${D}T${h}${m}00`;
}

export function googleCal(ev: EventoPublico) {
  const start = calStr(ev.fecha, ev.hora);
  const [h, m] = (ev.hora || "18:00").split(":");
  const end = ev.horaFin
    ? calStr(ev.fecha, ev.horaFin)
    : calStr(ev.fecha, `${String((Number(h) + 2) % 24).padStart(2, "0")}:${m}`);
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: ev.nombre,
    dates: `${start}/${end}`,
    details: ev.descripcion ?? "",
    location: ev.lugar ?? "",
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}
