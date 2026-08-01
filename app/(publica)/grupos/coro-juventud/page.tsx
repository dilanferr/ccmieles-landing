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
import { ICONS, CalendarIcon, CheckIcon, MusicIcon } from "@/app/components/icons";
import {
  NAV_GRUPOS,
  getGrupo,
  CANCIONERO,
  REGLAMENTO_CORO,
} from "@/app/data/iglesia";
import { getSettings } from "@/src/utils/settings";
import {
  HERO,
  MISION,
  AREAS,
  PILARES,
  CIFRAS,
  ENSAYOS,
  EQUIPO_BIOS,
  FORMAS_SERVIR,
  GALERIA_CORO,
  UNETE,
  VERSICULOS,
  FAQ,
} from "@/app/data/coro";

export const metadata: Metadata = {
  title: "Grupo Coro y Juventud",
  description:
    "El ministerio de Coro y Juventud del Centro Cristiano Mieles guía la adoración congregacional y forma a las nuevas generaciones en el amor por la música consagrada y el servicio a Dios.",
  keywords: [
    "coro cristiano Quilicura",
    "ministerio de alabanza",
    "adoración Centro Cristiano Mieles",
    "jóvenes cristianos Santiago",
    "escuela de música iglesia",
  ],
  alternates: { canonical: "/grupos/coro-juventud" },
};

export const revalidate = 60;

