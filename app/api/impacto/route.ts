import { NextResponse } from "next/server";
import { createServerSupabase } from "@/src/utils/supabase-server";

/**
 * Estadísticas de impacto (M7). Toda la agregación pesada de
 * page_views/page_events/peticiones ocurre en la BD vía el RPC
 * fn_get_impacto_stats(dias) — ya no se traen miles de filas a memoria.
 * Aquí solo se ensambla el payload (heurísticas de índice, insights y
 * recomendaciones), manteniendo EXACTAMENTE la misma forma que consume
 * ImpactoModule.tsx. Gateado a admin/pastor.
 */

const nf = (n: number) => Math.round(n);

const LABEL_MIN: Record<string, string> = {
  "/grupos/cuerpo-ministerial": "Cuerpo Ministerial",
  "/grupos/ministerio-femenino": "Grupo Dorcas",
  "/grupos/coro-juventud": "Coro y Juventud",
  "/grupos/escuela-musica": "Escuela de Música",
  "/grupos/evangelizacion": "Evangelización",
  "/grupos/escuela-dominical": "Escuela Dominical",
  "/grupos/comunicacion-digital": "Comunicación Digital",
  "/departamento-visitas": "Visita a Hogares",
  "/oracion-peticion": "Oración y Petición",
};

type ImpactoStats = {
  visitas: number;
  alcanzadas: number;
  tiempo_promedio_ms: number;
  planificaron: number;
  testimonio_plays: number;
  shares: number;
  prev_visitas: number;
  peticiones_total: number;
  peticiones_pendientes: number;
  paginas: { path: string; n: number }[];
  fuentes: { fuente: string; n: number }[];
  ciudades: { ciudad: string; n: number }[];
  serie: { key: string; n: number }[];
  motivos: { motivo: string; n: number }[];
};

const VACIO: ImpactoStats = {
  visitas: 0,
  alcanzadas: 0,
  tiempo_promedio_ms: 0,
  planificaron: 0,
  testimonio_plays: 0,
  shares: 0,
  prev_visitas: 0,
  peticiones_total: 0,
  peticiones_pendientes: 0,
  paginas: [],
  fuentes: [],
  ciudades: [],
  serie: [],
  motivos: [],
};

