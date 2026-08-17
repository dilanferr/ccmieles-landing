import type { Metadata } from "next";
import PageHeader from "@/app/components/PageHeader";
import MinisteriosNav from "@/app/components/MinisteriosNav";
import SectionHeader from "@/app/components/SectionHeader";
import EquipoGrid from "@/app/components/ministry/EquipoGrid";
import CtaFinal from "@/app/components/ministry/CtaFinal";
import FaqAccordion, { type Faq } from "@/app/components/ministry/FaqAccordion";
import Reveal from "@/app/components/Reveal";
import { getSettings } from "@/src/utils/settings";
import { MegaphoneIcon, HeartIcon } from "@/app/components/icons";
import { NAV_GRUPOS, getGrupo } from "@/app/data/iglesia";

export const metadata: Metadata = {
  title: "Evangelización",
  description:
    "Ministerio de Evangelización del Centro Cristiano Mieles en Quilicura, Santiago de Chile: predicación en las calles y plazas, visitas a los hogares y campañas de extensión, cumpliendo la Gran Comisión de llevar el evangelio a toda criatura.",
  keywords: [
    "evangelización en Quilicura",
    "predicación en la calle Santiago",
    "ministerio de evangelismo",
    "Gran Comisión",
    "iglesia evangélica en Santiago",
    "Centro Cristiano Mieles",
  ],
  alternates: { canonical: "/grupos/evangelizacion" },
};

// Bloques doctrinales (profundidad temática para SEO/GEO).
const LABOR = [
  {
    Icon: MegaphoneIcon,
    titulo: "Evangelismo Urbano y de Contacto en Santiago",
    parrafos: [
      "Cada semana, los miembros del ministerio salen a las plazas y calles de Quilicura para testificar del amor de Jesucristo cara a cara. La predicación pública es el corazón de nuestra labor: anunciamos en voz alta el mensaje de salvación a quienes transitan, se detienen o simplemente escuchan al pasar.",
      "Acompañamos esa proclamación con la entrega de folletos informativos y tratados que resumen el evangelio, de modo que cada persona pueda llevarse la Palabra a casa. Creemos que la fe viene por el oír, y el oír por la Palabra de Dios; por eso ninguna conversación es pequeña ante los ojos del Señor.",
    ],
  },
  {
    Icon: HeartIcon,
    titulo: "Impacto Directo en los Hogares",
    parrafos: [
      "El evangelio también cruza el umbral de las casas que abren sus puertas. Visitamos hogares de la comunidad para llevar la Palabra de Dios y una oración de fe a familias que enfrentan enfermedad, angustia o necesidad. Allí, en lo íntimo, el mensaje de Cristo se vuelve cercano y personal.",
      "En cada visita escuchamos, consolamos y oramos, presentando a Jesús como Señor y Salvador. Muchas familias han recibido fortaleza, sanidad y esperanza, y algunas han dado su primer paso de fe desde su propia sala de estar.",
    ],
  },
];

// Versículos de autoridad (Reina-Valera 1960).
const VERSICULOS = [
  {
    cita: "Marcos 16:15",
    texto:
      "Y les dijo: Id por todo el mundo y predicad el evangelio a toda criatura.",
  },
  {
    cita: "Romanos 10:15",
    texto:
      "¿Y cómo predicarán si no fueren enviados? Como está escrito: ¡Cuán hermosos son los pies de los que anuncian la paz, de los que anuncian buenas nuevas!",
  },
];

const FAQ: Faq[] = [
  {
    pregunta: "¿Dónde y cuándo predican en la calle?",
    respuesta:
      "Tenemos dos salidas fijas cada semana: los domingos a las 10:00 hrs en el frontis de nuestra iglesia, Centro Cristiano Mieles (San Luis 780); y los sábados a las 16:00 hrs junto al Consultorio Irene Frei de Cid, en Cabo 1° Carlos Cuevas Olmos 525, Quilicura, Región Metropolitana.",
  },
  {
    pregunta: "¿Necesito experiencia para evangelizar?",
    respuesta:
      "No. Solo necesitas un corazón dispuesto. Salimos en equipo y siempre acompañamos a quienes recién comienzan; hay muchas formas de servir: conversar, orar, repartir folletos o apoyar en alabanza.",
  },
  {
    pregunta: "¿Cómo puedo sumarme al equipo de evangelización?",
    respuesta:
      "Acércate a cualquiera de nuestras salidas de los sábados o domingos, o escríbenos desde la iglesia. Con gusto te recibimos y te integramos al equipo.",
  },
  {
    pregunta: "¿Qué hacemos durante una salida?",
    respuesta:
      "Predicamos el evangelio, compartimos testimonios, oramos por las personas y las invitamos a la iglesia. Es un tiempo de adoración y servicio para llevar el amor de Cristo a nuestra ciudad.",
  },
];

