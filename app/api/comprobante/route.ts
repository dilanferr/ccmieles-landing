import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { createServerSupabase } from "@/src/utils/supabase-server";

/**
 * Proxy GATEADO de comprobantes privados de Tesorería (M4).
 * Los comprobantes se suben a Cloudinary como recurso privado
 * (type=authenticated) y SOLO se entregan a través de este endpoint, que:
 *   1) valida sesión + rol (admin/pastor/tesorero),
 *   2) firma una URL de descarga privada de corta duración (estilo upload,
 *      la misma firma ya probada en /api/cloudinary), y
 *   3) hace stream de los bytes con el content-type correcto.
 * El navegador nunca ve la URL de Cloudinary y el asset no es público.
 *
 *   GET /api/comprobante?rt=raw|image&id=<public_id>&f=<formato?>
 */

const ROLES_OK = ["admin", "pastor", "tesorero"];

const MIME_IMG: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
};

export async function GET(req: Request) {
  // 1) Sesión + rol.
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "no-auth" }, { status: 401 });
  const { data: rol } = await supabase.rpc("mi_rol");
  if (!ROLES_OK.includes((rol as string | null) ?? "")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // 2) Credenciales.
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud || !key || !secret) {
    return NextResponse.json({ error: "missing-credentials" }, { status: 500 });
  }

  // 3) Parámetros del comprobante.
  const url = new URL(req.url);
  const rt = url.searchParams.get("rt"); // image | raw
  const id = url.searchParams.get("id"); // public_id (incluye carpeta)
  const format = (url.searchParams.get("f") || "").toLowerCase();
  // El public_id siempre vive dentro de Mieles/ (evita pedir assets ajenos).
  if ((rt !== "image" && rt !== "raw") || !id || !id.startsWith("Mieles/")) {
    return NextResponse.json({ error: "bad-request" }, { status: 400 });
  }

  // 4) URL de descarga privada, firmada y de corta duración (60 s).
  //    Misma firma que las subidas: SHA-1(hex) de params ordenados + secret.
  const timestamp = Math.round(Date.now() / 1000);
  const params: Record<string, string> = {
    expires_at: String(timestamp + 60),
    public_id: id,
    timestamp: String(timestamp),
    type: "authenticated",
  };
  if (rt === "image" && format) params.format = format;
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  const signature = createHash("sha1")
    .update(toSign + secret)
    .digest("hex");

  const qs = new URLSearchParams({ ...params, api_key: key, signature });
  const dlUrl = `https://api.cloudinary.com/v1_1/${cloud}/${rt}/download?${qs.toString()}`;

  // 5) Stream con content-type propio (inline) — el endpoint de descarga de
  //    Cloudinary fuerza attachment/octet-stream; aquí reponemos el tipo real.
  const contentType =
    rt === "raw" ? "application/pdf" : (MIME_IMG[format] ?? "image/jpeg");

  try {
    const upstream = await fetch(dlUrl, { cache: "no-store" });
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: "fetch-failed" }, { status: 502 });
    }
    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": "inline",
        "Cache-Control": "private, no-store, max-age=0",
      },
    });
  } catch {
    return NextResponse.json({ error: "fetch-failed" }, { status: 502 });
  }
}
