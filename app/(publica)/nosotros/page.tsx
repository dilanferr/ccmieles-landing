import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PageHeader from "@/app/components/PageHeader";
import TimelineCarousel from "@/app/components/TimelineCarousel";
import StoryTimeline from "@/app/components/StoryTimeline";
import IconCardGrid from "@/app/components/IconCardGrid";
import SectionHeader from "@/app/components/SectionHeader";
import StatsGrid from "@/app/components/StatsGrid";
import EscrituraBlock from "@/app/components/EscrituraBlock";
import MosaicGallery from "@/app/components/MosaicGallery";
import Reveal from "@/app/components/Reveal";
import TrackLink from "@/app/components/TrackLink";
import { getSettings } from "@/src/utils/settings";
import {
  CheckIcon,
  SparkIcon,
  HeartIcon,
  MapPinIcon,
  ChurchIcon,
} from "@/app/components/icons";
import {
  IGLESIA,
  LOGO_URL,
  DECLARACION_FE,
  OBJETIVOS,
  LO_QUE_HACEMOS,
  HITOS,
  HISTORIA,
  HISTORIA_REFLEXION,
  LINEA_TIEMPO,
  SIGNIFICADO_NOMBRE,
  IDENTIDAD,
  LIDERES,
  GALERIA_NOSOTROS,
  HORARIOS,
} from "@/app/data/iglesia";

export const metadata: Metadata = {
  title: {
    absolute:
      "Nuestra Historia y Visión | Centro Cristiano Mieles Quilicura",
  },
  description:
    "Conoce la historia del Centro Cristiano Mieles en Quilicura: una iglesia fundada el 30 de agosto de 2007 como Ministerio Evangélico de Liberación del Espíritu Santo. Descubre nuestra visión, declaración de fe, misión y liderazgo.",
  keywords: [
    "iglesia cristiana en Quilicura",
    "iglesia evangélica en Santiago",
    "ministerio cristiano",
    "iglesia pentecostal",
    "lugar de oración",
    "cultos cristianos",
    "ministerios cristianos",
    "Pastor Juan Acosta García",
    "Ministerio Evangélico de Liberación El Espíritu Santo",
    "Centro Cristiano Mieles",
  ],
  alternates: { canonical: "/nosotros" },
  openGraph: {
    title:
      "Nuestra Historia — Ministerio Evangélico de Liberación El Espíritu Santo",
    description:
      "Una obra levantada por Dios en Santiago de Chile desde 2007. Conoce nuestra historia, fe, misión y liderazgo.",
    url: "/nosotros",
    type: "article",
  },
};

// Revalida la página periódicamente para no servir una versión congelada.
export const revalidate = 60;

// Datos estructurados (SEO) — tipo Church para Google.
const churchSchema = {
  "@context": "https://schema.org",
  "@type": "Church",
  name: `${IGLESIA.nombre} — ${IGLESIA.ministerio}`,
  alternateName: IGLESIA.ministerio,
  url: `${IGLESIA.url}/nosotros`,
  logo: LOGO_URL,
  foundingDate: "2007-08-17",
  founder: { "@type": "Person", name: "Juan Acosta García" },
  areaServed: "Quilicura, Santiago de Chile",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Quilicura",
    addressRegion: "Región Metropolitana",
    addressCountry: "CL",
  },
  sameAs: [
    IGLESIA.redes.facebook,
    IGLESIA.redes.instagram,
    IGLESIA.redes.youtube,
    IGLESIA.redes.tiktok,
  ],
};

