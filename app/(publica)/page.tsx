import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import HeroCarousel from "@/app/components/HeroCarousel";
import TextMarquee from "@/app/components/TextMarquee";
import BlurText from "@/app/components/BlurText";
import Reveal from "@/app/components/Reveal";
import IconCardGrid from "@/app/components/IconCardGrid";
import SectionHeader from "@/app/components/SectionHeader";
import EscrituraBlock from "@/app/components/EscrituraBlock";
import CtaFinal from "@/app/components/ministry/CtaFinal";
import { getSettings } from "@/src/utils/settings";
import { getEventos, getTestimonios } from "@/src/utils/publico";
import { esPasado } from "@/app/(publica)/eventos/eventoUtils";
import { CalendarIcon, MapPinIcon, PlayIcon, ICONS } from "@/app/components/icons";
import {
  IGLESIA,
  LOGO_URL,
  HORARIOS,
  GRUPOS,
  CREENCIAS,
  cloudinaryUrl,
} from "@/app/data/iglesia";

export const metadata: Metadata = {
  title: {
    absolute: "Centro Cristiano Mieles | Iglesia Cristiana en Quilicura",
  },
  description:
    "Bienvenidos al Centro Cristiano Mieles en Quilicura. Ministerio Evangélico de Liberación del Espíritu Santo. Acompáñanos en nuestros cultos, eventos y ministerios familiares.",
  keywords: [
    "iglesia cristiana en Quilicura",
    "iglesia evangélica en Santiago",
    "ministerio cristiano",
    "iglesia pentecostal",
    "lugar de oración",
    "cultos cristianos",
    "Centro Cristiano Mieles",
    "Ministerio Evangélico de Liberación El Espíritu Santo",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Centro Cristiano Mieles — Hay un lugar para ti",
    description:
      "Iglesia Evangélica en Quilicura, Santiago. Cultos, oración, ministerios y comunidad. Te esperamos con los brazos abiertos.",
    url: "/",
    type: "website",
  },
};

// Datos estructurados (SEO) — tipo Church para Google.
const churchSchema = {
  "@context": "https://schema.org",
  "@type": "Church",
  "@id": `${IGLESIA.url}/#church`,
  name: `${IGLESIA.nombre} — ${IGLESIA.ministerio}`,
  alternateName: IGLESIA.ministerio,
  url: IGLESIA.url,
  logo: LOGO_URL,
  image: LOGO_URL,
  email: IGLESIA.correo,
  foundingDate: "2007-08-17",
  founder: { "@type": "Person", name: "Juan Acosta García" },
  areaServed: "Quilicura, Santiago de Chile",
  address: {
    "@type": "PostalAddress",
    streetAddress: "San Luis Nte. 780A",
    addressLocality: "Quilicura",
    addressRegion: "Región Metropolitana",
    postalCode: "8700000",
    addressCountry: "CL",
  },
  hasMap: IGLESIA.mapsUrl,
  geo: {
    "@type": "GeoCoordinates",
    latitude: -33.3564,
    longitude: -70.7423,
  },
  // Horarios de culto (formato 24h) — refuerza el SEO local con "abierto".
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Wednesday",
      opens: "19:00",
      closes: "21:00",
      name: "Culto General",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Friday",
      opens: "19:00",
      closes: "21:00",
      name: "Culto de Enseñanza Bíblica",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Sunday",
      opens: "11:30",
      closes: "14:00",
      name: "Culto Familiar y Adoración",
    },
  ],
  sameAs: [
    IGLESIA.redes.facebook,
    IGLESIA.redes.instagram,
    IGLESIA.redes.youtube,
    IGLESIA.redes.tiktok,
  ],
};

// Ministerios para el Home (grupos + departamentos con página propia).
const MINISTERIOS = [
  ...GRUPOS.map((g) => ({
    icon: g.icon,
    titulo: g.tituloCorto,
    lema: g.lema,
    href: `/grupos/${g.slug}`,
  })),
  {
    icon: "heart" as const,
    titulo: "Visita a Hogares",
    lema: "El amor de Cristo, casa por casa.",
    href: "/departamento-visitas",
  },
  {
    icon: "praying" as const,
    titulo: "Oración y Petición",
    lema: "Intercesión por cada necesidad.",
    href: "/oracion-peticion",
  },
];

