import { cache } from "react";
import { createPublicClient } from "@/src/utils/supabase-public";
import { EVENTOS, AVISOS, TESTIMONIOS } from "@/app/data/iglesia";
import {
  decodeEventoDescripcion,
  decodeTestimonio,
} from "@/app/data/contenido";

/**
 * Lecturas públicas de contenido desde Supabase con RESPALDO a los arreglos
 * estáticos de `iglesia.ts`. Si la tabla está vacía o falla, el sitio nunca
 * se cae: renderiza el contenido de ejemplo. `cache` deduplica por render.
 */

/* ============ EVENTOS ============ */
export type EventoPublico = {
  id: string;
  nombre: string;
  descripcion: string;
  fecha: string; // ISO (YYYY-MM-DD)
  hora: string;
  horaFin: string | null;
  lugar: string;
  categoria: string;
  imagenUrl: string | null;
  mapaUrl: string | null;
  ministerio: string | null;
  predicador: string | null;
  destacado: boolean;
  slug: string | null;
};

// Selección con columnas nuevas; si aún no existen en la tabla, la query
// falla y se usa el respaldo estático (el sitio nunca se cae).
const COLS_EVENTOS =
  "id, nombre, descripcion, fecha_evento, hora_inicio, hora_fin, lugar, categoria, imagen_url, mapa_url, ministerio, predicador, destacado, slug, estado";
const COLS_EVENTOS_MIN =
  "id, nombre, descripcion, fecha_evento, hora_inicio, lugar";

export const getEventos = cache(async (): Promise<EventoPublico[]> => {
  const fallback: EventoPublico[] = EVENTOS.map((e) => ({
    id: e.id,
    nombre: e.nombre,
    descripcion: e.descripcion,
    fecha: e.fecha,
    hora: e.hora,
    horaFin: null,
    lugar: e.lugar,
    categoria: "especial",
    imagenUrl: null,
    mapaUrl: null,
    ministerio: null,
    predicador: null,
    destacado: Boolean(e.destacado),
    slug: null,
  }));

  try {
    const supabase = createPublicClient();
    // Intenta con el esquema enriquecido; si falla, cae al mínimo.
    const primary = await supabase
      .from("eventos")
      .select(COLS_EVENTOS)
      .order("fecha_evento", { ascending: true });
    let data = primary.data as Record<string, unknown>[] | null;
    let error = primary.error;
    if (error) {
      const min = await supabase
        .from("eventos")
        .select(COLS_EVENTOS_MIN)
        .order("fecha_evento", { ascending: true });
      data = min.data as Record<string, unknown>[] | null;
      error = min.error;
    }
    if (error || !data || data.length === 0) return fallback;

    return data
      .filter((r) => {
        const est = (r as { estado?: string }).estado;
        return !est || (est !== "borrador" && est !== "archivado");
      })
      .map((r) => {
        const row = r as Record<string, unknown>;
        const { descripcion, afiche } = decodeEventoDescripcion(
          (row.descripcion as string) ?? "",
        );
        const nombre = (row.nombre as string) ?? "Evento";
        return {
          id: String(row.id),
          nombre,
          descripcion,
          fecha: (row.fecha_evento as string) ?? "",
          hora: (row.hora_inicio as string) ?? "",
          horaFin: (row.hora_fin as string) ?? null,
          lugar: (row.lugar as string) ?? "",
          categoria: (row.categoria as string) ?? "especial",
          imagenUrl: (row.imagen_url as string) ?? afiche ?? null,
          mapaUrl: (row.mapa_url as string) ?? null,
          ministerio: (row.ministerio as string) ?? null,
          predicador: (row.predicador as string) ?? null,
          destacado:
            Boolean(row.destacado) || /aniversario/i.test(nombre),
          slug: (row.slug as string) ?? null,
        };
      });
  } catch {
    return fallback;
  }
});

/* ============ EVENTO INDIVIDUAL (por slug) ============ */
export type ProgramaItem = { hora: string; actividad: string };

export type EventoDetalle = EventoPublico & {
  versiculo: string | null;
  programa: ProgramaItem[];
  galeria: string[];
};

const COLS_EVENTO_DETALLE =
  "id, nombre, descripcion, fecha_evento, hora_inicio, hora_fin, lugar, categoria, imagen_url, mapa_url, ministerio, predicador, destacado, slug, estado, versiculo, programa, galeria";

