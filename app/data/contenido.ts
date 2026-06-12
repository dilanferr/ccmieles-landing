/**
 * Codificación/decodificación de contenido para encajar en el esquema EXISTENTE
 * de Supabase sin alterar las tablas.
 *
 * Mapeo de columnas:
 *
 *  ── noticias (avisos y testimonios) ──────────────────────────────
 *   tipo = 'aviso'        → titulo, autor, imagen_url = OFICIO,  contenido = descripción
 *   tipo = 'testimonio'   → titulo,        imagen_url = YOUTUBE_ID,
 *                           contenido = descripción + [Bendecidos]: a, b, c
 *
 *  ── eventos ──────────────────────────────────────────────────────
 *   nombre, fecha_evento, hora_inicio, lugar,
 *   descripcion = descripción + [Afiche]: <url de Cloudinary>
 *   (la tabla no tiene columna de imagen, así que el afiche viaja
 *    embebido en la descripción y se separa al mostrarlo)
 */

const MARK_BENDECIDOS = "\n\n[Bendecidos]: ";
const MARK_AFICHE = "\n\n[Afiche]: ";

/* ---------- Testimonios: bendecidos dentro de "contenido" ---------- */

export function encodeTestimonio(descripcion: string, bendecidos: string[]): string {
  const limpia = descripcion.trim();
  return bendecidos.length
    ? `${limpia}${MARK_BENDECIDOS}${bendecidos.join(", ")}`
    : limpia;
}

export function decodeTestimonio(contenido: string): {
  descripcion: string;
  bendecidos: string[];
} {
  const i = contenido.indexOf(MARK_BENDECIDOS);
  if (i === -1) return { descripcion: contenido.trim(), bendecidos: [] };
  return {
    descripcion: contenido.slice(0, i).trim(),
    bendecidos: contenido
      .slice(i + MARK_BENDECIDOS.length)
      .split(",")
      .map((b) => b.trim())
      .filter(Boolean),
  };
}

/* ---------- Eventos: afiche dentro de "descripcion" ---------- */

export function encodeEventoDescripcion(descripcion: string, afiche?: string | null): string {
  const limpia = descripcion.trim();
  return afiche ? `${limpia}${MARK_AFICHE}${afiche}` : limpia;
}

export function decodeEventoDescripcion(raw: string): {
  descripcion: string;
  afiche: string | null;
} {
  const i = raw.indexOf(MARK_AFICHE);
  if (i === -1) return { descripcion: raw.trim(), afiche: null };
  return {
    descripcion: raw.slice(0, i).trim(),
    afiche: raw.slice(i + MARK_AFICHE.length).trim() || null,
  };
}
