"use client";

import { useEffect, useState } from "react";
import { track } from "@/app/components/track";

/**
 * Galería de recuerdos de un evento pasado. Rejilla responsiva con lightbox
 * ligero (sin dependencias). Las imágenes son URLs absolutas (Cloudinary) o
 * IDs; se usa <img> nativo para no acoplar el componente a un loader.
 */
export default function EventoGaleria({
  imagenes,
  titulo,
  slug,
}: {
  imagenes: string[];
  titulo: string;
  slug: string;
}) {
  const [activa, setActiva] = useState<number | null>(null);

  useEffect(() => {
    if (activa === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiva(null);
      if (e.key === "ArrowRight")
        setActiva((i) => (i === null ? null : (i + 1) % imagenes.length));
      if (e.key === "ArrowLeft")
        setActiva((i) =>
          i === null ? null : (i - 1 + imagenes.length) % imagenes.length,
        );
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [activa, imagenes.length]);

  if (imagenes.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {imagenes.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            onClick={() => {
              setActiva(i);
              track("event_gallery_open", { slug, index: i });
            }}
            className="group relative aspect-square overflow-hidden rounded-2xl bg-slate-100 shadow-sm ring-1 ring-slate-200/60 transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`${titulo} — foto ${i + 1}`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="pointer-events-none absolute inset-0 bg-linear-to-t from-emerald-950/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        ))}
      </div>

      {activa !== null && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setActiva(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm"
        >
          <button
            type="button"
            aria-label="Cerrar"
            className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/20"
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagenes[activa]}
            alt={`${titulo} — foto ${activa + 1}`}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
          />
          <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white">
            {activa + 1} / {imagenes.length}
          </span>
        </div>
      )}
    </>
  );
}