/** Normaliza el JSONB `programa` a una lista tipada [{hora,actividad}]. */
function parsePrograma(raw: unknown): ProgramaItem[] {
  let arr: unknown = raw;
  if (typeof raw === "string") {
    try {
      arr = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(arr)) return [];
  return arr
    .map((it) => {
      const o = (it ?? {}) as Record<string, unknown>;
      return {
        hora: String(o.hora ?? o.time ?? "").trim(),
        actividad: String(o.actividad ?? o.titulo ?? o.detalle ?? "").trim(),
      };
    })
    .filter((p) => p.actividad.length > 0);
}

/** Normaliza `galeria` (text[] de Supabase o string separada por comas). */
function parseGaleria(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  if (typeof raw === "string" && raw.trim()) {
    return raw
      .replace(/^\{|\}$/g, "")
      .split(",")
      .map((s) => s.replace(/^"|"$/g, "").trim())
      .filter(Boolean);
  }
  return [];
}

export const getEventoBySlug = cache(
  async (slug: string): Promise<EventoDetalle | null> => {
    // Respaldo estático: reutiliza la lista pública si Supabase no responde.
    const buildFallback = async (): Promise<EventoDetalle | null> => {
      const lista = await getEventos();
      const ev = lista.find((e) => e.slug === slug);
      if (!ev) return null;
      return { ...ev, versiculo: null, programa: [], galeria: [] };
    };

    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from("eventos")
        .select(COLS_EVENTO_DETALLE)
        .eq("slug", slug)
        .maybeSingle();

      if (error || !data) return buildFallback();

      const row = data as Record<string, unknown>;
      const est = (row.estado as string) ?? "";
      if (est === "borrador" || est === "archivado") return null;

      const { descripcion, afiche } = decodeEventoDescripcion(
        (row.descripcion as string) ?? "",
      );
      const nombre = (row.nombre as string) ?? "Evento";
      return {
        id: String(row.id),
        nombre,
        descripcion,
        fecha: (row.fecha_evento as string) ?? "",
        hora: (row.hora_inicio as string) ?? "",
        horaFin: (row.hora_fin as string) ?? null,
        lugar: (row.lugar as string) ?? "",
        categoria: (row.categoria as string) ?? "especial",
        imagenUrl: (row.imagen_url as string) ?? afiche ?? null,
        mapaUrl: (row.mapa_url as string) ?? null,
        ministerio: (row.ministerio as string) ?? null,
        predicador: (row.predicador as string) ?? null,
        destacado: Boolean(row.destacado) || /aniversario/i.test(nombre),
        slug: (row.slug as string) ?? slug,
        versiculo: (row.versiculo as string) ?? null,
        programa: parsePrograma(row.programa),
        galeria: parseGaleria(row.galeria),
      };
    } catch {
      return buildFallback();
    }
  },
);

/* ============ AVISOS (noticias tipo='aviso') ============ */
export type AvisoPublico = {
  id: string;
  titulo: string;
  oficio: string;
  descripcion: string;
  autor: string;
};

export const getAvisos = cache(async (): Promise<AvisoPublico[]> => {
  const fallback: AvisoPublico[] = AVISOS.map((a) => ({
    id: a.id,
    titulo: a.titulo,
    oficio: a.oficio,
    descripcion: a.descripcion,
    autor: a.autor,
  }));

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("noticias")
      .select("id, titulo, contenido, imagen_url, tipo, autor")
      .eq("tipo", "aviso")
      .order("id", { ascending: false });

    if (error || !data || data.length === 0) return fallback;

    return data.map((r) => ({
      id: String(r.id),
      titulo: (r.titulo as string) ?? "—",
      oficio: (r.imagen_url as string) ?? "Servicio",
      descripcion: (r.contenido as string) ?? "",
      autor: (r.autor as string) ?? "Hno. de la congregación",
    }));
  } catch {
    return fallback;
  }
});

/* ============ CLASIFICADOS (diario mural — tabla propia) ============ */
export type ClasificadoPublico = {
  id: string;
  categoria: string;
  titulo: string;
  descripcion: string;
  autor: string;
};

/**
 * Avisos del diario mural, leídos de la tabla `clasificados`.
 * A diferencia del resto, NO tiene respaldo estático: si la tabla está vacía
 * (o aún no existe), devuelve [] para que la página muestre su estado vacío.
 */
export const getClasificados = cache(
  async (): Promise<ClasificadoPublico[]> => {
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from("clasificados")
        .select("id, categoria, titulo, descripcion, autor")
        .order("creado_at", { ascending: false });

      if (error || !data) return [];

      return data.map((r) => ({
        id: String(r.id),
        categoria: (r.categoria as string) ?? "Servicio",
        titulo: (r.titulo as string) ?? "—",
        descripcion: (r.descripcion as string) ?? "",
        autor: (r.autor as string) ?? "Hno. de la congregación",
      }));
    } catch {
      return [];
    }
  },
);

/* ============ TESTIMONIOS (noticias tipo='testimonio') ============ */
export type TestimonioPublico = {
  id: string;
  titulo: string;
  youtubeId: string;
  descripcion: string;
  bendecidos: string[];
};

export const getTestimonios = cache(async (): Promise<TestimonioPublico[]> => {
  const fallback: TestimonioPublico[] = TESTIMONIOS.map((t) => ({
    id: t.id,
    titulo: t.titulo,
    youtubeId: t.youtubeId,
    descripcion: t.descripcion,
    bendecidos: t.bendecidos,
  }));

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("noticias")
      .select("id, titulo, contenido, imagen_url, tipo")
      .eq("tipo", "testimonio")
      .order("id", { ascending: false });

    if (error || !data || data.length === 0) return fallback;

    return data.map((r) => {
      const { descripcion, bendecidos } = decodeTestimonio(
        (r.contenido as string) ?? "",
      );
      return {
        id: String(r.id),
        titulo: (r.titulo as string) ?? "Testimonio",
        youtubeId: (r.imagen_url as string) ?? "",
        descripcion,
        bendecidos,
      };
    });
  } catch {
    return fallback;
  }
});
