import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import TrackLink from "@/app/components/TrackLink";
import {
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  ChurchIcon,
  MegaphoneIcon,
} from "@/app/components/icons";
import { getEventoBySlug, getEventos } from "@/src/utils/publico";
import { getSettings } from "@/src/utils/settings";
import Countdown from "../Countdown";
import EventoGaleria from "./EventoGaleria";
import {
  CAT_LABEL,
  TONO,
  estadoDe,
  esPasado,
  comoLlegarUrl,
  fechaHoraISO,
  fechaLarga,
  diaMes,
  googleCal,
} from "../eventoUtils";

type Params = { slug: string };

export const revalidate = 30;

const SITE = "https://ccmieles.cl";

export async function generateStaticParams(): Promise<Params[]> {
  const eventos = await getEventos();
  return eventos
    .map((e) => e.slug)
    .filter((s): s is string => Boolean(s))
    .map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ev = await getEventoBySlug(slug);
  if (!ev) return { title: "Evento no encontrado" };

  const titulo = `${ev.nombre} · Eventos`;
  const desc =
    ev.descripcion?.slice(0, 155) ||
    `${ev.nombre} — ${fechaLarga(ev.fecha)} en el Centro Cristiano Mieles, Quilicura.`;
  const imagenes = ev.imagenUrl ? [ev.imagenUrl] : [];

  return {
    title: titulo,
    description: desc,
    alternates: { canonical: `/eventos/${ev.slug}` },
    openGraph: {
      title: ev.nombre,
      description: desc,
      url: `/eventos/${ev.slug}`,
      type: "article",
      images: imagenes,
    },
    twitter: {
      card: imagenes.length ? "summary_large_image" : "summary",
      title: ev.nombre,
      description: desc,
      images: imagenes,
    },
  };
}

