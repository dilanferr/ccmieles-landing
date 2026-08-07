import { NextResponse } from "next/server";
import { createPublicClient } from "@/src/utils/supabase-public";
import { MOTIVOS_ORACION } from "@/app/data/iglesia";

/**
 * Recepción de peticiones de oración del formulario público (M2 · anti-spam).
 * El envío pasa por aquí (no por un insert anónimo directo) para poder validar
 * server-side: honeypot, tiempo mínimo de llenado, saneado de longitudes y un
 * rate-limit best-effort. Luego inserta con el cliente anónimo (la RLS permite
 * el insert público). No expone datos ni requiere sesión.
 *
 *   POST /api/peticion  body: { nombre, apellido, motivo, descripcion, website, t }
 */

// Rate-limit best-effort EN MEMORIA (por instancia serverless). No es una
// garantía dura entre instancias — para eso haría falta un store compartido
// (p. ej. Upstash Redis) — pero frena floods triviales sin infra adicional.
const HITS = new Map<string, number[]>();
const VENTANA_MS = 60_000;
const MAX_POR_VENTANA = 5;

function limitado(ip: string): boolean {
  const ahora = Date.now();
  const previos = (HITS.get(ip) ?? []).filter((t) => ahora - t < VENTANA_MS);
  previos.push(ahora);
  HITS.set(ip, previos);
  return previos.length > MAX_POR_VENTANA;
}

const cap = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "bad-request" }, { status: 400 });

  // 1) Honeypot: campo trampa oculto. Si viene lleno, es un bot → éxito falso
  //    (no revelamos la trampa para no ayudar al atacante a evadirla).
  if (cap(body.website, 100) !== "") {
    return NextResponse.json({ ok: true });
  }

  // 2) Timing: llenar el formulario en <3 s (o dejarlo >2 h) es sospechoso.
  const t0 = Number(body.t);
  const transcurrido = Number.isFinite(t0) && t0 > 0 ? Date.now() - t0 : 0;
  if (transcurrido < 3000 || transcurrido > 2 * 60 * 60 * 1000) {
    return NextResponse.json({ ok: true }); // descarte silencioso
  }

  // 3) Rate-limit best-effort por IP.
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anon";
  if (limitado(ip)) {
    return NextResponse.json({ error: "rate-limited" }, { status: 429 });
  }

  // 4) Validación + saneado de longitudes.
  const nombre = cap(body.nombre, 80);
  const apellido = cap(body.apellido, 80);
  const motivo = cap(body.motivo, 80);
  const descripcion = cap(body.descripcion, 2000);
  if (!nombre || !apellido || !descripcion) {
    return NextResponse.json({ error: "campos-incompletos" }, { status: 400 });
  }
  if (!(MOTIVOS_ORACION as readonly string[]).includes(motivo)) {
    return NextResponse.json({ error: "motivo-invalido" }, { status: 400 });
  }

  // 5) Insert (cliente anónimo; la RLS permite el insert público).
  try {
    const supabase = createPublicClient();
    const { error } = await supabase.from("peticiones_oracion").insert({
      nombre,
      apellido,
      motivo,
      descripcion,
      leido: false,
    });
    if (error) {
      return NextResponse.json({ error: "insert-failed" }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "insert-failed" }, { status: 502 });
  }
}
