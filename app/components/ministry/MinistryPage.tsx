import PageHeader from "../PageHeader";
import MinisteriosNav from "../MinisteriosNav";
import MosaicGallery from "../MosaicGallery";
import Pilares from "./Pilares";
import VersiculoDestacado from "./VersiculoDestacado";
import EquipoGrid from "./EquipoGrid";
import CtaFinal from "./CtaFinal";
import { CalendarIcon, MusicIcon, SparkIcon, ICONS } from "../icons";
import { NAV_GRUPOS, type Grupo } from "@/app/data/iglesia";
import { getSettings } from "@/src/utils/settings";

/**
 * Plantilla ÚNICA para las páginas de ministerio guiadas por datos.
 * Renderiza siempre la misma estructura y omite los bloques que el
 * ministerio no tenga. Agregar un ministerio nuevo = un objeto en GRUPOS[].
 *
 *   Hero → Slider → Pilares? → Versículo? → Equipo
 *        → Horario? → Avances? → Galería? → CTA final
 */
export default async function MinistryPage({ data }: { data: Grupo }) {
  const integrantes = data.personas.length;
  const GroupIcon = ICONS[data.icon];
  const s = await getSettings();

  return (
    <>
      <PageHeader
        eyebrow="Grupos y Ministerios"
        titulo={data.titulo}
        descripcion={data.descripcion}
        primaryCta={{
          label: "Cómo llegar",
          href: s.mapsUrl,
          external: true,
        }}
        aside={
          <div>
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/15 text-white ring-1 ring-white/20">
                <GroupIcon className="h-7 w-7" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-200">
                  {data.tituloCorto}
                </p>
                <p className="text-lg font-bold">Una familia de fe</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-sky-50/90">
              {data.lema}
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/15">
              {integrantes}{" "}
              {integrantes === 1 ? "integrante activo" : "integrantes activos"}
            </div>
          </div>
        }
      />

      <MinisteriosNav items={NAV_GRUPOS} activeHref={`/grupos/${data.slug}`} />

      {data.pilares && data.pilares.length > 0 && (
        <Pilares titulo={`Así sirve ${data.tituloCorto}`} items={data.pilares} />
      )}

      {data.versiculo && (
        <VersiculoDestacado
          cita={data.versiculo.cita}
          texto={data.versiculo.texto}
        />
      )}

      <EquipoGrid personas={data.personas} lema={data.lema} />

      {/* Horario de clases (ej. Escuela de Música) */}
      {data.horarioTexto && (
        <section className="bg-background pb-20 sm:pb-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="overflow-hidden rounded-3xl bg-linear-to-br from-blue-900 to-blue-700 p-8 text-white shadow-xl sm:p-10">
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
          </div>
        </section>
      )}

      {/* Avances de la Escuela */}
      {data.avances && data.avances.length > 0 && (
        <section className="bg-background pb-20 sm:pb-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
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
        </section>
      )}

      {/* Galería (ej. Avances de las Clases — Escuela Dominical) */}
      {data.galeria && data.galeria.fotos.length > 0 && (
        <section className="bg-background pb-20 sm:pb-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-700">
                <SparkIcon className="h-6 w-6" />
              </span>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {data.galeria.titulo}
                </h3>
                <p className="text-sm text-slate-500">
                  Momentos de las actividades y el crecimiento del ministerio.
                </p>
              </div>
            </div>
            <div className="mt-8">
              <MosaicGallery fotos={data.galeria.fotos} />
            </div>
          </div>
        </section>
      )}

      <CtaFinal
        titulo="Te esperamos en nuestra iglesia"
        texto="Ven y sé parte de lo que Dios está haciendo en el Centro Cristiano Mieles. Las puertas están abiertas para ti y tu familia."
        primaryCta={{
          label: "Cómo llegar",
          href: s.mapsUrl,
          external: true,
        }}
        secondaryCta={{ label: "Petición de oración", href: "/oracion-peticion" }}
      />
    </>
  );
}
