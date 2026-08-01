import type { Metadata } from "next";
import PageHeader from "@/app/components/PageHeader";
import MinisteriosNav from "@/app/components/MinisteriosNav";
import SectionHeader from "@/app/components/SectionHeader";
import Reveal from "@/app/components/Reveal";
import AnimatedCounter from "@/app/components/AnimatedCounter";
import PersonCard from "@/app/components/PersonCard";
import FaqAccordion from "@/app/components/ministry/FaqAccordion";
import CtaFinal from "@/app/components/ministry/CtaFinal";
import { ICONS, ChurchIcon } from "@/app/components/icons";
import { NAV_GRUPOS, getGrupo } from "@/app/data/iglesia";
import { getSettings } from "@/src/utils/settings";
import {
  HERO,
  MISION,
  AREAS,
  CORAZON,
  PILARES,
  CIFRAS,
  EQUIPO_BIOS,
  ACOMPANAMIENTO,
  UNETE,
  FAQ,
} from "@/app/data/ministerial";

export const metadata: Metadata = {
  title: "Cuerpo Ministerial",
  description:
    "El Cuerpo Ministerial del Centro Cristiano Mieles dirige espiritual y administrativamente la obra, velando por la sana doctrina y el cuidado del rebaño del Señor. Conoce a los pastores y líderes de la iglesia.",
  keywords: [
    "cuerpo ministerial",
    "pastores Centro Cristiano Mieles",
    "liderazgo iglesia Quilicura",
    "gobierno de la iglesia",
    "Obispo Juan Acosta",
  ],
  alternates: { canonical: "/grupos/cuerpo-ministerial" },
};

export const revalidate = 60;

export default async function CuerpoMinisterialPage() {
  const data = getGrupo("cuerpo-ministerial")!;
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
        descripcion="El liderazgo que pastorea la visión de la iglesia, velando por la sana doctrina y el cuidado del rebaño del Señor."
        primaryCta={{ label: "Cómo llegar", href: s.mapsUrl, external: true }}
        secondaryCta={{ label: "Petición de oración", href: UNETE.cta.href }}
        aside={
          <div>
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/15 text-white ring-1 ring-white/20">
                <ChurchIcon className="h-7 w-7" />
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
        activeHref="/grupos/cuerpo-ministerial"
      />

      {/* ============ 2 · NUESTRO LLAMADO ============ */}
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
              eyebrow="Nuestra labor"
              titulo="Cómo servimos a la iglesia"
              subtitulo="Dirección espiritual y administrativa al servicio del rebaño del Señor."
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

      {/* ============ 4 · EL CORAZÓN DEL PASTOR ============ */}
      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Reveal>
              <div>
                <span className="eyebrow">{CORAZON.eyebrow}</span>
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  {CORAZON.titulo}
                </h2>
                <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-600">
                  {CORAZON.parrafos.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
                <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-bold text-blue-700">
                  {CORAZON.cita}
                </span>
              </div>
            </Reveal>
            <Reveal delay={150}>
              <figure className="relative isolate overflow-hidden rounded-3xl bg-linear-to-br from-blue-950 via-blue-800 to-sky-700 p-10 text-center text-white shadow-xl sm:p-14">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.12),transparent_55%)]"
                />
                <ChurchIcon
                  aria-hidden
                  className="animate-float-slow pointer-events-none absolute -bottom-8 -right-8 h-48 w-48 text-white/5"
                />
                <div className="relative">
                  <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                    <ChurchIcon className="h-8 w-8" />
                  </span>
                  <blockquote className="mt-6 font-serif text-xl font-medium italic leading-relaxed text-sky-50 sm:text-2xl">
                    {data.versiculo?.texto ??
                      "Apacentad la grey de Dios que está entre vosotros."}
                  </blockquote>
                  <figcaption className="mt-5 text-xs font-bold uppercase tracking-[0.25em] text-sky-200">
                    {data.versiculo?.cita ?? "1 Pedro 5:2"} · Reina-Valera 1960
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
              subtitulo="Un liderazgo que se sujeta a la Palabra y rinde cuentas a Dios."
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
                Fieles en el llamado
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Sirviendo a la familia de la fe
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

      {/* ============ 7 · LIDERAZGO / EQUIPO ============ */}
      <section className="bg-blue-50/40 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="Nuestro liderazgo"
              titulo="Pastores y directiva"
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

      {/* ============ 8 · CUENTA CON NOSOTROS ============ */}
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
                  <ChurchIcon className="h-7 w-7" />
                </span>
                <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
                  {UNETE.titulo}
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-sky-50/95">
                  {UNETE.texto}
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-2.5">
                  {ACOMPANAMIENTO.map((o) => {
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

      {/* ============ 9 · PREGUNTAS FRECUENTES ============ */}
      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="Preguntas frecuentes"
              titulo="Resolvemos tus dudas"
              subtitulo="Lo que más consultan sobre el liderazgo y la vida de la iglesia."
            />
          </Reveal>
          <FaqAccordion items={FAQ} />
        </div>
      </section>

      {/* ============ 10 · CTA FINAL ============ */}
      <CtaFinal
        animated
        titulo="Te esperamos en la familia de la fe"
        texto="Las puertas del Centro Cristiano Mieles están abiertas para ti y tu familia. Ven y sé parte de lo que Dios está haciendo entre nosotros."
        primaryCta={{ label: "Cómo llegar", href: s.mapsUrl, external: true }}
        secondaryCta={{ label: "Petición de oración", href: "/oracion-peticion" }}
      />
    </>
  );
}
