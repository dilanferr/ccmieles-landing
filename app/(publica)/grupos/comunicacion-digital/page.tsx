import type { Metadata } from "next";
import PageHeader from "@/app/components/PageHeader";
import MinisteriosNav from "@/app/components/MinisteriosNav";
import SectionHeader from "@/app/components/SectionHeader";
import Reveal from "@/app/components/Reveal";
import AnimatedCounter from "@/app/components/AnimatedCounter";
import EquipoDigital from "@/app/components/ministry/EquipoDigital";
import GaleriaCategorias from "@/app/components/ministry/GaleriaCategorias";
import FaqAccordion from "@/app/components/ministry/FaqAccordion";
import CtaFinal from "@/app/components/ministry/CtaFinal";
import {
  ICONS,
  ChevronRight,
  GlobeIcon,
  CalendarIcon,
} from "@/app/components/icons";
import { BRAND_LOGOS } from "@/app/components/brand-logos";
import { NAV_GRUPOS, getGrupo } from "@/app/data/iglesia";
import { getSettings } from "@/src/utils/settings";
import {
  HERO,
  MISION,
  SERVICIOS,
  IMPACTO,
  PROYECTOS,
  ESTADO_INFO,
  TECNOLOGIAS,
  EQUIPO_INFO,
  GALERIA_COMUNICACION,
  COBERTURA_SEMANAL,
  FLUJO,
  REDES,
  ESPECIALIDADES,
  UNETE,
  VERSICULO_COMUNICACION,
  FAQ,
} from "@/app/data/comunicacion";

export const metadata: Metadata = {
  title: "Departamento de Comunicación Digital",
  description:
    "El Departamento de Comunicación Digital del Centro Cristiano Mieles lleva el mensaje de Jesucristo más allá de las paredes del templo: transmisiones en vivo, redes sociales, diseño, desarrollo web, fotografía y evangelismo digital.",
  keywords: [
    "comunicación digital iglesia",
    "streaming iglesia Quilicura",
    "evangelismo digital",
    "redes sociales cristianas",
    "Centro Cristiano Mieles",
  ],
  alternates: { canonical: "/grupos/comunicacion-digital" },
};

export const revalidate = 60;

