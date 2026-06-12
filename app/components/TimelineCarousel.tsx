"use client";

import { useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import { CldImage } from "next-cloudinary";
import { type Hito } from "@/app/data/iglesia";
import { ChevronLeft, ChevronRight } from "./icons";

const INTERVALO = 5000; // ms entre cambios automáticos

/** Una diapositiva del carrusel (una imagen de un año, o el respaldo del año). */
type Diapo = {
  hitoIndex: number;
  publicId?: string;
  imgIndex: number; // posición de la imagen dentro de su año
  gradiente: string;
};

function Imagen({
  publicId,
  gradiente,
  active,
  priority,
}: {
  publicId?: string;
  gradiente: string;
  active: boolean;
  priority: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const sinImagen = !publicId || error;

  return (
    <div
      aria-hidden={!active}
      className={`absolute inset-0 transition-opacity duration-700 ${
        active ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Degradado de respaldo (siempre bajo la imagen) */}
      <div className={`absolute inset-0 bg-linear-to-br ${gradiente}`} />

      {/* Pulso sutil mientras la imagen no ha pintado */}
      {!sinImagen && !loaded && (
        <div className="absolute inset-0 animate-pulse bg-blue-950/30" />
      )}

      {!sinImagen && (
        <CldImage
          src={publicId!}
          alt=""
          fill
          preload={priority}
          sizes="(max-width: 1024px) 100vw, 50vw"
          onLoad={() => setLoaded(true)}
          onError={() => {
            setError(true);
            setLoaded(true);
          }}
          className="object-cover"
        />
      )}

      {/* Veladura oscura para legibilidad (degradado fuerte + capa extra en móvil) */}
      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/60 to-black/20" />
      <div className="absolute inset-0 bg-black/25 sm:hidden" />
    </div>
  );
}

export default function TimelineCarousel({ hitos }: { hitos: Hito[] }) {
  // Aplana todos los años en una sola lista de diapositivas.
  const diapos = useMemo<Diapo[]>(() => {
    const out: Diapo[] = [];
    hitos.forEach((h, hi) => {
      if (h.imagenes.length === 0) {
        out.push({ hitoIndex: hi, imgIndex: 0, gradiente: h.gradiente });
      } else {
        h.imagenes.forEach((pid, ii) =>
          out.push({ hitoIndex: hi, publicId: pid, imgIndex: ii, gradiente: h.gradiente }),
        );
      }
    });
    return out;
  }, [hitos]);

  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = diapos.length;

  const actual = diapos[i] ?? diapos[0];
  const hitoActivo = actual.hitoIndex;
  const activo = hitos[hitoActivo];

  const go = (d: number) => setI((p) => (p + d + n) % n);

  // Salta a la primera diapositiva de un año.
  const irAlAnio = (hi: number) => {
    const idx = diapos.findIndex((d) => d.hitoIndex === hi);
    if (idx !== -1) setI(idx);
  };

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
  };

  // Auto-avance (se pausa al pasar el cursor o tocar).
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (paused || n <= 1) return;
    timer.current = setInterval(() => setI((p) => (p + 1) % n), INTERVALO);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, n]);

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      {/* ---------- Tarjeta ---------- */}
      <div
        className="relative min-h-96 touch-pan-y select-none overflow-hidden rounded-3xl shadow-xl ring-1 ring-blue-900/10 sm:min-h-0 sm:aspect-4/3"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {diapos.map((d, idx) => (
          <Imagen
            key={idx}
            publicId={d.publicId}
            gradiente={d.gradiente}
            active={idx === i}
            priority={idx === 0}
          />
        ))}

        {/* Contador (solo móvil) cuando el año tiene varias imágenes */}
        {activo.imagenes.length > 1 && (
          <span className="absolute right-3 top-3 z-10 rounded-full bg-black/45 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm md:hidden">
            {actual.imgIndex + 1} / {activo.imagenes.length}
          </span>
        )}

        {/* Contenido del año activo */}
        <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
          <div key={hitoActivo} className="animate-fade-up">
            <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ring-1 ring-white/25 backdrop-blur-sm sm:text-[11px]">
              Nuestra Historia
            </span>
            <p className="mt-2.5 text-4xl font-bold leading-none drop-shadow-md sm:text-5xl lg:text-6xl">
              {activo.anio}
            </p>
            <h3 className="mt-2 text-lg font-bold drop-shadow sm:text-xl">
              {activo.titulo}
            </h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-sky-50/95 drop-shadow">
              {activo.descripcion}
            </p>
          </div>

          {/* Puntos de imagen dentro del año — ocultos en móvil */}
          {activo.imagenes.length > 1 && (
            <div className="mt-4 hidden gap-1.5 md:flex">
              {activo.imagenes.map((_, k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    const idx = diapos.findIndex(
                      (d) => d.hitoIndex === hitoActivo && d.imgIndex === k,
                    );
                    if (idx !== -1) setI(idx);
                  }}
                  aria-label={`Imagen ${k + 1} de ${activo.anio}`}
                  className={`h-1.5 rounded-full transition-all ${
                    actual.imgIndex === k
                      ? "w-6 bg-white"
                      : "w-1.5 bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Flechas — solo en escritorio (en móvil se navega con swipe) */}
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Anterior"
          className="absolute left-3 top-1/2 hidden -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-white/15 p-2.5 text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/30 md:grid"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Siguiente"
          className="absolute right-3 top-1/2 hidden -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-white/15 p-2.5 text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/30 md:grid"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* ---------- Línea de tiempo (años) ---------- */}
      <div className="relative px-1">
        <div aria-hidden className="absolute inset-x-1 top-2 h-0.5 bg-slate-200" />
        <div className="relative flex justify-between">
          {hitos.map((h, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => irAlAnio(idx)}
              aria-current={idx === hitoActivo}
              className="group flex flex-col items-center gap-1.5"
            >
              <span
                className={`h-4 w-4 rounded-full ring-4 ring-white transition-all ${
                  idx === hitoActivo
                    ? "scale-125 bg-blue-700"
                    : "bg-slate-300 group-hover:bg-sky-400"
                }`}
              />
              <span
                className={`text-[11px] font-semibold transition-colors sm:text-xs ${
                  idx === hitoActivo
                    ? "text-blue-700"
                    : "text-slate-400 group-hover:text-blue-600"
                }`}
              >
                {h.anio}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
