import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { createServerSupabase } from "@/src/utils/supabase-server";

// Roles autorizados (M3). Subir: contenido (admin/pastor) + comprobantes de
// tesorería (tesorero). Listar la biblioteca de medios: solo admin/pastor.
const ROLES_SUBIDA = ["admin", "pastor", "tesorero"];
const ROLES_LISTADO = ["admin", "pastor"];

/**
 * Resuelve el rol del usuario autenticado mediante public.mi_rol()
 * (respeta el flag `activo`). Devuelve null si no hay sesión.
 */
async function rolDe(
  supabase: Awaited<ReturnType<typeof createServerSupabase>>,
): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.rpc("mi_rol");
  return (data as string | null) ?? "";
}

/**
 * Route Handler seguro para la Admin API de Cloudinary.
 * Las credenciales (API_KEY / API_SECRET) viven SOLO en el servidor.
 * Requiere una sesión de administrador válida.
 *
 *   GET   /api/cloudinary  → { usage, resources }
 *   POST  /api/cloudinary  → sube una imagen (firmada) → { secure_url, public_id }
 */
export async function GET() {
  // 1) Verificar sesión + rol (solo admin/pastor listan la biblioteca).
  const supabase = await createServerSupabase();
  const rol = await rolDe(supabase);
  if (rol === null) {
    return NextResponse.json({ error: "no-auth" }, { status: 401 });
  }
  if (!ROLES_LISTADO.includes(rol)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // 2) Credenciales
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud || !key || !secret) {
    return NextResponse.json(
      { error: "missing-credentials" },
      { status: 500 },
    );
  }

  const auth = "Basic " + Buffer.from(`${key}:${secret}`).toString("base64");
  const base = `https://api.cloudinary.com/v1_1/${cloud}`;

  try {
    const [usageRes, resRes] = await Promise.all([
      fetch(`${base}/usage`, {
        headers: { Authorization: auth },
        cache: "no-store",
      }),
      fetch(`${base}/resources/image?max_results=40`, {
        headers: { Authorization: auth },
        cache: "no-store",
      }),
    ]);

    const usageJson = usageRes.ok ? await usageRes.json() : null;
    const resJson = resRes.ok ? await resRes.json() : { resources: [] };

    // Normaliza lo que consume el panel (defensivo ante cambios de esquema).
    const usage = usageJson
      ? {
          plan: usageJson.plan ?? null,
          recursos: usageJson.resources ?? usageJson.objects?.usage ?? null,
          almacenamientoBytes: usageJson.storage?.usage ?? null,
          almacenamientoLimite: usageJson.storage?.limit ?? null,
          creditosUsados: usageJson.credits?.used_percent ?? null,
          anchoBanda: usageJson.bandwidth?.usage ?? null,
        }
      : null;

    const resources = (resJson.resources ?? []).map(
      (r: {
        public_id: string;
        secure_url: string;
        bytes: number;
        format: string;
        width: number;
        height: number;
        created_at: string;
      }) => ({
        publicId: r.public_id,
        url: r.secure_url,
        bytes: r.bytes,
        format: r.format,
        width: r.width,
        height: r.height,
        createdAt: r.created_at,
      }),
    );

    return NextResponse.json({ usage, resources });
  } catch {
    return NextResponse.json({ error: "fetch-failed" }, { status: 502 });
  }
}

/**
 * Sube una imagen a Cloudinary con FIRMA server-side (usa API_KEY/API_SECRET,
 * sin exponer un upload preset público). Devuelve la URL segura para guardarla
 * en `imagen_url`.
 */
export async function POST(req: Request) {
  // 1) Verificar sesión + rol (admin/pastor/tesorero pueden subir).
  const supabase = await createServerSupabase();
  const rol = await rolDe(supabase);
  if (rol === null) {
    return NextResponse.json({ error: "no-auth" }, { status: 401 });
  }
  if (!ROLES_SUBIDA.includes(rol)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // 2) Credenciales.
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud || !key || !secret) {
    return NextResponse.json({ error: "missing-credentials" }, { status: 500 });
  }

  // 3) Archivo.
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "no-file" }, { status: 400 });
  }
  // Formatos permitidos: imágenes comunes + PDF (boletas/facturas).
  const TIPOS_OK = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
    "application/pdf",
  ];
  const esImagen = file.type.startsWith("image/");
  if (!TIPOS_OK.includes(file.type)) {
    return NextResponse.json({ error: "tipo-no-permitido" }, { status: 400 });
  }

  // Carpeta destino: se sanea y siempre queda dentro de "Mieles/".
  const carpetaCruda = String(form.get("folder") ?? "").replace(
    /[^a-zA-Z0-9/_-]/g,
    "",
  );
  const folder = carpetaCruda.startsWith("Mieles/")
    ? carpetaCruda
    : `Mieles/${carpetaCruda || "uploads"}`;

  // Las imágenes se optimizan AL SUBIR (incoming transformation): máx. 1600px
  // conservando proporción + calidad automática, reduciendo el peso en la nube.
  // Los PDF se suben como recurso "raw" (sin transformar): así quedan siempre
  // entregables, sin depender de la opción de entrega de PDF de la cuenta.
  // Comprobantes de tesorería: se suben como recurso PRIVADO (type=authenticated),
  // solo entregable por URL firmada. El flag lo envía ComprobanteUploader; el
  // contenido público (noticias/eventos) se sube normal (type=upload).
  const privado = String(form.get("privado") ?? "") === "1";
  const resourceType = esImagen ? "image" : "raw";
  const transformation = esImagen ? "c_limit,w_1600,h_1600,q_auto:good" : null;
  const tipoEntrega = privado ? "authenticated" : null;

  // 4) Firma: SHA-1 de los parámetros (orden alfabético) + api_secret.
  const timestamp = Math.round(Date.now() / 1000);
  const paramsAFirmar: Record<string, string> = {
    folder,
    timestamp: String(timestamp),
  };
  if (transformation) paramsAFirmar.transformation = transformation;
  if (tipoEntrega) paramsAFirmar.type = tipoEntrega;
  const toSign = Object.keys(paramsAFirmar)
    .sort()
    .map((k) => `${k}=${paramsAFirmar[k]}`)
    .join("&");
  const signature = createHash("sha1")
    .update(toSign + secret)
    .digest("hex");

  const upload = new FormData();
  upload.append("file", file);
  upload.append("api_key", key);
  upload.append("timestamp", String(timestamp));
  upload.append("folder", folder);
  if (transformation) upload.append("transformation", transformation);
  if (tipoEntrega) upload.append("type", tipoEntrega);
  upload.append("signature", signature);

  // 5) Subida a Cloudinary.
  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloud}/${resourceType}/upload`,
      { method: "POST", body: upload },
    );
    const json = await res.json();
    if (!res.ok || !json.secure_url) {
      return NextResponse.json(
        { error: json?.error?.message ?? "upload-failed" },
        { status: 502 },
      );
    }
    return NextResponse.json({
      secure_url: json.secure_url,
      public_id: json.public_id,
      resource_type: json.resource_type,
      format: json.format ?? null,
      version: json.version ?? null,
      type: json.type ?? "upload",
    });
  } catch {
    return NextResponse.json({ error: "fetch-failed" }, { status: 502 });
  }
}