// Tarjetas visuales de "Explora nuestra comunidad".
// Integra los accesos de siempre (Nosotros, Eventos, Comunidad, Grupos) con
// los temas nuevos (Testimonios, Entrevistas).
// imageUrl: fotos de stock realistas; reemplázalas por tus fotos de Cloudinary.
const EXPLORA = [
  {
    titulo: "Nosotros",
    descripcion: "Nuestro génesis, declaración de fe y horarios de culto.",
    accion: "Conoce nuestra historia",
    href: "/nosotros",
    // Biblia abierta
    foto:
      cloudinaryUrl("nosotros"),},
  {
    titulo: "Eventos",
    descripcion: "Aniversario, campañas y actividades de la iglesia.",
    accion: "Ver eventos",
    href: "/eventos",
    // Cruz cristiana en silueta al atardecer
    foto:
      cloudinaryUrl("Eventos"),
  },
  { 
    titulo: "Comunidad",
    descripcion: "La vida de la iglesia y los avisos de la familia de fe.",
    accion: "Ver comunidad",
    href: "/comunidad",
    foto:
      cloudinaryUrl("comunidad"),
  },
  {
    titulo: "Grupos y Ministerios",
    descripcion: "Conoce a los líderes y equipos de cada departamento.",
    accion: "Ver ministerios",
    href: "/grupos/cuerpo-ministerial",
    // Manos en oración
    foto:
      cloudinaryUrl("Grupos_y_Ministerios"),
  },
  {
    titulo: "Testimonios",
    descripcion: "Historias reales del poder de Dios en nuestras vidas.",
    accion: "Ver testimonios",
    href: "/testimonios",
    // Manos levantadas en adoración con luz cálida
    foto: cloudinaryUrl("Testimonios"),
  },
  {
    titulo: "Entrevistas",
    descripcion: "Conversaciones cercanas con líderes y hermanos de la fe.",
    accion: "Ver entrevistas",
    href: "/entrevistas",
    // Manos sobre la Biblia abierta — estudio bíblico y comunión
    foto: cloudinaryUrl("Entrevistas"),
  },
];

// Revalida periódicamente para reflejar cambios de contenido/configuración.
export const revalidate = 60;

