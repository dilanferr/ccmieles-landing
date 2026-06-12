import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/app/components/PageHeader";
import { MusicIcon, CalendarIcon } from "@/app/components/icons";
import { GRUPOS, getGrupo, type Persona } from "@/app/data/iglesia";

type Params = { grupo: string };

// Prerenderiza una página estática por cada grupo.
export function generateStaticParams(): Params[] {
  return GRUPOS.map((g) => ({ grupo: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { grupo } = await params;
  const data = getGrupo(grupo);
  if (!data) return { title: "Grupo no encontrado" };
  return {
    title: data.titulo,
    description: data.descripcion,
  };
}

/** Iniciales del nombre, ignorando el tratamiento (Pastor, Obispo, etc.). */
function iniciales(nombre: string) {
  return nombre
    .replace(
      /^(Obispo|Pastora|Pastor|Diaconisa|Diácono|Hermano|Hermana|Hno\.|Hna\.|Profesor)\s+/i,
      "",
    )
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function IntegranteCard({ persona }: { persona: Persona }) {
  return (
    <article className="group flex flex-col items-center rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-600/10">
      <div className="relative h-28 w-28 overflow-hidden rounded-full bg-linear-to-br from-blue-700 to-sky-500 shadow-lg shadow-blue-600/20 ring-4 ring-white">
        {persona.foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={persona.foto}
            alt={persona.nombre}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="grid h-full w-full place-items-center text-2xl font-bold text-white">
            {iniciales(persona.nombre)}
          </span>
        )}
      </div>
      <h3 className="mt-5 text-base font-bold leading-snug text-slate-900">
        {persona.nombre}
      </h3>
      <p className="mt-1.5 inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-blue-700">
        {persona.cargo}
      </p>
    </article>
  );
}

export default async function GrupoPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { grupo } = await params;
  const data = getGrupo(grupo);
  if (!data) notFound();

  return (
    <>
      <PageHeader
        eyebrow="Grupos y Ministerios"
        titulo={data.titulo}
        descripcion={data.descripcion}
      />

      {/* Navegación entre grupos */}
      <div className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-2 px-6 py-4 lg:px-8">
          {GRUPOS.map((g) => (
            <Link
              key={g.slug}
              href={`/grupos/${g.slug}`}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                g.slug === data.slug
                  ? "bg-blue-700 text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
              }`}
            >
              {g.tituloCorto}
            </Link>
          ))}
        </div>
      </div>

      {/* Integrantes */}
      <section className="bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Directiva e Integrantes
            </h2>
            <span className="h-px flex-1 bg-slate-200" />
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">
              {data.personas.length}{" "}
              {data.personas.length === 1 ? "integrante" : "integrantes"}
            </span>
          </div>

          <p className="mt-3 max-w-2xl text-slate-600">{data.lema}</p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.personas.map((p) => (
              <IntegranteCard key={p.nombre} persona={p} />
            ))}
          </div>

          {/* Horario de clases (Escuela de Música) */}
          {data.horarioTexto && (
            <div className="mt-12 overflow-hidden rounded-3xl bg-linear-to-br from-blue-900 to-blue-700 p-8 text-white shadow-xl sm:p-10">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-white ring-1 ring-white/20">
                <CalendarIcon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-xl font-bold">Horario de Clases</h3>
              <p className="mt-2 text-sky-100/80">
                Te esperamos cada semana para aprender y crecer juntos.
              </p>
              <p className="mt-5 inline-flex rounded-2xl bg-white/10 px-6 py-4 text-2xl font-bold ring-1 ring-white/15">
                {data.horarioTexto}
              </p>
            </div>
          )}

          {/* Avances de la Escuela */}
          {data.avances && data.avances.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-700">
                  <MusicIcon className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Avances de la Escuela
                  </h3>
                  <p className="text-sm text-slate-500">
                    Documentamos el crecimiento de nuestros alumnos.
                  </p>
                </div>
              </div>
              <div className="mt-8 grid gap-6 md:grid-cols-3">
                {data.avances.map((a) => (
                  <article
                    key={a.titulo}
                    className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-600/10"
                  >
                    <div className="relative grid aspect-4/3 place-items-center bg-linear-to-br from-blue-100 to-sky-100 text-blue-300">
                      <MusicIcon className="h-12 w-12" />
                    </div>
                    <div className="p-6">
                      <h4 className="text-lg font-bold text-slate-900">
                        {a.titulo}
                      </h4>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {a.nota}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