export default async function CoroJuventudPage() {
  const data = getGrupo("coro-juventud")!;
  const s = await getSettings();
  const MisionIcon = ICONS[MISION.icon];

  const equipo = data.personas.map((p) => ({
    ...p,
    descripcion: EQUIPO_BIOS[p.nombre],
  }));

  return (
    <>
      {/* ============ 1 · HERO — tarjeta de adoración (glass) ============ */}
      <PageHeader
        bgPublicId="coro"
        eyebrow="Grupos y Ministerios"
        titulo={data.titulo}
        descripcion="Guiamos la adoración de la iglesia y formamos a las nuevas generaciones en el amor por la música consagrada y el servicio al Señor."
        primaryCta={{ label: "Cómo llegar", href: s.mapsUrl, external: true }}
        secondaryCta={{ label: "Quiero servir", href: UNETE.cta.href }}
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
        activeHref="/grupos/coro-juventud"
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

      {/* ============ 3 · ¿QUÉ HACEMOS? — áreas ============ */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="¿Qué hacemos?"
              titulo="Así servimos al Señor"
              subtitulo="Adoración, formación y servicio para exaltar a Cristo y edificar a la iglesia."
            />
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {AREAS.map((a, i) => {
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

      {/* ============ 4 · PILARES DE LA ADORACIÓN ============ */}
      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="Fundamento bíblico"
              titulo="Pilares de nuestra adoración"
              subtitulo="No adoramos por costumbre, sino conforme a la Palabra de Dios."
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
                Nuestro servicio en números
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Fieles en la alabanza
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

      {/* ============ 6 · EQUIPO ============ */}
      <section className="bg-blue-50/40 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="Nuestro equipo"
              titulo="Directiva e integrantes"
              subtitulo={data.lema}
            />
          </Reveal>
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {equipo.map((p, i) => (
              <Reveal key={p.nombre} delay={(i % 4) * 80}>
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

      {/* ============ 7 · ENSAYOS ============ */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="Nuestra semana"
              titulo="Ensayos y servicio"
              subtitulo="La constancia en el ensayo es parte de servir con excelencia a Dios."
            />
          </Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {ENSAYOS.map((e, i) => {
              const Ico = ICONS[e.icon];
              return (
                <Reveal key={`${e.dia}-${e.actividad}`} delay={i * 90}>
                  <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-600/10">
                    <div className="flex items-center gap-4">
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-blue-900 to-blue-700 text-white shadow-md">
                        <Ico className="h-6 w-6" />
                      </span>
                      <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-700">
                        {e.dia}
                      </p>
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-slate-900">
                      {e.actividad}
                    </h3>
                    <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
                      <CalendarIcon className="h-4 w-4 text-sky-500" />
                      {e.hora}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ 8 · REPERTORIO (cancionero) ============ */}
      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="Repertorio"
              titulo="Cantos de adoración"
              subtitulo="Himnos y cánticos con los que exaltamos el nombre del Señor."
            />
          </Reveal>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CANCIONERO.map((c, i) => (
              <Reveal key={c.titulo} delay={(i % 3) * 70}>
                <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-600/10">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-linear-to-br from-blue-50 to-sky-50 text-blue-700">
                    <MusicIcon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-slate-900">
                      {c.titulo}
                    </p>
                    <p className="truncate text-xs text-slate-500">{c.autor}</p>
                  </div>
                  {c.tono && (
                    <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                      {c.tono}
                    </span>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 9 · REGLAMENTO DEL CORO ============ */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="Compromiso"
              titulo="Reglamento del coro"
              subtitulo="Servir en la casa de Dios es un privilegio que honramos con orden y consagración."
            />
          </Reveal>
          <ul className="mx-auto mt-12 max-w-2xl space-y-3">
            {REGLAMENTO_CORO.map((regla, i) => (
              <Reveal key={regla} delay={(i % 6) * 60}>
                <li className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                    <CheckIcon className="h-4.5 w-4.5" />
                  </span>
                  <p className="text-sm leading-relaxed text-slate-700">
                    {regla}
                  </p>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ 10 · GALERÍA ============ */}
      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="Galería"
              titulo="Momentos de adoración"
              subtitulo="Ensayos, cultos y actividades donde alabamos juntos al Señor."
            />
          </Reveal>
          <Reveal delay={120} className="mt-12">
            <GaleriaCategorias fotos={GALERIA_CORO} />
          </Reveal>
        </div>
      </section>

      {/* ============ 11 · ÚNETE ============ */}
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
                  {FORMAS_SERVIR.map((f) => {
                    const Ico = ICONS[f.icon];
                    return (
                      <span
                        key={f.nombre}
                        className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/20 backdrop-blur-sm"
                      >
                        <Ico className="h-4 w-4" />
                        {f.nombre}
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

      {/* ============ 12 · VERSÍCULOS ============ */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            {VERSICULOS.map((v, i) => (
              <Reveal key={v.cita} delay={i * 120}>
                <figure className="relative isolate flex h-full flex-col overflow-hidden rounded-3xl bg-linear-to-br from-blue-950 via-blue-800 to-sky-700 p-8 text-center text-white shadow-xl sm:p-10">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.12),transparent_55%)]"
                  />
                  <MusicIcon
                    aria-hidden
                    className="animate-float-slow pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 text-white/5"
                  />
                  <div className="relative flex flex-1 flex-col">
                    <span
                      aria-hidden
                      className="font-serif text-6xl leading-none text-sky-300/60"
                    >
                      “
                    </span>
                    <blockquote className="-mt-4 flex-1 font-serif text-lg font-medium italic leading-relaxed text-sky-50 sm:text-xl">
                      {v.texto}
                    </blockquote>
                    <figcaption className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-sky-200">
                      {v.cita} · Reina-Valera 1960
                    </figcaption>
                  </div>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 13 · PREGUNTAS FRECUENTES ============ */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="Preguntas frecuentes"
              titulo="Resolvemos tus dudas"
              subtitulo="Lo que más nos consultan sobre servir en el coro y la juventud."
            />
          </Reveal>
          <FaqAccordion items={FAQ} />
        </div>
      </section>

      {/* ============ 14 · CTA FINAL ============ */}
      <CtaFinal
        animated
        titulo="Ven y adora al Señor con nosotros"
        texto="Dios busca adoradores que le adoren en espíritu y en verdad. Hay un lugar para ti en la alabanza y la juventud del Centro Cristiano Mieles."
        primaryCta={{ label: "Cómo llegar", href: s.mapsUrl, external: true }}
        secondaryCta={{ label: "Petición de oración", href: "/oracion-peticion" }}
      />
    </>
  );
}
