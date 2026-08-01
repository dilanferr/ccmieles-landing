"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type TouchEvent,
} from "react";
import Link from "next/link";
import { CldImage } from "next-cloudinary";
import { ChevronLeft, ChevronRight } from "./icons";
import { SLIDES, IGLESIA } from "@/app/data/iglesia";

const INTERVAL = 6000;

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false); // hover/touch
  const [userPaused, setUserPaused] = useState(false); // botón de pausa
  const [reduce, setReduce] = useState(false); // prefers-reduced-motion
  const count = SLIDES.length;
  const anios = new Date().getFullYear() - 2007;

  const go = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i + dir + count) % count),
    [count],
  );

  // Respeta la preferencia de movimiento reducido.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Auto-avance (se pausa al pasar el cursor, tocar, o con el botón).
  const autoplay = !paused && !userPaused && !reduce;
  useEffect(() => {
    if (!autoplay) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL);
    return () => clearInterval(t);
  }, [autoplay, count]);

  // Gestos de swipe en móvil.
  const touchX = useRef<number | null>(null);
  const onTouchStart = (e: TouchEvent) => {
    setPaused(true);
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    touchX.current = null;
    setPaused(false);
  };

  const slide = SLIDES[index];

  return (
    <section
      id="inicio"
      aria-roledescription="carrusel"
      aria-label="Bienvenida"
      className="relative h-[88vh] min-h-140 w-full touch-pan-y overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Slides (imagen + degradado) */}
      {SLIDES.map((s, i) => (
        <div
          key={i}
          aria-hidden={i !== index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
            i === index ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <div className={`absolute inset-0 bg-linear-to-br ${s.gradiente}`} />
          {s.publicId && (
            <CldImage
              src={s.publicId}
              alt=""
              fill
              preload={i === 0}
              sizes="100vw"
              className="object-cover"
            />
          )}
          {/* Veladura para contraste impecable del texto */}
          <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/55 to-black/20" />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
        </div>
      ))}

      {/* Contenido */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-6 lg:px-8">
        <div className="flex w-full max-w-2xl flex-col items-center pt-16 text-center text-white md:items-start md:text-left">
          {/* Marca (eyebrow) + etiqueta del slide */}
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-sky-100 ring-1 ring-white/20 backdrop-blur-sm">
            {IGLESIA.nombre} · {slide.etiqueta}
          </span>

          {/* Titular corto (cambia por slide) */}
          <div key={index} aria-live="polite">
            <h1 className="mt-5 animate-fade-up text-4xl font-black leading-[1.05] tracking-tight drop-shadow-lg sm:text-5xl md:text-6xl lg:text-7xl">
              {slide.titular}
            </h1>
            <p className="mt-5 max-w-xl animate-fade-up text-base leading-relaxed text-sky-50/90 drop-shadow [animation-delay:0.12s] sm:text-lg">
              {slide.subtitulo}
            </p>
          </div>

          {/* CTAs: la principal es propia del slide */}
          <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
            <Link
              href={slide.cta.href}
              className="rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-blue-700 shadow-xl transition-all hover:-translate-y-0.5 hover:bg-blue-50"
            >
              {slide.cta.label}
            </Link>
            <Link
              href="/#cultos"
              className="rounded-full border border-white/40 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20"
            >
              Ver horarios
            </Link>
          </div>

          {/* Indicadores de confianza */}
          <dl className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 md:justify-start">
            {[
              { v: `${anios}`, l: "Años de ministerio" },
              { v: "+9", l: "Ministerios" },
              { v: "Quilicura", l: "Santiago de Chile" },
            ].map((t, i) => (
              <div key={t.l} className="flex items-center gap-2">
                {i > 0 && (
                  <span aria-hidden className="hidden h-8 w-px bg-white/25 sm:block" />
                )}
                <div className="text-left">
                  <dt className="text-xl font-bold leading-none text-white drop-shadow">
                    {t.v}
                  </dt>
                  <dd className="mt-1 text-[11px] font-medium uppercase tracking-wider text-sky-100/80">
                    {t.l}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Flechas */}
      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Diapositiva anterior"
        className="absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-white/10 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/25 sm:grid"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Diapositiva siguiente"
        className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-white/10 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/25 sm:grid"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Indicadores + botón de pausa */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3">
        <div className="flex gap-2.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Ir a la diapositiva ${i + 1}`}
              aria-current={i === index}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === index ? "w-8 bg-white" : "w-2.5 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setUserPaused((v) => !v)}
          aria-label={userPaused ? "Reanudar carrusel" : "Pausar carrusel"}
          aria-pressed={userPaused}
          className="grid h-7 w-7 place-items-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/25"
        >
          {userPaused ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
              <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
            </svg>
          )}
        </button>
      </div>
    </section>
  );
}