export default async function EventoDetallePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const [ev, s] = await Promise.all([getEventoBySlug(slug), getSettings()]);
  if (!ev) notFound();

  const pasado = esPasado(ev);
  const est = estadoDe(ev);
  const comoLlegar = comoLlegarUrl(ev, s.mapsUrl);
  const f = diaMes(ev.fecha);
  const catLabel = CAT_LABEL[ev.categoria] ?? ev.categoria;
  const target = fechaHoraISO(ev.fecha, ev.hora);

  // Eventos relacionados: misma categoría, no pasados, distintos a este.
  const todos = await getEventos();
  const relacionados = todos
    .filter(
      (e) =>
        e.slug !== ev.slug &&
        e.categoria === ev.categoria &&
        !esPasado(e),
    )
    .slice(0, 3);

  // ---- JSON-LD: Event + BreadcrumbList ----
  const startISO = `${ev.fecha}T${(ev.hora || "18:00").slice(0, 5)}:00-04:00`;
  const endISO = ev.horaFin
    ? `${ev.fecha}T${ev.horaFin.slice(0, 5)}:00-04:00`
    : undefined;

  const eventLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: ev.nombre,
    description: ev.descripcion || undefined,
    startDate: startISO,
    endDate: endISO,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    image: ev.imagenUrl ? [ev.imagenUrl] : undefined,
    location: {
      "@type": "Place",
      name: ev.lugar || s.nombre,
      address: s.direccion,
    },
    performer: ev.predicador
      ? { "@type": "Person", name: ev.predicador }
      : undefined,
    organizer: {
      "@type": "Organization",
      name: s.nombre,
      url: SITE,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "CLP",
      availability: "https://schema.org/InStock",
      url: `${SITE}/eventos/${ev.slug}`,
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE },
      {
        "@type": "ListItem",
        position: 2,
        name: "Eventos",
        item: `${SITE}/eventos`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: ev.nombre,
        item: `${SITE}/eventos/${ev.slug}`,
      },
    ],
  };

  return (
    <main className="bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* ============ HERO ============ */}
      <header className="relative isolate overflow-hidden bg-blue-950 text-white">
        {ev.imagenUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ev.imagenUrl}
            alt={ev.nombre}
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-40"
          />
        )}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-linear-to-t from-blue-950 via-blue-950/80 to-blue-900/40"
        />

        <div className="mx-auto max-w-5xl px-6 pb-14 pt-28 sm:pb-20 sm:pt-32 lg:px-8">
          {/* Migas */}
          <nav className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-200/80">
            <Link href="/" className="hover:text-white">
              Inicio
            </Link>
            <span aria-hidden>/</span>
            <Link href="/eventos" className="hover:text-white">
              Eventos
            </Link>
          </nav>

          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${TONO[est.tone]}`}
            >
              {est.label}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-sky-100 ring-1 ring-white/20">
              {catLabel}
            </span>
          </div>

          <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            {ev.nombre}
          </h1>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-sky-50">
            <span className="inline-flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {fechaLarga(ev.fecha)}
              {ev.hora && ` · ${ev.hora.slice(0, 5)} hrs`}
              {ev.horaFin && ` a ${ev.horaFin.slice(0, 5)} hrs`}
            </span>
            {ev.lugar && (
              <span className="inline-flex items-center gap-2">
                <MapPinIcon className="h-4 w-4" />
                {ev.lugar}
              </span>
            )}
          </div>

          {!pasado && (
            <div className="mt-8">
              <Countdown target={target} />
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <TrackLink
              href={comoLlegar}
              external
              event="visit_plan_click"
              meta={{ slug: ev.slug, from: "detalle" }}
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-sky-50"
            >
              Cómo llegar
            </TrackLink>
            {!pasado && (
              <TrackLink
                href={googleCal(ev)}
                external
                event="event_interest"
                meta={{ slug: ev.slug, action: "calendar" }}
                className="rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20"
              >
                + Agregar al calendario
              </TrackLink>
            )}
          </div>
        </div>
      </header>

      {/* ============ CONTENIDO ============ */}
      <div className="mx-auto max-w-5xl px-6 py-14 sm:py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          {/* Columna principal */}
          <div className="space-y-12">
            {/* Descripción */}
            {ev.descripcion && (
              <section>
                <h2 className="text-2xl font-bold text-slate-900">
                  Sobre este evento
                </h2>
                <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-slate-600">
                  {ev.descripcion}
                </p>
              </section>
            )}

            {/* Versículo destacado */}
            {ev.versiculo && (
              <figure className="relative isolate overflow-hidden rounded-3xl bg-linear-to-br from-blue-950 via-blue-800 to-sky-700 px-8 py-12 text-center text-white shadow-xl sm:px-12">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.12),transparent_55%)]"
                />
                <div className="relative">
                  <span className="text-xs font-bold uppercase tracking-[0.25em] text-sky-200">
                    Palabra para este día
                  </span>
                  <blockquote className="mt-4 font-serif text-xl font-medium leading-relaxed sm:text-2xl">
                    “{ev.versiculo}”
                  </blockquote>
                  <figcaption className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-sky-200">
                    Reina-Valera 1960
                  </figcaption>
                </div>
              </figure>
            )}

            {/* Programa / itinerario */}
            {ev.programa.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-slate-900">
                  Programa del día
                </h2>
                <ol className="mt-6 space-y-0">
                  {ev.programa.map((p, i) => (
                    <li
                      key={i}
                      className="flex gap-5 border-l-2 border-emerald-200 pl-6 pb-6 last:pb-0"
                    >
                      <span className="relative shrink-0">
                        <span className="absolute -left-[1.9rem] top-1 grid h-4 w-4 place-items-center rounded-full border-2 border-emerald-500 bg-white" />
                        <span className="inline-block min-w-16 text-sm font-bold text-emerald-600">
                          {p.hora || "—"}
                        </span>
                      </span>
                      <span className="text-base font-medium text-slate-700">
                        {p.actividad}
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* Galería (solo eventos pasados) */}
            {pasado && ev.galeria.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-slate-900">
                  Galería de recuerdos
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Momentos que vivimos juntos en este evento.
                </p>
                <div className="mt-6">
                  <EventoGaleria
                    imagenes={ev.galeria}
                    titulo={ev.nombre}
                    slug={ev.slug ?? slug}
                  />
                </div>
              </section>
            )}
          </div>

          {/* Columna lateral: ficha */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              {/* Fecha destacada */}
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-blue-700 to-sky-500 text-center leading-none text-white">
                  <span>
                    <span className="block text-2xl font-bold">{f.dia}</span>
                    <span className="block text-[10px] font-semibold uppercase">
                      {f.mes}
                    </span>
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {fechaLarga(ev.fecha)}
                  </p>
                  {ev.hora && (
                    <p className="text-sm text-slate-500">
                      {ev.hora.slice(0, 5)} hrs
                      {ev.horaFin && ` – ${ev.horaFin.slice(0, 5)} hrs`}
                    </p>
                  )}
                </div>
              </div>

              <dl className="mt-6 space-y-4 border-t border-slate-100 pt-6 text-sm">
                {ev.lugar && (
                  <Detalle
                    icon={<MapPinIcon className="h-4 w-4" />}
                    label="Lugar"
                    value={ev.lugar}
                  />
                )}
                {ev.predicador && (
                  <Detalle
                    icon={<MegaphoneIcon className="h-4 w-4" />}
                    label="Predicador"
                    value={ev.predicador}
                  />
                )}
                {ev.ministerio && (
                  <Detalle
                    icon={<ChurchIcon className="h-4 w-4" />}
                    label="Ministerio a cargo"
                    value={ev.ministerio}
                  />
                )}
                <Detalle
                  icon={<UsersIcon className="h-4 w-4" />}
                  label="Categoría"
                  value={catLabel}
                />
              </dl>

              {!pasado && (
                <TrackLink
                  href={googleCal(ev)}
                  external
                  event="event_interest"
                  meta={{ slug: ev.slug, action: "calendar_side" }}
                  className="mt-6 flex w-full items-center justify-center rounded-full bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-blue-800"
                >
                  + Agregar al calendario
                </TrackLink>
              )}
            </div>
          </aside>
        </div>

        {/* Relacionados */}
        {relacionados.length > 0 && (
          <section className="mt-20 border-t border-slate-100 pt-12">
            <h2 className="text-2xl font-bold text-slate-900">
              Otros eventos de {catLabel}
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relacionados.map((r) => {
                const rf = diaMes(r.fecha);
                return (
                  <Link
                    key={r.id}
                    href={r.slug ? `/eventos/${r.slug}` : "/eventos"}
                    className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-600/10"
                  >
                    <div className="relative aspect-video overflow-hidden bg-linear-to-br from-blue-700 to-sky-500">
                      {r.imagenUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.imagenUrl}
                          alt={r.nombre}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                      <span className="absolute right-3 top-3 rounded-lg bg-white/90 px-2 py-1 text-center leading-none text-blue-700">
                        <span className="block text-base font-bold">
                          {rf.dia}
                        </span>
                        <span className="block text-[9px] font-semibold">
                          {rf.mes}
                        </span>
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-base font-bold text-slate-900">
                        {r.nombre}
                      </h3>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {fechaLarga(r.fecha)}
                      </p>
                      <span className="mt-3 text-sm font-semibold text-blue-700">
                        Ver detalles →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Volver */}
        <div className="mt-14 text-center">
          <Link
            href="/eventos"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
          >
            ← Volver a todos los eventos
          </Link>
        </div>
      </div>
    </main>
  );
}

function Detalle({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sky-50 text-sky-600">
        {icon}
      </span>
      <div>
        <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </dt>
        <dd className="font-medium text-slate-800">{value}</dd>
      </div>
    </div>
  );
}
