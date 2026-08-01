"use client";

import { useEffect, useMemo, useState } from "react";
import { CldImage } from "next-cloudinary";
import { CloseIcon, ImageIcon } from "../icons";
import type { FotoGaleria } from "@/app/data/iglesia";

/** Foto de galería con una categoría (string) para filtrar. Reutilizable. */
export type FotoCategoria = FotoGaleria & { categoria: string };

const spanClass: Record<FotoCategoria["span"], string> = {
  normal: "",
  wide: "sm:col-span-2",
  tall: "sm:row-span-2",
  big: "sm:col-span-2 sm:row-span-2",
};

/**
 * Galería tipo masonry con filtro por categorías y modal (lightbox).
 * Las categorías se derivan de las propias fotos (en orden de aparición),
 * de modo que el componente sirve para cualquier página.
 * - Cada foto abre un modal accesible (Escape / click fuera / botón cerrar).
 * - Lazy loading + skeleton mientras carga; respaldo de marca si el
 *   Public ID aún no existe en Cloudinary.
 */
export default function GaleriaCategorias({
  fotos,
}: {
  fotos: FotoCategoria[];
}) {
  const [filtro, setFiltro] = useState<string>("Todas");
  const [abierta, setAbierta] = useState<FotoCategoria | null>(null);

  const visibles = useMemo(
    () =>
      filtro === "Todas"
        ? fotos
        : fotos.filter((f) => f.categoria === filtro),
    [filtro, fotos],
  );

  // Categorías únicas en el orden en que aparecen en los datos.
  const filtros = useMemo(
    () => ["Todas", ...Array.from(new Set(fotos.map((f) => f.categoria)))],
    [fotos],
  );

  return (
    <>
      {/* Tabs de categorías */}
      <div
        role="tablist"
        aria-label="Filtrar galería por categoría"
        className="flex flex-wrap justify-center gap-2"
      >
        {filtros.map((f) => {
          const activo = f === filtro;
          return (
            <button
              key={f}
              role="tab"
              aria-selected={activo}
              type="button"
              onClick={() => setFiltro(f)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                activo
                  ? "bg-blue-700 text-white shadow-md shadow-blue-600/20"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-blue-50 hover:text-blue-700"
              }`}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* Masonry */}
      <div
        key={filtro}
        className="animate-fade-in mt-10 grid grid-flow-row-dense auto-rows-[150px] grid-cols-2 gap-3 sm:auto-rows-[190px] sm:gap-4 md:grid-cols-3 lg:auto-rows-[220px] lg:grid-cols-4"
      >
        {visibles.map((foto, i) => (
          <Miniatura
            key={`${foto.publicId}-${i}`}
            foto={foto}
            onOpen={() => setAbierta(foto)}
          />
        ))}
      </div>

      <Lightbox foto={abierta} onClose={() => setAbierta(null)} />
    </>
  );
}

function Miniatura({
  foto,
  onOpen,
}: {
  foto: FotoCategoria;
  onOpen: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const sinImagen = !foto.publicId || error;

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Ampliar imagen: ${foto.alt}`}
      className={`group relative overflow-hidden rounded-2xl bg-slate-100 shadow-sm ring-1 ring-slate-200/60 ${spanClass[foto.span]}`}
    >
      {!loaded && !sinImagen && (
        <div className="absolute inset-0 animate-pulse bg-linear-to-br from-slate-100 to-slate-200" />
      )}

      {sinImagen ? (
        <div className="absolute inset-0 grid place-items-center bg-linear-to-br from-blue-700 to-sky-500 text-white/80">
          <ImageIcon className="h-8 w-8" />
        </div>
      ) : (
        <CldImage
          src={foto.publicId}
          alt={foto.alt}
          fill
          loading="lazy"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          onLoad={() => setLoaded(true)}
          onError={() => {
            setError(true);
            setLoaded(true);
          }}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      )}

      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-blue-700 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
        {foto.categoria}
      </span>
      <span className="pointer-events-none absolute inset-0 flex items-end bg-linear-to-t from-blue-950/70 via-blue-950/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <span className="p-4 text-left text-sm font-medium text-white drop-shadow">
          {foto.alt}
        </span>
      </span>
    </button>
  );
}

/** Modal a pantalla completa con la imagen ampliada. */
function Lightbox({
  foto,
  onClose,
}: {
  foto: FotoCategoria | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!foto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [foto, onClose]);

  if (!foto) return null;
  const sinImagen = !foto.publicId;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={foto.alt}
      className="animate-fade-in fixed inset-0 z-50 grid place-items-center bg-blue-950/85 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition-colors hover:bg-white/20"
      >
        <CloseIcon className="h-6 w-6" />
      </button>

      <figure
        className="animate-fade-up relative w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-blue-900 shadow-2xl">
          {sinImagen ? (
            <div className="absolute inset-0 grid place-items-center bg-linear-to-br from-blue-700 to-sky-500 text-white/80">
              <ImageIcon className="h-14 w-14" />
            </div>
          ) : (
            <CldImage
              src={foto.publicId}
              alt={foto.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 900px"
              className="object-contain"
            />
          )}
        </div>
        <figcaption className="mt-4 text-center text-sm text-sky-100">
          <span className="font-semibold text-white">{foto.categoria}</span>
          {" · "}
          {foto.alt}
        </figcaption>
      </figure>
    </div>
  );
}