export default async function ComunicacionDigitalPage() {
  const data = getGrupo("comunicacion-digital")!;
  const s = await getSettings();
  const MisionIcon = ICONS[MISION.icon];
  const RocketIcon = ICONS.rocket;

  // Cruzamos las personas (foto + cargo desde iglesia.ts) con su info extra
  // (bio, especialidad, correo) para no duplicar los datos de cada integrante.
  const equipo = data.personas.map((p) => ({ ...p, ...EQUIPO_INFO[p.nombre] }));

  return (
    <>
      {/* ============ 1 · HERO — dashboard de estado (glassmorphism) ============ */}
      <PageHeader
        eyebrow="Grupos y Ministerios"
        titulo={data.titulo}
        descripcion="Mantenemos toda la presencia digital de la iglesia: transmisiones, redes, diseño, web y producción, sirviendo con excelencia para alcanzar nuevas vidas."
        primaryCta={{ label: "Cómo llegar", href: s.mapsUrl, external: true }}
        secondaryCta={{ label: "Quiero servir", href: UNETE.cta.href }}
        aside={
          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-200">
                Estado del departamento
              </p>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-300 ring-1 ring-emerald-300/30">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                {HERO.estado}
              </span>
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
        activeHref="/grupos/comunicacion-digital"
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
              titulo="Nuestros servicios"
              subtitulo="Cada frente pone la tecnología al servicio del evangelio y de la iglesia."
            />
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {SERVICIOS.map((serv, i) => {
              const Ico = ICONS[serv.icon];
              return (
                <Reveal key={serv.titulo} delay={(i % 5) * 70}>
                  <article className="group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-600/10">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-linear-to-br from-blue-50 to-sky-50 text-blue-700 transition-transform group-hover:scale-110">
                      <Ico className="h-6 w-6" />
                    </span>
                    <h3 className="mt-4 text-base font-bold text-slate-900">
                      {serv.titulo}
                    </h3>
                    <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-600">
                      {serv.texto}
                    </p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ 4 · NUESTRO IMPACTO (dashboard) ============ */}
      <section className="relative isolate overflow-hidden bg-linear-to-br from-blue-950 via-blue-900 to-blue-800 py-20 text-white sm:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(56,189,248,0.16),transparent_45%)]"
        />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
                Nuestro impacto
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                El fruto de servir con excelencia
              </h2>
            </div>
          </Reveal>
          <div className="mt-14 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
            {IMPACTO.map((m, i) => {
              const Ico = ICONS[m.icon];
              return (
                <Reveal key={m.label} delay={(i % 3) * 90}>
                  <div className="h-full rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur-sm transition-colors hover:bg-white/10 sm:p-8">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-400/15 text-sky-300 ring-1 ring-sky-300/20">
                      <Ico className="h-6 w-6" />
                    </span>
                    <AnimatedCounter
                      value={m.valor}
                      prefix={m.prefix}
                      suffix={m.suffix}
                      className="mt-5 block text-4xl font-bold tracking-tight sm:text-5xl"
                    />
                    <p className="mt-1 text-sm font-medium text-sky-100/80">
                      {m.label}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ 5 · PROYECTOS ============ */}
      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="Proyectos"
              titulo="Lo que estamos construyendo"
              subtitulo="Iniciativas para servir mejor a la congregación y alcanzar nuevas vidas."
            />
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PROYECTOS.map((proy, i) => {
              const Ico = ICONS[proy.icon];
              const est = ESTADO_INFO[proy.estado];
              return (
                <Reveal key={proy.nombre} delay={(i % 3) * 80}>
                  <article className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-600/10">
                    <div className="flex items-start justify-between gap-3">
                      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-linear-to-br from-blue-50 to-sky-50 text-blue-700">
                        <Ico className="h-6 w-6" />
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${est.badge}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${est.dot}`} />
                        {est.label}
                      </span>
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-slate-900">
                      {proy.nombre}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                      {proy.descripcion}
                    </p>

                    <div className="mt-5">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                        <span>Progreso</span>
                        <span>{proy.progreso}%</span>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full bg-linear-to-r ${est.barra}`}
                          style={{ width: `${proy.progreso}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarIcon className="h-3.5 w-3.5 text-sky-500" />
                        {proy.fecha}
                      </span>
                      <span className="truncate font-medium text-slate-600">
                        {proy.responsable}
                      </span>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ 6 · TECNOLOGÍAS (badges) ============ */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="Tecnologías"
              titulo="Con qué trabajamos"
              subtitulo="El stack que usamos para crear, transmitir y publicar con excelencia."
            />
          </Reveal>
          <div className="mt-14 flex flex-wrap justify-center gap-3">
            {TECNOLOGIAS.map((t, i) => {
              const Logo = BRAND_LOGOS[t.logo];
              return (
                <Reveal key={t.nombre} delay={(i % 6) * 50}>
                  <span className="inline-flex items-center gap-2.5 rounded-full border border-slate-200 bg-white px-5 py-2.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
                    <Logo
                      className="h-5 w-5"
                      role="img"
                      aria-label={`Logo de ${t.nombre}`}
                    />
                    <span className="text-sm font-semibold text-slate-700">
                      {t.nombre}
                    </span>
                  </span>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ 7 · EQUIPO ============ */}
      <EquipoDigital personas={equipo} />

      {/* ============ 8 · GALERÍA ============ */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="Galería"
              titulo="Momentos que registramos"
              subtitulo="Un vistazo a la vida de la iglesia a través de nuestra cámara."
            />
          </Reveal>
          <Reveal delay={120} className="mt-12">
            <GaleriaCategorias fotos={GALERIA_COMUNICACION} />
          </Reveal>
        </div>
      </section>

      {/* ============ 9 · CALENDARIO DE COBERTURA ============ */}
      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="Calendario de cobertura"
              titulo="Nuestra semana de servicio"
              subtitulo="Cada culto tiene detrás un equipo que lo registra y lo transmite."
            />
          </Reveal>
          <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {COBERTURA_SEMANAL.map((c, i) => (
              <Reveal key={c.dia} delay={(i % 4) * 90}>
                <li className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-600/10">
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-700">
                    {c.dia}
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-slate-900">
                    {c.actividad}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                    {c.detalle}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {c.equipos.map((eq) => {
                      const Ico = ICONS[eq.icon];
                      return (
                        <span
                          key={eq.label}
                          className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700"
                        >
                          <Ico className="h-3.5 w-3.5" />
                          {eq.label}
                        </span>
                      );
                    })}
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ============ 10 · FLUJO DE TRABAJO ============ */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="Cómo trabajamos"
              titulo="Nuestro flujo de trabajo"
              subtitulo="De la solicitud a la publicación, con orden y excelencia en cada paso."
            />
          </Reveal>
          <Reveal delay={120}>
            <ol className="mt-14 flex flex-wrap items-start justify-center gap-x-1 gap-y-8">
              {FLUJO.map((paso, i) => {
                const Ico = ICONS[paso.icon];
                return (
                  <li key={paso.titulo} className="flex items-center">
                    <div className="flex w-24 flex-col items-center text-center sm:w-28">
                      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-linear-to-br from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-600/25">
                        <Ico className="h-6 w-6" />
                      </span>
                      <span className="mt-3 text-[11px] font-bold uppercase tracking-wider text-sky-500">
                        Paso {i + 1}
                      </span>
                      <p className="text-sm font-semibold text-slate-800">
                        {paso.titulo}
                      </p>
                    </div>
                    {i < FLUJO.length - 1 && (
                      <ChevronRight
                        aria-hidden
                        className="hidden h-5 w-5 shrink-0 text-slate-300 sm:block"
                      />
                    )}
                  </li>
                );
              })}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* ============ 11 · REDES SOCIALES ============ */}
      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
            <SectionHeader
              eyebrow="Presencia digital"
              titulo="Nuestras redes sociales"
              subtitulo="Síguenos y comparte: cada publicación es una semilla del evangelio."
            />
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {REDES.map((r, i) => {
              const Logo = BRAND_LOGOS[r.logo];
              const externa = r.url.startsWith("http");
              return (
                <Reveal key={r.nombre} delay={(i % 3) * 80}>
                  <a
                    href={r.url}
                    target={externa ? "_blank" : undefined}
                    rel={externa ? "noopener noreferrer" : undefined}
                    className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1.5 hover:shadow-xl hover:shadow-blue-600/10"
                  >
                    <div
                      className={`flex items-center gap-3 bg-linear-to-br ${r.color} p-5 text-white`}
                    >
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white shadow-sm">
                        <Logo
                          className="h-7 w-7"
                          role="img"
                          aria-label={r.nombre}
                        />
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold">{r.nombre}</p>
                        <p className="truncate text-xs text-white/80">
                          {r.handle}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-1 items-end justify-between gap-2 p-5">
                      <div>
                        <p className="text-2xl font-bold text-slate-900">
                          {r.seguidores}
                        </p>
                        <p className="text-xs text-slate-500">
                          Seguidores · {r.ultima}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors group-hover:bg-blue-100">
                        Visitar <span aria-hidden>→</span>
                      </span>
                    </div>
                  </a>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ 12 · ÚNETE AL EQUIPO ============ */}
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
                  <RocketIcon className="h-7 w-7" />
                </span>
                <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
                  {UNETE.titulo}
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-sky-50/95">
                  {UNETE.texto}
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-2.5">
                  {ESPECIALIDADES.map((e) => {
                    const Ico = ICONS[e.icon];
                    return (
                      <span
                        key={e.nombre}
                        className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/20 backdrop-blur-sm"
                      >
                        <Ico className="h-4 w-4" />
                        {e.nombre}
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
              <GlobeIcon
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
                  {VERSICULO_COMUNICACION.texto}
                </blockquote>
                <figcaption className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-sky-200">
                  {VERSICULO_COMUNICACION.cita} · Reina-Valera 1960
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
              subtitulo="Lo que más nos consultan sobre el trabajo del departamento."
            />
          </Reveal>
          <FaqAccordion items={FAQ} />
        </div>
      </section>

      {/* ============ 15 · CTA FINAL ============ */}
      <CtaFinal
        animated
        titulo="Llevemos juntos el evangelio al mundo digital"
        texto="Cada publicación, cada transmisión y cada diseño es una semilla. Ven y sé parte de lo que Dios está haciendo en el Centro Cristiano Mieles."
        primaryCta={{ label: "Cómo llegar", href: s.mapsUrl, external: true }}
        secondaryCta={{ label: "Petición de oración", href: "/oracion-peticion" }}
        tertiaryCta={{
          label: "Contactar Comunicación Digital",
          href: `mailto:${EQUIPO_INFO["Hermano Dilan Ferreira"].correo}`,
          external: true,
        }}
      />
    </>
  );
}
