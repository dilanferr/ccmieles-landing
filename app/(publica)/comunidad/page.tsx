import type { Metadata } from "next";
import PageHeader from "@/app/components/PageHeader";
import { AVISOS } from "@/app/data/iglesia";
import { createPublicClient } from "@/src/utils/supabase-public";

export const metadata: Metadata = {
  title: "Comunidad",
  description:
    "Diario mural de avisos clasificados de los hermanos del Centro Cristiano Mieles.",
};

// Revalida el contenido publicado desde el panel (ISR + revalidatePath).
export const revalidate = 30;

type AvisoView = {
  id: string;
  titulo: string;
  oficio: string;
  descripcion: string;
  autor: string;
};

type Noticia = {
  id: string | number;
  titulo: string | null;
  contenido: string | null;
  imagen_url: string | null;
  tipo: string | null;
  autor: string | null;
};

/** Lee los avisos desde 'noticias' (tipo='aviso'); si falla, usa los de ejemplo. */
async function cargarAvisos(): Promise<AvisoView[]> {
  const fallback: AvisoView[] = AVISOS.map((a) => ({
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
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) return fallback;

    return (data as Noticia[]).map((r) => ({
      id: String(r.id),
      titulo: r.titulo ?? "—",
      oficio: r.imagen_url ?? "Servicio",
      descripcion: r.contenido ?? "",
      autor: r.autor ?? "Hno. de la congregación",
    }));
  } catch {
    return fallback;
  }
}

export default async function ComunidadPage() {
  const avisos = await cargarAvisos();

  return (
    <>
      <PageHeader
        eyebrow="Vida Comunitaria"
        titulo="Comunidad"
        descripcion="Un espacio para apoyarnos como familia: servicios y oficios que ofrecen los hermanos de la congregación."
      />

      {/* ============ AVISOS CLASIFICADOS ============ */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
              Diario Mural
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Avisos Clasificados
            </h2>
            <p className="mt-3 max-w-2xl text-lg text-slate-600">
              Servicios y oficios que ofrecen los mismos hermanos de la
              congregación. ¡Apoyémonos unos a otros!
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {avisos.map((a) => (
              <article
                key={a.id}
                className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-600/10"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {a.oficio}
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">
                    Se ofrece
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">
                  {a.titulo}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                  {a.descripcion}
                </p>
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <p className="text-xs font-medium text-slate-500">{a.autor}</p>
                </div>
              </article>
            ))}
          </div>

          <p className="mt-8 rounded-2xl bg-slate-50 px-5 py-4 text-sm leading-relaxed text-slate-500">
            ¿Ofreces un servicio o buscas trabajo? Acércate al Departamento de
            Comunicación Digital para publicar tu aviso en el diario mural.
          </p>
        </div>
      </section>
    </>
  );
}