export const revalidate = 60;

export default async function EvangelizacionPage() {
  const data = getGrupo("evangelizacion")!;
  const s = await getSettings();

  return (
    <>
      <PageHeader
        eyebrow="Grupos y Ministerios"
        titulo="Evangelización"
        descripcion="Llevamos el mensaje de salvación a las calles, las plazas y los hogares de Santiago de Chile, alcanzando a los perdidos con el amor de Cristo."
        primaryCta={{
          label: "Cómo llegar",
          href: s.mapsUrl,
          external: true,
        }}
        bgPublicId="evangelizacion"
        aside={
          <div>
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                <MegaphoneIcon className="h-7 w-7" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-200">
                  La Gran Comisión
                </p>
                <p className="text-lg font-bold">El evangelio a toda criatura</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-sky-50/90">
              {data.lema} Salimos cada semana, de forma organizada, a proclamar
              las buenas nuevas en nuestra comunidad.
            </p>
          </div>
        }
      />

      <MinisteriosNav items={NAV_GRUPOS} activeHref="/grupos/evangelizacion" />

      {/* ============ NUESTRA MISIÓN EN LAS CALLES ============ */}
      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="La Gran Comisión"
              titulo="Nuestra Misión en las Calles"
            />
          </Reveal>
          <Reveal delay={120}>
            <div className="mx-auto mt-8 max-w-3xl space-y-5 text-base leading-relaxed text-slate-600 sm:text-lg">
              <p>
                El ministerio de Evangelización del Centro Cristiano Mieles nace
                de un mandato claro: la Gran Comisión que el Señor Jesucristo
                entregó a su iglesia. Creemos que el evangelio no fue dado para
                quedarse dentro de las cuatro paredes del templo, sino para ser
                proclamado en cada esquina, plaza en la Comuna.
              </p>
              <p>
                Por eso, semana tras semana salimos de forma organizada a las
                calles de Quilicura y la Región Metropolitana, llevando el
                mensaje de salvación a quienes aún no conocen el amor de Cristo.
                Lo hacemos con respeto, con amor y con la convicción de que toda
                persona merece escuchar las buenas nuevas del Reino de Dios.
              </p>
              <p>
                Nuestra labor combina la predicación pública, la entrega de
                literatura cristiana, la oración por los necesitados y la
                testificación personal. No buscamos imponer, sino sembrar: cada
                conversación es una semilla que confiamos en las manos de Dios,
                porque uno planta, otro riega, pero es Él quien da el
                crecimiento.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ DIRECTIVA E INTEGRANTES ============ */}
      <Reveal>
        <EquipoGrid lema={data.lema} personas={data.personas} />
      </Reveal>

      {/* ============ NUESTRA LABOR EN PROFUNDIDAD ============ */}
      <section className="bg-blue-50/40 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="Cómo servimos"
              titulo="Nuestra labor en profundidad"
              subtitulo="Tres frentes con los que cumplimos la Gran Comisión en nuestra ciudad."
            />
          </Reveal>

          <div className="mx-auto mt-12 max-w-3xl space-y-10">
            {LABOR.map((b, i) => (
              <Reveal key={b.titulo} delay={i * 80}>
                <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
                  <div className="flex items-center gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-blue-50 to-sky-50 text-blue-700">
                      <b.Icon className="h-6 w-6" />
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">
                      {b.titulo}
                    </h3>
                  </div>
                  <div className="mt-4 space-y-3 text-base leading-relaxed text-slate-600">
                    {b.parrafos.map((p, j) => (
                      <p key={j}>{p}</p>
                    ))}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          {/* Versículos de autoridad */}
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2">
            {VERSICULOS.map((v) => (
              <Reveal key={v.cita}>
                <figure className="flex h-full flex-col rounded-3xl bg-linear-to-br from-blue-900 to-blue-700 p-8 text-white shadow-lg shadow-blue-900/10 sm:p-10">
                  <span
                    aria-hidden
                    className="font-serif text-5xl leading-none text-sky-300/70"
                  >
                    “
                  </span>
                  <blockquote className="-mt-3 flex-1 text-lg font-medium italic leading-relaxed text-sky-50">
                    {v.texto}
                  </blockquote>
                  <figcaption className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-sky-200">
                    {v.cita} · Reina-Valera 1960
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PREGUNTAS FRECUENTES ============ */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="Preguntas frecuentes"
              titulo="Resolvemos tus dudas"
              subtitulo="Lo que más consultan sobre nuestras salidas de evangelización."
            />
          </Reveal>
          <FaqAccordion items={FAQ} />
        </div>
      </section>

      <CtaFinal
        titulo="Súmate a la cosecha"
        texto="Dios sigue buscando obreros para su mies. Ven y sé parte de quienes llevan el evangelio a Santiago de Chile."
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
