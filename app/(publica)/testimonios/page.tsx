import type { Metadata } from "next";
import PageHeader from "@/app/components/PageHeader";
import LiteYouTube from "@/app/components/LiteYouTube";
import { PlayIcon } from "@/app/components/icons";
import { getTestimonios } from "@/src/utils/publico";

export const metadata: Metadata = {
  title: {
    absolute: "Testimonios de Fe y Bendición | Centro Cristiano Mieles",
  },
  description:
    "Testimonios de fe y bendición en video: historias reales del poder de Dios transformando vidas en el Centro Cristiano Mieles, Quilicura.",
  alternates: { canonical: "/testimonios" },
};

export const revalidate = 30;

export default async function TestimoniosPage() {
  const testimonios = await getTestimonios();

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
                {/* Reproductor de video (carga al hacer clic + registra play) */}
                <div className="relative aspect-video bg-blue-950">
                  <LiteYouTube id={t.youtubeId} title={t.titulo} />
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
