import { createPublicClient } from "@/src/utils/supabase-public";

/**
 * Endpoint de tracking de primera parte.
 * Registra vistas de página y eventos de interacción, enriqueciendo con la
 * geolocalización que aporta Vercel (país/ciudad) — sin guardar IP ni PII.
 * Si las tablas no existen, falla en silencio (no rompe el sitio).
 *
 *   POST /api/track
 *   body: { type: "page_view" | "event", path, session_id, referrer?, device?, name?, meta?, duration_ms? }
 */
// Filtro de bots/crawlers: aunque Googlebot renderiza JS y puede disparar el
// tracker, no queremos que infle "visitas" ni "Directo" y sesgue las métricas.
const BOT_RE =
  /bot|crawl|spider|slurp|googlebot|bingbot|bingpreview|yandex|baidu|duckduck|applebot|petalbot|facebookexternalhit|whatsapp|telegram|discordbot|linkedinbot|pinterest|embedly|preview|headless|lighthouse|pingdom|monitor|curl|wget|python-requests|axios|gtmetrix|semrush|ahrefs|dataprovider/i;

export async function POST(req: Request) {
  try {
    const h = req.headers;
    const ua = h.get("user-agent") || "";
    if (!ua || BOT_RE.test(ua)) {
      // Descartamos silenciosamente el tráfico no humano.
      return new Response(null, { status: 204 });
    }
    const country = h.get("x-vercel-ip-country") || null;
    const rawCity = h.get("x-vercel-ip-city");
    const city = rawCity ? decodeURIComponent(rawCity) : null;

    const body = await req.json().catch(() => null);
    if (!body || !body.path) {
      return new Response(null, { status: 204 });
    }

    const supabase = createPublicClient();
    const base = {
      path: String(body.path).slice(0, 200),
      session_id: body.session_id ? String(body.session_id).slice(0, 80) : null,
      referrer: body.referrer ? String(body.referrer).slice(0, 300) : null,
      device: body.device ? String(body.device).slice(0, 20) : null,
      country,
      city,
    };

    if (body.type === "event" && body.name) {
      await supabase.from("page_events").insert({
        ...base,
        name: String(body.name).slice(0, 60),
        meta: body.meta && typeof body.meta === "object" ? body.meta : {},
      });
    } else {
      await supabase.from("page_views").insert({
        ...base,
        duration_ms:
          typeof body.duration_ms === "number" ? body.duration_ms : null,
      });
    }

    return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 204 });
  }
}
