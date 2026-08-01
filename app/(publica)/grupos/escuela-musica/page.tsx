import type { Metadata } from "next";
import PageHeader from "@/app/components/PageHeader";
import MinisteriosNav from "@/app/components/MinisteriosNav";
import SectionHeader from "@/app/components/SectionHeader";
import Reveal from "@/app/components/Reveal";
import AnimatedCounter from "@/app/components/AnimatedCounter";
import PersonCard from "@/app/components/PersonCard";
import GaleriaCategorias from "@/app/components/ministry/GaleriaCategorias";
import FaqAccordion from "@/app/components/ministry/FaqAccordion";
import CtaFinal from "@/app/components/ministry/CtaFinal";
import {
  ICONS,
  ChevronRight,
  CalendarIcon,
  CheckIcon,
  MusicIcon,
} from "@/app/components/icons";
import { NAV_GRUPOS, getGrupo } from "@/app/data/iglesia";
import { getSettings } from "@/src/utils/settings";
import {
  HERO,
  MISION,
  INSTRUMENTOS,
  PILARES,
  CIFRAS,
  RUTA,
  REQUISITOS,
  EQUIPO_BIOS,
  APRENDER,
  GALERIA_MUSICA,
  UNETE,
  VERSICULO,
  FAQ,
} from "@/app/data/musica";

export const metadata: Metadata = {
  title: "Escuela de Música",
  description:
    "La Escuela de Música del Centro Cristiano Mieles forma a niños y jóvenes en guitarra, teclado, bajo, batería y canto para servir en la alabanza y adorar a Dios con excelencia. Clases los sábados en Quilicura.",
  keywords: [
    "escuela de música cristiana",
    "clases de música iglesia Quilicura",
    "aprender guitarra teclado batería",
    "música para adorar a Dios",
    "Centro Cristiano Mieles",
  ],
  alternates: { canonical: "/grupos/escuela-musica" },
};

export const revalidate = 60;

