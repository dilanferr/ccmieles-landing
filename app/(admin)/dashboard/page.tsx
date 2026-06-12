import { createServerSupabase } from "@/src/utils/supabase-server";
import DashboardClient from "../_components/DashboardClient";
import type { RecentItem } from "../_components/RecentList";
import type { Peticion } from "../_components/PeticionesPanel";

// El panel siempre se renderiza al momento (lee la sesión).
export const dynamic = "force-dynamic";

type Row = Record<string, unknown>;

/** Últimas noticias de un tipo dado ('aviso' | 'testimonio'). */
async function recientesNoticias(
  tipo: "aviso" | "testimonio",
  map: (row: Row) => RecentItem,
): Promise<RecentItem[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("noticias")
    .select("*")
    .eq("tipo", tipo)
    .order("created_at", { ascending: false })
    .limit(6);
  if (error || !data) return [];
  return (data as Row[]).map(map);
}

/** Últimos eventos. */
async function recientesEventos(): Promise<RecentItem[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("eventos")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(6);
  if (error || !data) return [];
  return (data as Row[]).map((r) => ({
    id: String(r.id),
    titulo: String(r.nombre ?? "—"),
    subtitulo: String(r.fecha_evento ?? ""),
  }));
}

/** Peticiones de oración: pendientes primero, luego por fecha. */
async function cargarPeticiones(): Promise<Peticion[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("peticiones_oracion")
    .select("id, created_at, nombre, apellido, motivo, descripcion, leido")
    .order("leido", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(100);
  if (error || !data) return [];
  return (data as Row[]).map((r) => ({
    id: String(r.id),
    created_at: String(r.created_at ?? ""),
    nombre: String(r.nombre ?? ""),
    apellido: String(r.apellido ?? ""),
    motivo: String(r.motivo ?? "Otro"),
    descripcion: String(r.descripcion ?? ""),
    leido: Boolean(r.leido),
  }));
}

export default async function DashboardPage() {
  const [avisos, testimonios, eventos, peticiones] = await Promise.all([
    recientesNoticias("aviso", (r) => ({
      id: String(r.id),
      titulo: String(r.titulo ?? "—"),
      subtitulo: `${r.imagen_url ?? ""} · ${r.autor ?? ""}`,
    })),
    recientesNoticias("testimonio", (r) => ({
      id: String(r.id),
      titulo: String(r.titulo ?? "—"),
      subtitulo: `Video: ${r.imagen_url ?? "—"}`,
    })),
    recientesEventos(),
    cargarPeticiones(),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Gestión de contenido
        </h1>
        <p className="mt-1 text-slate-500">
          Administra los avisos, testimonios y eventos del sitio sin tocar el
          código.
        </p>
      </div>

      <DashboardClient
        avisos={avisos}
        testimonios={testimonios}
        eventos={eventos}
        peticiones={peticiones}
      />
    </div>
  );
}
