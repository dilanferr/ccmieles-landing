import type { Metadata } from "next";
import PageHeader from "@/app/components/PageHeader";
import { getClasificados } from "@/src/utils/publico";
import { MegaphoneIcon } from "@/app/components/icons";

export const metadata: Metadata = {
  title: "Comunidad",
  description:
    "Diario mural de avisos clasificados de los hermanos del Centro Cristiano Mieles.",
  alternates: { canonical: "/comunidad" },
};

// Revalida el contenido publicado desde el panel (ISR + revalidatePath).
export const revalidate = 30;

export default async function ComunidadPage() {
  const avisos = await getClasificados();

  return (
    <>
      <PageHeader
        eyebrow="Vida Comunitaria"
        titulo="Comunidad"
        descripcion="Un espacio para apoyarnos como familia: servicios y oficios que ofrecen los hermanos de la congregación."
      />

      {/* ============ AVISOS CLASIFICADOS ============ */}
      <section className="bg-background py-20 sm:py-24">
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

          {avisos.length === 0 ? (
            <div className="mt-12 flex flex-col items-center rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-sky-50 text-blue-600">
                <MegaphoneIcon className="h-8 w-8" />
              </span>
              <h3 className="mt-5 text-xl font-bold text-slate-900">
                Aún no hay avisos publicados
              </h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                Acércate al Departamento de Comunicación Digital para publicar el
                tuyo.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {avisos.map((a) => (
                  <article
                    key={a.id}
                    className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-600/10"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {a.categoria}
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
                      <p className="text-xs font-medium text-slate-500">
                        {a.autor}
                      </p>
                    </div>
                  </article>
                ))}
              </div>

              <p className="mt-8 rounded-2xl bg-slate-50 px-5 py-4 text-sm leading-relaxed text-slate-500">
                ¿Ofreces un servicio o buscas trabajo? Acércate al Departamento
                de Comunicación Digital para publicar tu aviso en el diario
                mural.
              </p>
            </>
          )}
        </div>
      </section>
    </>
  );
}
