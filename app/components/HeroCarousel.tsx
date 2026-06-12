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
  const [paused, setPaused] = useState(false);
  const count = SLIDES.length;

  const go = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i + dir + count) % count),
    [count],
  );

  // Auto-avance (se pausa al pasar el cursor o tocar).
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (paused) return;
    timer.current = setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, count]);

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
      {/* Slides */}
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          aria-hidden={i !== index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
            i === index ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          {/* Degradado de respaldo (siempre visible bajo la imagen) */}
          <div className={`absolute inset-0 bg-linear-to-br ${slide.gradiente}`} />

          {/* Imagen desde Cloudinary (optimizada). El degradado queda de respaldo. */}
          {slide.publicId && (
            <CldImage
              src={slide.publicId}
              alt=""
              fill
              preload={i === 0}
              sizes="100vw"
              className="object-cover"
            />
          )}

          {/* Veladura densa para contraste impecable del texto */}
          <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/55 to-black/20" />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
        </div>
      ))}

      {/* Contenido */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-6 lg:px-8">
        {/* Bloque a la izquierda en PC, con los textos centrados entre sí */}
        <div className="flex w-full max-w-2xl flex-col items-center pt-16 text-center text-white md:items-start">
          {/* Nombre del ministerio — máxima jerarquía */}
          <h1 className="text-4xl font-black leading-[1.05] tracking-tight drop-shadow-lg sm:text-5xl md:text-6xl lg:text-7xl">
            {IGLESIA.nombre}
          </h1>

          {/* Tagline rotativo (key fuerza la animación al cambiar de slide) */}
          <div key={index} className="mt-5 max-w-xl">
            <p className="animate-fade-up text-xl font-semibold leading-snug text-white drop-shadow sm:text-2xl">
              {SLIDES[index].titulo}
            </p>
            <p className="mt-3 animate-fade-up text-base leading-relaxed text-sky-50/90 drop-shadow [animation-delay:0.12s] sm:text-lg">
              {SLIDES[index].subtitulo}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/#cultos"
              className="rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-blue-700 shadow-xl transition-all hover:-translate-y-0.5 hover:bg-blue-50"
            >
              Ver Horarios
            </Link>
            <Link
              href="/oracion-peticion"
              className="rounded-full border border-white/40 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20"
            >
              Enviar Oración
            </Link>
          </div>
        </div>
      </div>

      {/* Flechas */}
      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Anterior"
        className="absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-white/10 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/25 sm:grid"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Siguiente"
        className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-white/10 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/25 sm:grid"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2.5">
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
    </section>
  );
}
