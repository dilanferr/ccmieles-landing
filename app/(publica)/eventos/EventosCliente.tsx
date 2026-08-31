"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { EventoPublico } from "@/src/utils/publico";
import { track } from "@/app/components/track";
import { CalendarIcon, MapPinIcon, SearchIcon } from "@/app/components/icons";
import Countdown from "./Countdown";
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
} from "./eventoUtils";

function AddCal({ ev }: { ev: EventoPublico }) {
  return (
    <a
      href={googleCal(ev)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("event_interest", { slug: ev.slug, nombre: ev.nombre, action: "calendar" })}
      className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700"
    >
      <CalendarIcon className="h-4 w-4" />
      Agregar al calendario
    </a>
  );
}

export default function EventosCliente({
  eventos,
  mapsUrl,
}: {
  eventos: EventoPublico[];
  mapsUrl: string;
}) {
  const [cat, setCat] = useState("todos");
  const [q, setQ] = useState("");

  // Un evento baja a "pasados" cuando su fecha Y hora ya transcurrieron.
  const proximos = useMemo(
    () => eventos.filter((e) => !esPasado(e)),
    [eventos],
  );
  const pasados = useMemo(
    () => eventos.filter((e) => esPasado(e)).reverse(),
    [eventos],
  );

  // Prioridad del Hero: el evento destacado, SOLO si aún no ha pasado;
  // en su defecto, el evento futuro más próximo (la lista viene ascendente).
  const destacado =
    proximos.find((e) => e.destacado) ?? proximos[0] ?? null;

  const categorias = useMemo(() => {
    const set = new Set(proximos.map((e) => e.categoria));
    return ["todos", ...Array.from(set)];
  }, [proximos]);

  const lista = useMemo(() => {
    const term = q.trim().toLowerCase();
    return proximos
      .filter((e) => e.id !== destacado?.id)
      .filter((e) => cat === "todos" || e.categoria === cat)
      .filter((e) => {
        if (!term) return true;
        return `${e.nombre} ${e.descripcion} ${e.lugar} ${e.ministerio ?? ""}`
          .toLowerCase()
          .includes(term);
      });
  }, [proximos, destacado, cat, q]);

  return (
    <>
      {/* ============ HERO — próximo evento destacado ============ */}
      {destacado ? (
        <HeroEvento ev={destacado} mapsUrl={mapsUrl} />
      ) : (
        <header className="bg-linear-to-br from-blue-900 via-blue-800 to-sky-600 py-24 text-center text-white">
          <div className="mx-auto max-w-2xl px-6">
            <h1 className="text-4xl font-bold sm:text-5xl">Eventos y Actividades</h1>
            <p className="mt-4 text-sky-50/90">
              Pronto anunciaremos nuevas fechas. ¡Mantente atento!
            </p>
          </div>
        </header>
      )}

      {/* ============ FILTROS + BÚSQUEDA ============ */}
      <section className="bg-background py-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {categorias.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCat(c)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    cat === c
                      ? "bg-blue-700 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700"
                  }`}
                >
                  {c === "todos" ? "Todos" : CAT_LABEL[c] ?? c}
                </button>
              ))}
            </div>
            <div className="relative lg:w-72">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar evento…"
                className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============ TARJETAS ============ */}
      <section className="bg-background pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {lista.length === 0 ? (
            <p className="py-12 text-center text-slate-500">
              No hay eventos que coincidan con el filtro.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {lista.map((ev) => (
                <EventoCard key={ev.id} ev={ev} mapsUrl={mapsUrl} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============ PASADOS ============ */}
      {pasados.length > 0 && (
        <section className="bg-blue-50/40 py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Eventos pasados
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pasados.slice(0, 9).map((ev) => {
                const f = diaMes(ev.fecha);
                return (
                  <div
                    key={ev.id}
                    className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 opacity-90"
                  >
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500">
                      <span className="text-lg font-bold leading-none">{f.dia}</span>
                      <span className="text-[10px] font-semibold">{f.mes}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-800">{ev.nombre}</p>
                      <p className="text-xs text-slate-400">
                        {CAT_LABEL[ev.categoria] ?? ev.categoria}
                        {ev.ministerio && ` · ${ev.ministerio}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function HeroEvento({ ev, mapsUrl }: { ev: EventoPublico; mapsUrl: string }) {
  const est = estadoDe(ev);
  const comoLlegar = comoLlegarUrl(ev, mapsUrl);
  const target = fechaHoraISO(ev.fecha, ev.hora);
  return (
    <header className="relative isolate overflow-hidden bg-linear-to-br from-blue-950 via-blue-900 to-blue-800 text-white">
      {ev.imagenUrl && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ev.imagenUrl}
            alt={ev.nombre}
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Velo oscuro NEUTRO (sin tinte azul) para legibilidad del texto. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-linear-to-br from-black/70 via-black/50 to-black/30"
          />
        </>
      )}
      <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${TONO[est.tone]}`}>
              {est.label}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sky-100 ring-1 ring-white/20">
              {CAT_LABEL[ev.categoria] ?? ev.categoria}
            </span>
          </div>
          <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            {ev.nombre}
          </h1>
          {ev.descripcion && (
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-sky-50/90">
              {ev.descripcion}
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-sky-100">
            <span className="inline-flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {fechaLarga(ev.fecha)}
              {ev.hora && ` · ${ev.hora.slice(0, 5)} hrs`}
            </span>
            {ev.lugar && (
              <span className="inline-flex items-center gap-2">
                <MapPinIcon className="h-4 w-4" />
                {ev.lugar}
              </span>
            )}
            {ev.ministerio && <span>⛪ {ev.ministerio}</span>}
          </div>

          <div className="mt-6">
            <Countdown target={target} />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {ev.slug && (
              <Link
                href={`/eventos/${ev.slug}`}
                onClick={() => track("event_interest", { slug: ev.slug, action: "view" })}
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-sky-50"
              >
                Ver detalles
              </Link>
            )}
            <a
              href={comoLlegar}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("visit_plan_click", { slug: ev.slug })}
              className="rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20"
            >
              Cómo llegar
            </a>
            <a
              href={googleCal(ev)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("event_interest", { slug: ev.slug, action: "calendar" })}
              className="rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20"
            >
              + Agregar al calendario
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

function EventoCard({ ev, mapsUrl }: { ev: EventoPublico; mapsUrl: string }) {
  const est = estadoDe(ev);
  const comoLlegar = comoLlegarUrl(ev, mapsUrl);
  const f = diaMes(ev.fecha);
  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-600/10">
      <div className="relative aspect-video overflow-hidden bg-linear-to-br from-blue-700 to-sky-500">
        {ev.imagenUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ev.imagenUrl}
            alt={ev.nombre}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${TONO[est.tone]}`}>
          {est.label}
        </span>
        <span className="absolute right-3 top-3 rounded-lg bg-white/90 px-2 py-1 text-center leading-none text-blue-700">
          <span className="block text-base font-bold">{f.dia}</span>
          <span className="block text-[9px] font-semibold">{f.mes}</span>
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
          {CAT_LABEL[ev.categoria] ?? ev.categoria}
        </span>
        <h3 className="mt-1 text-lg font-bold text-slate-900">{ev.nombre}</h3>
        {ev.descripcion && (
          <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-600">
            {ev.descripcion}
          </p>
        )}
        <div className="mt-3 space-y-1 text-xs font-medium text-slate-500">
          <p className="flex items-center gap-1.5">
            <CalendarIcon className="h-3.5 w-3.5 text-sky-500" />
            {fechaLarga(ev.fecha)}
            {ev.hora && ` · ${ev.hora.slice(0, 5)}`}
          </p>
          {ev.lugar && (
            <p className="flex items-center gap-1.5">
              <MapPinIcon className="h-3.5 w-3.5 text-sky-500" />
              {ev.lugar}
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {ev.slug ? (
            <Link
              href={`/eventos/${ev.slug}`}
              onClick={() => track("event_interest", { slug: ev.slug, action: "view" })}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-blue-800"
            >
              Ver detalles <span aria-hidden>→</span>
            </Link>
          ) : (
            <a
              href={comoLlegar}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("visit_plan_click", { slug: ev.slug })}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-blue-800"
            >
              <MapPinIcon className="h-4 w-4" />
              Cómo llegar
            </a>
          )}
          <AddCal ev={ev} />
        </div>
      </div>
    </article>
  );
}