export default async function Home() {
  const s = await getSettings();

  // Contenido en vivo desde Supabase (con respaldo estático).
  const eventosDB = await getEventos();
  const testimoniosDB = await getTestimonios();
  // Solo eventos cuya fecha y hora aún no han pasado (estado en tiempo real).
  const proximos = eventosDB.filter((e) => !esPasado(e));
  const eventosHome = (proximos.length ? proximos : eventosDB).slice(0, 3);
  const testimoniosHome = testimoniosDB.slice(0, 2);

  return (
    <>
      {/* SEO — datos estructurados */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(churchSchema) }}
      />

      <HeroCarousel />

      {/* ============ BIENVENIDA ============ */}
      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
            Bienvenido a casa
          </span>
          <BlurText
            as="h2"
            text={IGLESIA.nombre}
            className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
          />
          <BlurText
            as="p"
            delay={250}
            text={`Somos el ${IGLESIA.ministerio}, es una Iglesia Evangélica Cristiana ubicada en Quilicura, Región Metropolitana de Chile. Fundada el 30 de agosto de 2007, forma parte del Ministerio Evangélico de Liberación del Espíritu Santo. Nuestra misión es anunciar el Evangelio de Jesucristo, fortalecer a las familias y servir a nuestra comunidad mediante cultos, oración, discipulado, escuela de música y diferentes Ministerios para todas las edades.`}
            className="mt-5 text-lg leading-relaxed text-slate-600"
          />
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/nosotros"
              className="rounded-full bg-blue-700 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:-translate-y-0.5 hover:bg-blue-800"
            >
              Conoce nuestra historia
            </Link>
            <Link
              href="/eventos"
              className="rounded-full border border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700"
            >
              Ver eventos
            </Link>
          </div>
        </div>
      </section>

      {/* ============ FRASES DE FE (marquee) ============ */}
      <section
        aria-hidden
        className="overflow-hidden border-y border-blue-100 bg-linear-to-b from-blue-50/60 to-white py-10 sm:py-14"
      >
        <TextMarquee
          baseVelocity={-2.2}
          delay={300}
          className="font-black leading-[0.95] tracking-tight text-blue-700"
        >
          Dios es amor - Jesús te ama - Hay esperanza en Cristo -&nbsp;
        </TextMarquee>
        <TextMarquee
          baseVelocity={2.2}
          delay={300}
          className="font-black leading-[0.95] tracking-tight text-blue-700"
        >
          Su amor es eterno - Cristo transforma vidas - Bienvenido a casa -&nbsp;
        </TextMarquee>
      </section>

      {/* ============ ACCESOS RÁPIDOS ============ */}
      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <BlurText
              as="h2"
              text="Explora nuestra comunidad"
              className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
            />
            <BlurText
              as="p"
              delay={250}
              text="Todo lo que necesitas para crecer y servir, en un solo lugar."
              className="mt-4 text-lg text-slate-600"
            />
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {EXPLORA.map((c, i) => (
              <Reveal key={c.href} delay={i * 100}>
                <Link
                  href={c.href}
                  className="group relative block h-44 w-full cursor-pointer overflow-hidden rounded-2xl shadow-md ring-1 ring-slate-200/60 sm:h-48 md:h-52"
                >
                  <Image
                    src={c.foto}
                    alt={c.titulo}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Overlay para legibilidad */}
                  <div className="absolute inset-0 bg-linear-to-t from-blue-950/90 via-blue-950/40 to-transparent" />

                  {/* Texto abajo a la izquierda */}
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <h3 className="text-xl font-bold drop-shadow">{c.titulo}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-sky-50/90 drop-shadow">
                      {c.descripcion}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-sky-300 transition-all group-hover:gap-2">
                      {c.accion} <span aria-hidden>→</span>
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ QUÉ CREEMOS ============ */}
      <IconCardGrid
        eyebrow="Lo que creemos"
        titulo="Nuestra fe, en pocas palabras"
        subtitulo="Una fe sencilla y firme, centrada en Dios y en su Palabra."
        items={CREENCIAS}
        gridClass="sm:grid-cols-2 lg:grid-cols-3"
        bg="bg-blue-50/40"
      />

      {/* ============ MINISTERIOS ============ */}
      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader
            eyebrow="Sirve y crece"
            titulo="Nuestros Ministerios"
            subtitulo="Hay un lugar para que uses tus dones para Dios y para la comunidad."
          />

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {MINISTERIOS.map((m, i) => {
              const Ico = ICONS[m.icon];
              return (
                <Reveal key={m.href} delay={i * 60}>
                  <Link
                    href={m.href}
                    className="group flex h-full items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-600/10"
                  >
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-blue-50 to-sky-50 text-blue-700 transition-transform group-hover:scale-110">
                      <Ico className="h-6 w-6" />
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {m.titulo}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">
                        {m.lema}
                      </p>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ EVENTOS (próximos) ============ */}
      <section className="bg-blue-50/40 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader
            eyebrow="Agenda"
            icon={CalendarIcon}
            titulo="Próximos eventos"
            subtitulo="Acompáñanos en lo que Dios está haciendo en nuestra iglesia."
          />

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {eventosHome.map((e, i) => (
              <Reveal key={e.id} delay={i * 80}>
                <article className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-600/10">
                  <span className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {new Date(e.fecha).toLocaleDateString("es-CL", {
                      day: "2-digit",
                      month: "long",
                    })}
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-slate-900">
                    {e.nombre}
                  </h3>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">
                    {e.descripcion}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <MapPinIcon className="h-4 w-4 text-blue-400" />
                    {e.hora} · {e.lugar}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/eventos"
              className="inline-flex items-center gap-2 rounded-full bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:-translate-y-0.5 hover:bg-blue-800"
            >
              Ver todos los eventos <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIOS (destacados) ============ */}
      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader
            eyebrow="Testimonios"
            icon={PlayIcon}
            titulo="Historias del poder de Dios"
            subtitulo="Vidas reales transformadas por el amor de Cristo."
          />

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {testimoniosHome.map((t, i) => (
              <Reveal key={t.id} delay={i * 80}>
                <Link
                  href="/testimonios"
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-600/10"
                >
                  <div className="relative aspect-video overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://img.youtube.com/vi/${t.youtubeId}/hqdefault.jpg`}
                      alt={t.titulo}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-blue-950/60 to-transparent" />
                    <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-blue-700 shadow-lg transition-transform group-hover:scale-110">
                      <PlayIcon className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-lg font-bold text-slate-900">
                      {t.titulo}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
                      {t.descripcion}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/testimonios"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700"
            >
              Ver todos los testimonios <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ============ VERSÍCULO DESTACADO ============ */}
      <EscrituraBlock
        etiqueta="Una invitación"
        referencia="San Mateo 11:28"
        texto="Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar."
      />

      {/* ============ CULTOS GENERALES ============ */}
      <section id="cultos" className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader
            eyebrow="Cultos Generales"
            icon={CalendarIcon}
            titulo="Te esperamos cada semana"
            subtitulo="Estos son nuestros servicios y actividades. ¡Las puertas están abiertas para ti y para tu familia!"
          />

          {/* Grilla responsiva de horarios */}
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HORARIOS.map((h, i) => (
              <div
                key={i}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-600/10"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex rounded-full bg-blue-700 px-3 py-1 text-xs font-bold text-white">
                    {h.dia}
                  </span>
                  <CalendarIcon className="h-5 w-5 text-blue-300" />
                </div>
                <p className="mt-4 text-base font-bold leading-snug text-slate-900">
                  {h.actividad}
                </p>
                <p className="mt-1 text-sm font-semibold text-blue-700">
                  {h.hora}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ LLAMADO FINAL ============ */}
      <CtaFinal
        titulo="Te esperamos con los brazos abiertos"
        texto="Ven y vive la presencia de Dios junto a nuestra familia de fe. Hay un lugar para ti y para tu familia."
        primaryCta={{
          label: "Cómo llegar",
          href: s.mapsUrl,
          external: true,
        }}
        secondaryCta={{ label: "Enviar petición de oración", href: "/oracion-peticion" }}
      />
    </>
  );
}