export default async function EscuelaMusicaPage() {
  const data = getGrupo("escuela-musica")!;
  const s = await getSettings();
  const MisionIcon = ICONS[MISION.icon];

  const equipo = data.personas.map((p) => ({
    ...p,
    descripcion: EQUIPO_BIOS[p.nombre],
  }));

  return (
    <>
      {/* ============ 1 · HERO ============ */}
      <PageHeader
        eyebrow="Grupos y Ministerios"
        titulo={data.titulo}
        descripcion="Preparamos a niños y jóvenes en el dominio de los instrumentos para servir en la casa de Dios, con excelencia y un corazón consagrado."
        primaryCta={{ label: "Cómo llegar", href: s.mapsUrl, external: true }}
        secondaryCta={{ label: "Quiero inscribirme", href: UNETE.cta.href }}
        aside={
          <div>
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/15 text-white ring-1 ring-white/20">
                <MusicIcon className="h-7 w-7" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-200">
                  {HERO.eyebrow}
                </p>
                <p className="text-lg font-bold">{HERO.titulo}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {HERO.stats.map((st, i) => {
                const Ico = ICONS[st.icon];
                return (
                  <div
                    key={st.label}
                    className="animate-fade-up rounded-2xl bg-white/10 p-4 ring-1 ring-white/15"
                    style={{ animationDelay: `${i * 90}ms` }}
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 text-sky-100">
                      <Ico className="h-5 w-5" />
                    </span>
                    <p className="mt-3 text-2xl font-bold text-white">
                      {st.valor}
                    </p>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-200">
                      {st.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        }
      />

      <MinisteriosNav
        items={NAV_GRUPOS}
        activeHref="/grupos/escuela-musica"
      />

      {/* ============ 2 · NUESTRA MISIÓN ============ */}
      <section className="relative isolate overflow-hidden bg-background py-20 sm:py-24">
        <div
          aria-hidden
          className="animate-float-slow pointer-events-none absolute -left-16 top-10 h-64 w-64 rounded-full bg-sky-200/40 blur-3xl"
        />
        <div
          aria-hidden
          className="animate-float-slower pointer-events-none absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-blue-200/40 blur-3xl"
        />
        <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-8">
          <Reveal>
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-linear-to-br from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-600/25">
              <MisionIcon className="h-8 w-8" />
            </span>
          </Reveal>
          <Reveal delay={100}>
            <span className="eyebrow mt-6">{MISION.eyebrow}</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {MISION.titulo}
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              {MISION.texto}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============ 3 · ¿QUÉ ENSEÑAMOS? ============ */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="¿Qué enseñamos?"
              titulo="Instrumentos y áreas"
              subtitulo="Desde los primeros acordes hasta servir en la banda de alabanza."
            />
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {INSTRUMENTOS.map((a, i) => {
              const Ico = ICONS[a.icon];
              return (
                <Reveal key={a.titulo} delay={(i % 4) * 80}>
                  <article className="group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-600/10">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-linear-to-br from-blue-50 to-sky-50 text-blue-700 transition-transform group-hover:scale-110">
                      <Ico className="h-6 w-6" />
                    </span>
                    <h3 className="mt-4 text-base font-bold text-slate-900">
                      {a.titulo}
                    </h3>
                    <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-600">
                      {a.texto}
                    </p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ 4 · PILARES ============ */}
      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="Nuestros valores"
              titulo="Cómo formamos"
              subtitulo="Enseñamos música, pero formamos siervos para la casa de Dios."
            />
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PILARES.map((p, i) => {
              const Ico = ICONS[p.icon];
              return (
                <Reveal key={p.titulo} delay={(i % 4) * 80}>
                  <article className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm transition-all hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-600/10">
                    <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-linear-to-br from-blue-50 to-sky-50 text-blue-700">
                      <Ico className="h-7 w-7" />
                    </span>
                    <h3 className="mt-5 text-lg font-bold text-slate-900">
                      {p.titulo}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                      {p.texto}
                    </p>
                    <span className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                      {p.cita}
                    </span>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ 5 · EN NÚMEROS ============ */}
      <section className="relative isolate overflow-hidden bg-linear-to-br from-blue-950 via-blue-900 to-blue-800 py-20 text-white sm:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(56,189,248,0.16),transparent_45%)]"
        />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
                La escuela en números
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Creciendo en la música
              </h2>
            </div>
          </Reveal>
          <div className="mt-14 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {CIFRAS.map((c, i) => {
              const Ico = ICONS[c.icon];
              return (
                <Reveal key={c.label} delay={(i % 4) * 80}>
                  <div className="h-full rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur-sm transition-colors hover:bg-white/10 sm:p-8">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-400/15 text-sky-300 ring-1 ring-sky-300/20">
                      <Ico className="h-6 w-6" />
                    </span>
                    <AnimatedCounter
                      value={c.valor}
                      prefix={c.prefix}
                      suffix={c.suffix}
                      className="mt-5 block text-4xl font-bold tracking-tight sm:text-5xl"
                    />
                    <p className="mt-1 text-sm font-medium text-sky-100/80">
                      {c.label}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ 6 · RUTA DE APRENDIZAJE ============ */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="Tu camino"
              titulo="Ruta de aprendizaje"
              subtitulo="Un paso a la vez, desde cero hasta servir en la alabanza de la iglesia."
            />
          </Reveal>
          <Reveal delay={120}>
            <ol className="mt-14 flex flex-wrap items-start justify-center gap-x-1 gap-y-8">
              {RUTA.map((n, i) => {
                const Ico = ICONS[n.icon];
                return (
                  <li key={n.titulo} className="flex items-center">
                    <div className="flex w-40 flex-col items-center px-2 text-center">
                      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-linear-to-br from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-600/25">
                        <Ico className="h-6 w-6" />
                      </span>
                      <span className="mt-3 text-[11px] font-bold uppercase tracking-wider text-sky-500">
                        Nivel {i + 1}
                      </span>
                      <p className="text-sm font-bold text-slate-800">
                        {n.titulo}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">
                        {n.texto}
                      </p>
                    </div>
                    {i < RUTA.length - 1 && (
                      <ChevronRight
                        aria-hidden
                        className="mt-4 hidden h-5 w-5 shrink-0 text-slate-300 sm:block"
                      />
                    )}
                  </li>
                );
              })}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* ============ 7 · PROFESOR ============ */}
      <section className="bg-blue-50/40 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="Nuestro equipo"
              titulo="Quién te enseña"
              subtitulo={data.lema}
            />
          </Reveal>
          <div className="mx-auto mt-14 grid max-w-md grid-cols-1 gap-6">
            {equipo.map((p, i) => (
              <Reveal key={p.nombre} delay={i * 80}>
                <PersonCard
                  nombre={p.nombre}
                  cargo={p.cargo}
                  imageUrl={p.foto}
                  descripcion={p.descripcion}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 8 · HORARIO ============ */}
      {data.horarioTexto && (
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <Reveal>
              <div className="relative isolate overflow-hidden rounded-3xl bg-linear-to-br from-blue-900 to-blue-700 p-8 text-white shadow-xl sm:p-12">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.12),transparent_45%)]"
                />
                <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                      <CalendarIcon className="h-6 w-6" />
                    </span>
                    <h3 className="mt-5 text-2xl font-bold">Horario de clases</h3>
                    <p className="mt-2 max-w-md text-sky-100/85">
                      Te esperamos cada semana para aprender y crecer juntos en
                      la música y en la fe.
                    </p>
                  </div>
                  <p className="inline-flex shrink-0 rounded-2xl bg-white/10 px-6 py-4 text-xl font-bold ring-1 ring-white/15 sm:text-2xl">
                    {data.horarioTexto}
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ============ 9 · AVANCES DE LOS ALUMNOS ============ */}
      {data.avances && data.avances.length > 0 && (
        <section className="bg-background py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <Reveal>
              <SectionHeader
                eyebrow="Avances"
                titulo="El progreso de nuestros alumnos"
                subtitulo="Documentamos cómo Dios desarrolla los dones de cada estudiante."
              />
            </Reveal>
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {data.avances.map((av, i) => (
                <Reveal key={av.titulo} delay={i * 90}>
                  <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-600/10">
                    <div className="grid aspect-4/3 place-items-center bg-linear-to-br from-blue-100 to-sky-100 text-blue-300">
                      <MusicIcon className="h-12 w-12 transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="text-lg font-bold text-slate-900">
                        {av.titulo}
                      </h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                        {av.nota}
                      </p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ 10 · REQUISITOS ============ */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="Antes de empezar"
              titulo="¿Qué necesitas?"
              subtitulo="Requisitos sencillos: lo esencial es el compromiso y las ganas de servir."
            />
          </Reveal>
          <ul className="mx-auto mt-12 max-w-2xl space-y-3">
            {REQUISITOS.map((req, i) => (
              <Reveal key={req} delay={(i % 4) * 70}>
                <li className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                    <CheckIcon className="h-4.5 w-4.5" />
                  </span>
                  <p className="text-sm leading-relaxed text-slate-700">{req}</p>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ 11 · GALERÍA ============ */}
      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="Galería"
              titulo="Aprendiendo juntos"
              subtitulo="Clases, prácticas y presentaciones de nuestros alumnos."
            />
          </Reveal>
          <Reveal delay={120} className="mt-12">
            <GaleriaCategorias fotos={GALERIA_MUSICA} />
          </Reveal>
        </div>
      </section>

      {/* ============ 12 · INSCRÍBETE ============ */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <div className="relative isolate overflow-hidden rounded-3xl bg-linear-to-br from-blue-700 to-sky-600 px-8 py-14 text-center text-white shadow-xl sm:px-16 sm:py-16">
              <div
                aria-hidden
                className="animate-shimmer pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_50%)]"
              />
              <div className="relative">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/25">
                  <MusicIcon className="h-7 w-7" />
                </span>
                <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
                  {UNETE.titulo}
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-sky-50/95">
                  {UNETE.texto}
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-2.5">
                  {APRENDER.map((o) => {
                    const Ico = ICONS[o.icon];
                    return (
                      <span
                        key={o.nombre}
                        className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/20 backdrop-blur-sm"
                      >
                        <Ico className="h-4 w-4" />
                        {o.nombre}
                      </span>
                    );
                  })}
                </div>
                <a
                  href={UNETE.cta.href}
                  className="mt-9 inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-blue-700 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-sky-50"
                >
                  {UNETE.cta.label}
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ 13 · VERSÍCULO ============ */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <Reveal>
            <figure className="relative isolate overflow-hidden rounded-3xl bg-linear-to-br from-blue-950 via-blue-800 to-sky-700 p-10 text-center text-white shadow-xl sm:p-16">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.12),transparent_55%)]"
              />
              <MusicIcon
                aria-hidden
                className="animate-float-slow pointer-events-none absolute -bottom-10 -right-10 h-56 w-56 text-white/5"
              />
              <div className="relative">
                <span
                  aria-hidden
                  className="font-serif text-6xl leading-none text-sky-300/60"
                >
                  “
                </span>
                <blockquote className="-mt-4 font-serif text-2xl font-medium italic leading-relaxed text-sky-50 sm:text-3xl">
                  {VERSICULO.texto}
                </blockquote>
                <figcaption className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-sky-200">
                  {VERSICULO.cita} · Reina-Valera 1960
                </figcaption>
              </div>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* ============ 14 · PREGUNTAS FRECUENTES ============ */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="Preguntas frecuentes"
              titulo="Resolvemos tus dudas"
              subtitulo="Lo que más nos consultan sobre las clases de música."
            />
          </Reveal>
          <FaqAccordion items={FAQ} />
        </div>
      </section>

      {/* ============ 15 · CTA FINAL ============ */}
      <CtaFinal
        animated
        titulo="Que tu talento sea para la gloria de Dios"
        texto="Aprende, crece y sirve. En la Escuela de Música hay un lugar para ti, sin importar tu edad ni tu nivel. Ven y desarrolla tus dones para el Señor."
        primaryCta={{ label: "Cómo llegar", href: s.mapsUrl, external: true }}
        secondaryCta={{ label: "Petición de oración", href: "/oracion-peticion" }}
      />
    </>
  );
}