export default async function NosotrosPage() {
  const anios = new Date().getFullYear() - 2007;
  const s = await getSettings();

  return (
    <>
      {/* SEO — datos estructurados */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(churchSchema) }}
      />

      {/* ============ HERO ============ */}
      <PageHeader
        eyebrow="Nuestra Iglesia"
        titulo="Una obra levantada por Dios"
        descripcion="Somos el Ministerio Evangélico de Liberación El Espíritu Santo: una familia de fe en Santiago de Chile donde el amor de Cristo libera, restaura y transforma vidas."
        primaryCta={{ label: "Conoce nuestra historia", href: "#historia" }}
        secondaryCta={{
          label: "Planifica tu visita",
          href: s.mapsUrl,
          external: true,
        }}
        aside={
          <div>
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                <ChurchIcon className="h-7 w-7" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-200">
                  Fundado en 2007
                </p>
                <p className="text-lg font-bold">Santiago de Chile</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-sky-50/90">
              Una obra para la liberación, la restauración y la fe, ordenada por
              Dios y dirigida por su Espíritu.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/15">
              Fundador: Pastor Obispo Juan Acosta García
            </div>
          </div>
        }
      />

      {/* ============ NUESTRA HISTORIA ============ */}
      <section id="historia" className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="Nuestra Historia"
              titulo="De un llamado a un ministerio"
              subtitulo="Una historia que comenzó mucho antes del primer culto."
            />
          </Reveal>

          <Reveal
            delay={120}
            className="mt-14 grid items-center gap-10 lg:grid-cols-2"
          >
            <TimelineCarousel hitos={HITOS} />

            <div className="space-y-7">
              {HISTORIA.map((c, i) => (
                <div key={c.titulo} className="relative pl-12">
                  <span className="absolute left-0 top-0 grid h-8 w-8 place-items-center rounded-full bg-blue-700 text-sm font-bold text-white shadow-sm">
                    {i + 1}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    {c.titulo}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600 sm:text-base">
                    {c.parrafo}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={120}>
            <figure className="mx-auto mt-14 max-w-3xl border-l-4 border-blue-300 pl-6">
              <blockquote className="text-lg font-medium italic leading-relaxed text-slate-700 sm:text-xl">
                “{HISTORIA_REFLEXION}”
              </blockquote>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* ============ LÍNEA DEL TIEMPO ============ */}
      <section className="bg-background pb-20 sm:pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="Cronología"
              titulo="Línea del tiempo"
              subtitulo="Los hitos que marcaron el origen y el crecimiento del ministerio."
            />
          </Reveal>
          <div className="mt-14">
            <StoryTimeline items={LINEA_TIEMPO} />
          </div>
        </div>
      </section>

      {/* ============ SIGNIFICADO DEL NOMBRE ============ */}
      <Reveal>
        <IconCardGrid
          eyebrow="Nuestro nombre"
          titulo="¿Qué significa nuestro nombre?"
          subtitulo="Cada palabra encierra el propósito de la obra."
          items={SIGNIFICADO_NOMBRE}
          gridClass="sm:grid-cols-2 lg:grid-cols-4"
        />
      </Reveal>

      {/* ============ NUESTRA IDENTIDAD ============ */}
      <Reveal>
        <IconCardGrid
          eyebrow="Quiénes somos"
          titulo="Nuestra Identidad"
          subtitulo="Lo que nos mueve y nos sostiene como familia de fe."
          items={IDENTIDAD}
          gridClass="sm:grid-cols-2 lg:grid-cols-3"
          bg="bg-blue-50/40"
        />
      </Reveal>

      {/* ============ DOCTRINA (¿Qué creemos?) ============ */}
      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="Lo que creemos"
              titulo="Doctrina y fundamentos"
            />
          </Reveal>

          <Reveal
            delay={120}
            className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
              <div className="mb-6 flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-700">
                  <SparkIcon className="h-6 w-6" />
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  Declaración de Fe
                </h3>
              </div>
              <ul className="space-y-4">
                {DECLARACION_FE.map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-sky-500" />
                    <span className="text-sm leading-relaxed text-slate-700">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
              <div className="mb-6 flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-700">
                  <CheckIcon className="h-6 w-6" />
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  Objetivos del Ministerio
                </h3>
              </div>
              <ul className="space-y-4">
                {OBJETIVOS.map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue-700 text-[11px] font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="text-sm leading-relaxed text-slate-700">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10 md:col-span-2 lg:col-span-1">
              <div className="mb-6 flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-700">
                  <HeartIcon className="h-6 w-6" />
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  Lo que hacemos como iglesia
                </h3>
              </div>
              <ul className="space-y-4">
                {LO_QUE_HACEMOS.map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-sky-500" />
                    <span className="text-sm leading-relaxed text-slate-700">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ LIDERAZGO ============ */}
      <section className="bg-blue-50/40 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="Nuestro Liderazgo"
              titulo="Quién dirige la iglesia"
            />
          </Reveal>

          <Reveal delay={120} className="mt-14 grid gap-8 md:grid-cols-2">
            {LIDERES.map((l) => (
              <article
                key={l.nombre}
                className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-600/10 sm:flex-row"
              >
                <div className="relative aspect-4/5 w-full shrink-0 sm:aspect-auto sm:w-44 lg:w-52">
                  <Image
                    src={l.foto}
                    alt={`Fotografía de ${l.nombre}`}
                    fill
                    sizes="(max-width: 640px) 100vw, 208px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                    {l.cargo}
                  </span>
                  <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-900">
                    {l.nombre}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {l.bio}
                  </p>
                  <blockquote className="mt-auto border-l-4 border-blue-300 pl-4 pt-4 text-sm italic leading-relaxed text-slate-700">
                    “{l.cita}”
                    {l.citaRef && (
                      <cite className="mt-1 block text-xs font-bold uppercase not-italic tracking-[0.15em] text-blue-700">
                        {l.citaRef}
                      </cite>
                    )}
                  </blockquote>
                </div>
              </article>
            ))}
          </Reveal>

          <Reveal delay={120} className="mt-10 text-center">
            <Link
              href="/grupos/cuerpo-ministerial"
              className="inline-flex items-center gap-2 rounded-full bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:-translate-y-0.5 hover:bg-blue-800"
            >
              Conoce al Cuerpo Ministerial
              <span aria-hidden>→</span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ============ NUESTRA IGLESIA HOY ============ */}
      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="Nuestra Iglesia Hoy"
              titulo="Una obra viva y en crecimiento"
            />
          </Reveal>
          <Reveal delay={120} className="mt-14">
            <StatsGrid
              items={[
                { valor: `${anios}`, label: "Años de ministerio" },
                { valor: "9", label: "Ministerios y grupos" },
                { valor: `${HORARIOS.length}`, label: "Actividades semanales" },
                { valor: "Quilicura", label: "Santiago de Chile", wide: true },
              ]}
            />
          </Reveal>
        </div>
      </section>

      {/* ============ GALERÍA ============ */}
      <section className="bg-background pb-20 sm:pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="Nuestra vida en imágenes"
              titulo="Galería"
              subtitulo="Cultos, bautismos, evangelismos y momentos de comunión."
            />
          </Reveal>
          <Reveal delay={120} className="mt-14">
            <MosaicGallery fotos={GALERIA_NOSOTROS} />
          </Reveal>
        </div>
      </section>

      {/* ============ JOSUÉ 1:1-9 ============ */}
      <Reveal>
        <EscrituraBlock
          etiqueta="La Palabra que selló el comienzo"
          referencia="Josué 1:9"
          texto="Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo en dondequiera que vayas."
          nota="Con esta promesa (Josué 1:1-9) Dios confirmó el llamado a fundar el ministerio."
        />
      </Reveal>

      {/* ============ PERSONA JURÍDICA (confianza) ============ */}
      <section className="bg-background pb-20 sm:pb-24">
        <Reveal className="mx-auto max-w-3xl border-t border-slate-200/70 px-6 pt-14 text-center lg:px-8">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-100">
            <CheckIcon className="h-7 w-7" />
          </span>
          <p className="eyebrow mt-5 justify-center">Persona Jurídica</p>
          <p className="mt-4 text-lg font-medium leading-relaxed text-slate-700 sm:text-xl">
            {IGLESIA.personaJuridica}, sin fines de lucro.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Institución legalmente constituida al servicio del Señor y de la
            comunidad.
          </p>
        </Reveal>
      </section>

      {/* ============ UBICACIÓN / MAPA ============ */}
      <section id="visita" className="bg-background pb-20 sm:pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="Dónde encontrarnos"
              titulo="Visítanos en nuestro templo"
              subtitulo="Las puertas están abiertas para ti y para tu familia. ¡Te esperamos con los brazos abiertos!"
            />
          </Reveal>

          <Reveal delay={120} className="mt-14 grid gap-6 lg:grid-cols-3">
            <div className="flex flex-col justify-between gap-8 overflow-hidden rounded-3xl bg-linear-to-br from-blue-900 to-blue-700 p-8 text-white shadow-xl sm:p-10">
              <div>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                  <MapPinIcon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-xl font-bold">Nuestro Templo</h3>
                <p className="mt-2 text-sm leading-relaxed text-sky-100/90">
                  {IGLESIA.direccion}
                </p>
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-sky-200">
                  Te esperamos cada semana
                </p>
                <p className="mt-1 text-sm leading-relaxed text-sky-100/90">
                  Consulta nuestros cultos y actividades en el Inicio.
                </p>
              </div>

              <TrackLink
                href={s.mapsUrl}
                external
                event="visit_plan_click"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-sky-50"
              >
                <MapPinIcon className="h-4 w-4" />
                Cómo llegar
              </TrackLink>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-slate-200 shadow-lg ring-1 ring-slate-200/60 lg:col-span-2">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1666.2348307157272!2d-70.755958!3d-33.3588025!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662c15d6de9a7bb%3A0x97bd1ad96162cfbb!2sTemplo%20ministerio%20evangelico%20de%20liberacion%20%22El%20Espiritu%20Santo!5e0!3m2!1ses-419!2scl!4v1781569555499!5m2!1ses-419!2scl"
                title="Ubicación del Centro Cristiano Mieles"
                className="h-90 w-full sm:h-110 lg:h-full"
                style={{ border: 0, minHeight: "360px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