export async function GET(req: Request) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "no-auth" }, { status: 401 });

  // Gating por rol: solo admin/pastor (los datos incluyen peticiones).
  const { data: rol } = await supabase.rpc("mi_rol");
  if (!["admin", "pastor"].includes((rol as string | null) ?? "")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const daysRaw = Number(url.searchParams.get("days") ?? "30");
  const days = [7, 30, 90].includes(daysRaw) ? daysRaw : 30;

  // --- Agregación en la BD (una sola llamada) ---
  const { data, error } = await supabase.rpc("fn_get_impacto_stats", {
    dias: days,
  });

  // Sin tabla/función todavía → el panel muestra el estado inicial.
  if (
    error?.code === "42P01" ||
    /does not exist|undefined_table|undefined_function/i.test(
      error?.message ?? "",
    )
  ) {
    return NextResponse.json({ sinTabla: true });
  }
  if (error) console.error("[impacto] RPC error:", error);

  const s: ImpactoStats = {
    ...VACIO,
    ...((data as Partial<ImpactoStats>) ?? {}),
  };

  const now = Date.now();
  const porPagina: Record<string, number> = Object.fromEntries(
    (s.paginas ?? []).map((p) => [p.path, p.n]),
  );

  const visitas = s.visitas;
  const alcanzadas = s.alcanzadas;
  const tiempoPromedioMs = Number(s.tiempo_promedio_ms) || 0;
  const planificaron = s.planificaron;
  const testimonioPlays = s.testimonio_plays;
  const shares = s.shares;
  const petTotal = s.peticiones_total;
  const peticionesPendientes = s.peticiones_pendientes;

  const ministerios = Object.entries(porPagina)
    .filter(([p]) => LABEL_MIN[p] || p.startsWith("/grupos/"))
    .map(([p, n]) => ({ label: LABEL_MIN[p] ?? p.replace("/grupos/", ""), n }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 6);

  const totalFuentes = (s.fuentes ?? []).reduce((a, f) => a + f.n, 0) || 1;
  const fuentesArr = (s.fuentes ?? [])
    .map((f) => ({
      fuente: f.fuente,
      n: f.n,
      pct: Math.round((f.n / totalFuentes) * 100),
    }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 8);

  const motivosArr = (s.motivos ?? [])
    .map((m) => ({ motivo: m.motivo, n: m.n }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 6);

  const ciudadesArr = (s.ciudades ?? [])
    .map((c) => ({ ciudad: c.ciudad, n: c.n }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 6);

  // Serie diaria (labels/keys en JS; los conteos vienen del RPC).
  const serieMap: Record<string, number> = Object.fromEntries(
    (s.serie ?? []).map((d) => [d.key, d.n]),
  );
  const serie = Array.from({ length: Math.min(days, 30) }, (_, i) => {
    const dt = new Date(now - (Math.min(days, 30) - 1 - i) * 864e5);
    const key = dt.toISOString().slice(0, 10);
    return {
      key,
      label: new Date(`${key}T12:00:00Z`).toLocaleDateString("es-CL", {
        day: "2-digit",
        month: "short",
      }),
      n: serieMap[key] ?? 0,
    };
  });

  // ---------- Índice de impacto (heurística transparente) ----------
  const norm = (x: number, cap: number) => Math.min(1, cap > 0 ? x / cap : 0);
  const escala = days / 30;
  const factores = [
    { label: "Personas alcanzadas", peso: 0.25, valor: alcanzadas, n: norm(alcanzadas, 400 * escala) },
    { label: "Tiempo de permanencia", peso: 0.15, valor: Math.round(tiempoPromedioMs / 1000), n: norm(tiempoPromedioMs, 90000) },
    { label: "Acción (oración + visitas)", peso: 0.2, valor: petTotal + planificaron, n: norm(petTotal + planificaron, 20 * escala) },
    { label: "Testimonios reproducidos", peso: 0.15, valor: testimonioPlays, n: norm(testimonioPlays, 40 * escala) },
    { label: "Interés en eventos", peso: 0.1, valor: porPagina["/eventos"] ?? 0, n: norm(porPagina["/eventos"] ?? 0, 120 * escala) },
    { label: "Interés en ministerios", peso: 0.1, valor: ministerios.reduce((a, m) => a + m.n, 0), n: norm(ministerios.reduce((a, m) => a + m.n, 0), 300 * escala) },
    { label: "Contenido compartido", peso: 0.05, valor: shares, n: norm(shares, 20 * escala) },
  ];
  const score = Math.round(100 * factores.reduce((a, f) => a + f.peso * f.n, 0));
  const nivel =
    score >= 80 ? "Excelente" : score >= 60 ? "Bueno" : score >= 40 ? "En crecimiento" : "Necesita atención";

  const prevVisitas = s.prev_visitas;
  const deltaVisitas =
    prevVisitas && prevVisitas > 0
      ? Math.round(((visitas - prevVisitas) / prevVisitas) * 100)
      : null;

  // ---------- Insights (heurística) ----------
  const insights: string[] = [];
  if (deltaVisitas != null) {
    insights.push(
      deltaVisitas >= 0
        ? `Las visitas ${deltaVisitas === 0 ? "se mantuvieron" : `subieron un ${deltaVisitas}%`} respecto al período anterior.`
        : `Las visitas bajaron un ${Math.abs(deltaVisitas)}% respecto al período anterior.`,
    );
  }
  if (ministerios[0])
    insights.push(`El ministerio con más interés fue ${ministerios[0].label}.`);
  if (fuentesArr[0])
    insights.push(`La mayor parte del tráfico llegó desde ${fuentesArr[0].fuente} (${fuentesArr[0].pct}%).`);
  if (tiempoPromedioMs > 0)
    insights.push(`Las personas permanecen en promedio ${Math.round(tiempoPromedioMs / 1000)} segundos por página.`);

  // ---------- Recomendaciones (reglas) ----------
  const recomendaciones: string[] = [];
  if (testimonioPlays === 0)
    recomendaciones.push("Comparte un testimonio en video: aún no registran reproducciones.");
  if ((porPagina["/eventos"] ?? 0) < 5 * escala)
    recomendaciones.push("Publica y difunde un evento: la sección tiene poco tráfico.");
  if (tiempoPromedioMs > 0 && tiempoPromedioMs < 25000)
    recomendaciones.push("Refuerza el contenido de las páginas más visitadas para retener más tiempo.");
  const wa = fuentesArr.find((f) => f.fuente === "WhatsApp");
  if (!wa || wa.pct < 10)
    recomendaciones.push("Comparte el enlace de la iglesia por WhatsApp para alcanzar más personas.");

  return NextResponse.json({
    sinTabla: false,
    sinDatos: visitas === 0,
    days,
    resumen: {
      alcanzadas,
      visitas,
      peticiones: petTotal,
      peticionesPendientes,
      planificaron,
      testimonioPlays,
      nosotros: porPagina["/nosotros"] ?? 0,
      oracion: porPagina["/oracion-peticion"] ?? 0,
      eventos: porPagina["/eventos"] ?? 0,
      testimonios: porPagina["/testimonios"] ?? 0,
      tiempoPromedioMs: nf(tiempoPromedioMs),
    },
    indice: { score, nivel, deltaVisitas, factores },
    ministerios,
    fuentes: fuentesArr,
    motivos: motivosArr,
    ciudades: ciudadesArr,
    serie,
    insights,
    recomendaciones,
  });
}
