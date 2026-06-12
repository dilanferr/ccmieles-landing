"use client";

import { useState } from "react";
import { CldImage } from "next-cloudinary";
import { type FotoGaleria } from "@/app/data/iglesia";

/** Clases de tamaño dentro del mosaico (CSS Grid). */
const spanClass: Record<FotoGaleria["span"], string> = {
  normal: "",
  wide: "col-span-2",
  tall: "row-span-2",
  big: "col-span-2 row-span-2",
};

function GalleryImage({ foto }: { foto: FotoGaleria }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const sinImagen = !foto.publicId || error;

  return (
    <figure
      className={`group relative overflow-hidden rounded-2xl bg-slate-100 shadow-sm ring-1 ring-slate-200/60 ${spanClass[foto.span]}`}
    >
      {/* Skeleton detrás (visible mientras la imagen no ha pintado) */}
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-linear-to-br from-slate-100 to-slate-200" />
      )}

      {sinImagen ? (
        /* Respaldo de marca si la foto aún no existe */
        <div className="absolute inset-0 grid place-items-center bg-linear-to-br from-blue-700 to-sky-500">
          <span className="text-3xl font-bold text-white/90">M</span>
        </div>
      ) : (
        <CldImage
          src={foto.publicId}
          alt={foto.alt}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          onLoad={() => setLoaded(true)}
          onError={() => {
            setError(true);
            setLoaded(true);
          }}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      )}

      {/* Veladura + leyenda al pasar el cursor */}
      <figcaption className="pointer-events-none absolute inset-0 flex items-end bg-linear-to-t from-blue-950/70 via-blue-950/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <span className="p-4 text-sm font-medium text-white drop-shadow">
          {foto.alt}
        </span>
      </figcaption>
    </figure>
  );
}

export default function MosaicGallery({ fotos }: { fotos: FotoGaleria[] }) {
  return (
    <div className="grid grid-flow-row-dense auto-rows-[150px] grid-cols-2 gap-3 sm:auto-rows-[190px] sm:gap-4 md:grid-cols-3 lg:auto-rows-[220px] lg:grid-cols-4">
      {fotos.map((foto, i) => (
        <GalleryImage key={`${foto.publicId}-${i}`} foto={foto} />
      ))}
    </div>
  );
}
