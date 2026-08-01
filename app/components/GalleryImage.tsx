"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageIcon } from "./icons";

/**
 * Imagen de galería con respaldo (fallback): si el Public ID aún no existe
 * en Cloudinary (404) o falla la carga, muestra un recuadro gris elegante
 * con un icono, manteniendo la cuadrícula profesional y armada.
 */
export default function GalleryImage({
  src,
  alt,
  sizes = "(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw",
}: {
  src: string;
  alt: string;
  sizes?: string;
}) {
  const [error, setError] = useState(false);

  return (
    <div className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl bg-brand-50/50 shadow-md ring-1 ring-slate-200/60">
      {error || !src ? (
        <div className="absolute inset-0 grid place-items-center bg-brand-50/50 text-blue-300">
          <ImageIcon className="h-8 w-8" />
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          onError={() => setError(true)}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      )}
    </div>
  );
}
