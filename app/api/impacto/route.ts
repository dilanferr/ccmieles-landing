import { NextResponse } from "next/server";
import { createServerSupabase } from "@/src/utils/supabase-server";

const nf = (n: number) => Math.round(n);

function fuenteDe(ref: string | null): string {
  if (!ref) return "Directo";
  try {
    const host = new URL(ref).hostname.replace("www.", "");
    if (host.includes("google")) return "Google";
    if (host.includes("facebook") || host.includes("fb.")) return "Facebook";
    if (host.includes("instagram")) return "Instagram";
    if (host.includes("whatsapp") || host.includes("wa.me")) return "WhatsApp";
    if (host.includes("youtube") || host.includes("youtu.be")) return "YouTube";
    if (host.includes("bing")) return "Bing";
    if (host.includes("t.co") || host.includes("twitter") || host.includes("x.com"))
      return "X";
    return host;
  } catch {
    return "Directo";
  }
}

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

export async function GET(req: Request) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "no-auth" }, { status: 401 });

  const url = new URL(req.url);
  const daysRaw = Number(url.searchParams.get("days") ?? "30");
  const days = [7, 30, 90].includes(daysRaw) ? daysRaw : 30;
  const now = Date.now();
  const desde = new Date(now - days * 864e5).toISOString();
  const desdePrev = new Date(now - 2 * days * 864e5).toISOString();

  // --- page_views (detecta si el tracking está sembrado) ---
  const pvRes = await supabase
    .from("page_views")
    .select("path, session_id, referrer, country, city, creado_at")
    .gte("creado_at", desde)
    .limit(20000);

  // Solo tratamos el módulo como "sin tabla" cuando Postgres dice
  // EXPLÍCITAMENTE que la relación no existe (42P01 = undefined_table).
  // Una tabla vacía NO es un error (devuelve data: []), y cualquier otro
  // error (RLS, permisos, red) no debe bloquear el panel: seguimos con [].
  if (pvRes.error?.code === "42P01") {
    return NextResponse.json({ sinTabla: true });
  }
  if (pvRes.error) {
    console.error("[impacto] error consultando page_views:", pvRes.error);
  }
  const pv = pvRes.data ?? [];

  // --- page_events ---
  const peRes = await supabase
    .from("page_events")
    .select("name, meta, path")
    .gte("creado_at", desde)
    .limit(20000);
  const pe = peRes.error ? [] : (peRes.data ?? []);

  // --- peticiones ---
  const petRes = await supabase
    .from("peticiones_oracion")
    .select("motivo, leido");
  const pet = petRes.error ? [] : (petRes.data ?? []);

  // ---------- Agregaciones ----------
  const sesiones = new Set<string>();
  const porPagina: Record<string, number> = {};
  const fuentes: Record<string, number> = {};
  const ciudades: Record<string, number> = {};
  const serieMap: Record<string, number> = {};
  for (const r of pv) {
    if (r.session_id) sesiones.add(r.session_id as string);
    const p = r.path as string;
    porPagina[p] = (porPagina[p] ?? 0) + 1;
    const f = fuenteDe(r.referrer as string | null);
    fuentes[f] = (fuentes[f] ?? 0) + 1;
    if (r.city) ciudades[r.city as string] = (ciudades[r.city as string] ?? 0) + 1;
    const k = (r.creado_at as string).slice(0, 10);
    serieMap[k] = (serieMap[k] ?? 0) + 1;
  }

  const eventoCount = (name: string) => pe.filter((e) => e.name === name).length;
  const duraciones = pe
    .filter((e) => e.name === "duration")
    .map((e) => Number((e.meta as { ms?: number })?.ms ?? 0))
    .filter((n) => n > 0 && n < 30 * 60 * 1000);
  const tiempoPromedioMs = duraciones.length
    ? duraciones.reduce((a, b) => a + b, 0) / duraciones.length
    : 0;

  const alcanzadas = sesiones.size;
  const planificaron = eventoCount("visit_plan_click");
  const testimonioPlays = eventoCount("testimonio_play");

  const ministerios = Object.entries(porPagina)
    .filter(([p]) => LABEL_MIN[p] || p.startsWith("/grupos/"))
    .map(([p, n]) => ({ label: LABEL_MIN[p] ?? p.replace("/grupos/", ""), n }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 6);

  const totalFuentes = Object.values(fuentes).reduce((a, b) => a + b, 0) || 1;
  const fuentesArr = Object.entries(fuentes)
    .map(([fuente, n]) => ({ fuente, n, pct: Math.round((n / totalFuentes) * 100) }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 8);

  const motivos: Record<string, number> = {};
  for (const p of pet) {
    const m = (p.motivo as string) || "Otros";
    motivos[m] = (motivos[m] ?? 0) + 1;
  }
  const motivosArr = Object.entries(motivos)
    .map(([motivo, n]) => ({ motivo, n }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 6);
  const peticionesPendientes = pet.filter((p) => !p.leido).length;

  const ciudadesArr = Object.entries(ciudades)
    .map(([ciudad, n]) => ({ ciudad, n }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 6);

  // Serie diaria
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
    { label: "Acción (oración + visitas)", peso: 0.2, valor: pet.length + planificaron, n: norm(pet.length + planificaron, 20 * escala) },
    { label: "Testimonios reproducidos", peso: 0.15, valor: testimonioPlays, n: norm(testimonioPlays, 40 * escala) },
    { label: "Interés en eventos", peso: 0.1, valor: porPagina["/eventos"] ?? 0, n: norm(porPagina["/eventos"] ?? 0, 120 * escala) },
    { label: "Interés en ministerios", peso: 0.1, valor: ministerios.reduce((a, m) => a + m.n, 0), n: norm(ministerios.reduce((a, m) => a + m.n, 0), 300 * escala) },
    { label: "Contenido compartido", peso: 0.05, valor: eventoCount("share"), n: norm(eventoCount("share"), 20 * escala) },
  ];
  const score = Math.round(100 * factores.reduce((a, f) => a + f.peso * f.n, 0));
  const nivel =
    score >= 80 ? "Excelente" : score >= 60 ? "Bueno" : score >= 40 ? "En crecimiento" : "Necesita atención";

  // Delta de visitas vs. período anterior
  const prevRes = await supabase
    .from("page_views")
    .select("*", { count: "exact", head: true })
    .gte("creado_at", desdePrev)
    .lt("creado_at", desde);
  const prevVisitas = prevRes.error ? null : prevRes.count ?? 0;
  const deltaVisitas =
    prevVisitas && prevVisitas > 0
      ? Math.round(((pv.length - prevVisitas) / prevVisitas) * 100)
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
    sinDatos: pv.length === 0,
    days,
    resumen: {
      alcanzadas,
      visitas: pv.length,
      peticiones: pet.length,
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
