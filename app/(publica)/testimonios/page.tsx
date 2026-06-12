import type { Metadata } from "next";
import PageHeader from "@/app/components/PageHeader";
import { PlayIcon } from "@/app/components/icons";
import { TESTIMONIOS } from "@/app/data/iglesia";
import { decodeTestimonio } from "@/app/data/contenido";
import { createPublicClient } from "@/src/utils/supabase-public";

export const metadata: Metadata = {
  title: "Testimonios",
  description:
    "Testimonios de fe en video: historias reales del poder de Dios en el Centro Cristiano Mieles.",
};

export const revalidate = 30;

type TestimonioView = {
  id: string;
  titulo: string;
  youtubeId: string;
  descripcion: string;
  bendecidos: string[];
};

type Noticia = {
  id: string | number;
  titulo: string | null;
  contenido: string | null;
  imagen_url: string | null;
  tipo: string | null;
};

async function cargarTestimonios(): Promise<TestimonioView[]> {
  const fallback: TestimonioView[] = TESTIMONIOS.map((t) => ({
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
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) return fallback;

    return (data as Noticia[]).map((r) => {
      const { descripcion, bendecidos } = decodeTestimonio(r.contenido ?? "");
      return {
        id: String(r.id),
        titulo: r.titulo ?? "—",
        youtubeId: r.imagen_url ?? "",
        descripcion,
        bendecidos,
      };
    });
  } catch {
    return fallback;
  }
}

export default async function TestimoniosPage() {
  const testimonios = await cargarTestimonios();

  return (
    <>
      <PageHeader
        eyebrow="Historias de fe"
        titulo="Testimonios"
        descripcion="El poder de Dios contado por quienes lo vivieron. Mira, escucha y sé edificado."
      />

      <section className="bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="space-y-12">
            {testimonios.map((t) => (
              <article
                key={t.id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:grid lg:grid-cols-2"
              >
                {/* Reproductor de video */}
                <div className="relative aspect-video bg-blue-950">
                  <iframe
                    className="absolute inset-0 h-full w-full"
                    src={`https://www.youtube-nocookie.com/embed/${t.youtubeId}`}
                    title={t.titulo}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                {/* Descripción */}
                <div className="flex flex-col justify-center p-8 sm:p-10">
                  <div className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    <PlayIcon className="h-3 w-3" />
                    Testimonio en video
                  </div>
                  <h2 className="mt-4 text-2xl font-bold text-slate-900">
                    {t.titulo}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {t.descripcion}
                  </p>

                  {t.bendecidos.length > 0 && (
                    <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Los bendecidos de este testimonio
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {t.bendecidos.map((b) => (
                          <span
                            key={b}
                            className="rounded-full border border-blue-100 bg-white px-3 py-1 text-sm font-medium text-blue-700"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
