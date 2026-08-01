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
import { ICONS, CalendarIcon, HeartIcon } from "@/app/components/icons";
import { NAV_GRUPOS, getGrupo } from "@/app/data/iglesia";
import { getSettings } from "@/src/utils/settings";
import {
  HERO,
  MISION,
  AREAS,
  QUIEN_DORCAS,
  PILARES,
  CIFRAS,
  REUNIONES,
  EQUIPO_BIOS,
  FORMAS_SERVIR,
  GALERIA_DORCAS,
  UNETE,
  VERSICULO,
  FAQ,
} from "@/app/data/dorcas";

export const metadata: Metadata = {
  title: "Grupo Dorcas",
  description:
    "El Grupo Dorcas del Centro Cristiano Mieles reúne a las mujeres al servicio de Dios y de la comunidad. Inspiradas en el ejemplo de Dorcas (Hechos 9), sirven con amor a través de obras de misericordia, visitas y oración.",
  keywords: [
    "ministerio femenino cristiano",
    "grupo Dorcas iglesia Quilicura",
    "mujeres cristianas servicio",
    "obras de misericordia",
    "Centro Cristiano Mieles",
  ],
  alternates: { canonical: "/grupos/ministerio-femenino" },
};

export const revalidate = 60;

export default async function GrupoDorcasPage() {
  const data = getGrupo("ministerio-femenino")!;
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
        descripcion="Inspiradas en el ejemplo de Dorcas, las hermanas sirven con amor a la iglesia y a los más necesitados a través de obras de misericordia."
        primaryCta={{ label: "Cómo llegar", href: s.mapsUrl, external: true }}
        secondaryCta={{ label: "Quiero servir", href: UNETE.cta.href }}
        aside={
          <div>
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/15 text-white ring-1 ring-white/20">
                <HeartIcon className="h-7 w-7" />
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
        activeHref="/grupos/ministerio-femenino"
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

      {/* ============ 3 · ¿QUÉ HACEMOS? ============ */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="¿Qué hacemos?"
              titulo="Así servimos con amor"
              subtitulo="Nuestra fe se hace visible en manos dispuestas a bendecir a otros."
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

      {/* ============ 4 · QUIÉN FUE DORCAS ============ */}
      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Reveal>
              <div>
                <span className="eyebrow">{QUIEN_DORCAS.eyebrow}</span>
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  {QUIEN_DORCAS.titulo}
                </h2>
                <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-600">
                  {QUIEN_DORCAS.parrafos.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
                <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-bold text-blue-700">
                  {QUIEN_DORCAS.cita}
                </span>
              </div>
            </Reveal>
            <Reveal delay={150}>
              <figure className="relative isolate overflow-hidden rounded-3xl bg-linear-to-br from-blue-950 via-blue-800 to-sky-700 p-10 text-center text-white shadow-xl sm:p-14">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.12),transparent_55%)]"
                />
                <HeartIcon
                  aria-hidden
                  className="animate-float-slow pointer-events-none absolute -bottom-8 -right-8 h-48 w-48 text-white/5"
                />
                <div className="relative">
                  <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                    <HeartIcon className="h-8 w-8" />
                  </span>
                  <blockquote className="mt-6 font-serif text-xl font-medium italic leading-relaxed text-sky-50 sm:text-2xl">
                    «Esta abundaba en buenas obras y en limosnas que hacía.»
                  </blockquote>
                  <figcaption className="mt-5 text-xs font-bold uppercase tracking-[0.25em] text-sky-200">
                    Hechos 9:36 · Reina-Valera 1960
                  </figcaption>
                </div>
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ 5 · PILARES ============ */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="Fundamento bíblico"
              titulo="Los pilares de nuestro servicio"
              subtitulo="Una fe viva que se demuestra en el amor y las buenas obras."
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

      {/* ============ 6 · EN NÚMEROS ============ */}
      <section className="relative isolate overflow-hidden bg-linear-to-br from-blue-950 via-blue-900 to-blue-800 py-20 text-white sm:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(56,189,248,0.16),transparent_45%)]"
        />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
                El fruto del servicio
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Amor que se hace obra
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

      {/* ============ 7 · DIRECTIVA / EQUIPO ============ */}
      <section className="bg-blue-50/40 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="Nuestro equipo"
              titulo="Directiva del Grupo Dorcas"
              subtitulo={data.lema}
            />
          </Reveal>
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {equipo.map((p, i) => (
              <Reveal key={p.nombre} delay={(i % 3) * 80}>
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

      {/* ============ 8 · REUNIONES ============ */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="Nuestra semana"
              titulo="Cuándo servimos"
              subtitulo="Momentos de adoración, comunión y servicio a la comunidad."
            />
          </Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {REUNIONES.map((r, i) => {
              const Ico = ICONS[r.icon];
              return (
                <Reveal key={r.titulo} delay={i * 90}>
                  <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-600/10">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-blue-900 to-blue-700 text-white shadow-md">
                      <Ico className="h-6 w-6" />
                    </span>
                    <h3 className="mt-5 text-lg font-bold text-slate-900">
                      {r.titulo}
                    </h3>
                    <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
                      <CalendarIcon className="h-4 w-4 text-sky-500" />
                      {r.cuando}
                    </p>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                      {r.detalle}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ 9 · GALERÍA ============ */}
      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="Galería"
              titulo="Manos que sirven con amor"
              subtitulo="Momentos de servicio, comunión y adoración de nuestras hermanas."
            />
          </Reveal>
          <Reveal delay={120} className="mt-12">
            <GaleriaCategorias fotos={GALERIA_DORCAS} />
          </Reveal>
        </div>
      </section>

      {/* ============ 10 · ÚNETE ============ */}
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
                  <HeartIcon className="h-7 w-7" />
                </span>
                <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
                  {UNETE.titulo}
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-sky-50/95">
                  {UNETE.texto}
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-2.5">
                  {FORMAS_SERVIR.map((o) => {
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

      {/* ============ 11 · VERSÍCULO ============ */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <Reveal>
            <figure className="relative isolate overflow-hidden rounded-3xl bg-linear-to-br from-blue-950 via-blue-800 to-sky-700 p-10 text-center text-white shadow-xl sm:p-16">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.12),transparent_55%)]"
              />
              <HeartIcon
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

      {/* ============ 12 · PREGUNTAS FRECUENTES ============ */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="Preguntas frecuentes"
              titulo="Resolvemos tus dudas"
              subtitulo="Lo que más consultan sobre el Grupo Dorcas."
            />
          </Reveal>
          <FaqAccordion items={FAQ} />
        </div>
      </section>

      {/* ============ 13 · CTA FINAL ============ */}
      <CtaFinal
        animated
        titulo="Sé parte de las manos que Dios usa"
        texto="En el Grupo Dorcas, cada gesto de amor es una semilla del Reino. Ven y sirve al Señor bendiciendo a la iglesia y a la comunidad."
        primaryCta={{ label: "Cómo llegar", href: s.mapsUrl, external: true }}
        secondaryCta={{ label: "Petición de oración", href: "/oracion-peticion" }}
      />
    </>
  );
}
