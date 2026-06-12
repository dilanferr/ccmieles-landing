import type { Metadata } from "next";
import PageHeader from "@/app/components/PageHeader";
import { PlayIcon } from "@/app/components/icons";
import { ENTREVISTAS } from "@/app/data/iglesia";

export const metadata: Metadata = {
  title: "Entrevistas",
  description:
    "Entrevistas a líderes y hermanos del Centro Cristiano Mieles: conversaciones de fe, visión y servicio.",
};

export default function EntrevistasPage() {
  return (
    <>
      <PageHeader
        eyebrow="Conversaciones"
        titulo="Entrevistas"
        descripcion="Charlas cercanas con líderes y hermanos de la congregación, compartiendo su fe, su llamado y su testimonio."
      />

      <section className="bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            {ENTREVISTAS.map((e) => (
              <article
                key={e.id}
                className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-600/10"
              >
                {/* Reproductor de video */}
                <div className="relative aspect-video bg-blue-950">
                  <iframe
                    className="absolute inset-0 h-full w-full"
                    src={`https://www.youtube-nocookie.com/embed/${e.youtubeId}`}
                    title={e.titulo}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                {/* Contenido */}
                <div className="flex flex-1 flex-col p-7">
                  <div className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    <PlayIcon className="h-3 w-3" />
                    Entrevista
                  </div>
                  <h2 className="mt-4 text-xl font-bold text-slate-900">
                    {e.titulo}
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-blue-700">
                    {e.entrevistado}
                    {e.cargo && (
                      <span className="font-medium text-slate-500"> · {e.cargo}</span>
                    )}
                  </p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
                    {e.descripcion}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
