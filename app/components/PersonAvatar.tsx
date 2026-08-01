"use client";

import Image from "next/image";
import { useState } from "react";

/** Iniciales del nombre, ignorando el tratamiento (Hermana, Pastora…). */
function iniciales(nombre: string) {
  return nombre
    .replace(
      /^(Hermana|Hermano|Hna\.|Hno\.|Pastora|Pastor|Diaconisa|Diácono|Obispo|Profesor)\s+/i,
      "",
    )
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/**
 * Avatar redondo con foto (Next/Image) y respaldo de iniciales sobre fondo
 * azul institucional si la imagen falla o aún no está subida a Cloudinary.
 */
export default function PersonAvatar({
  nombre,
  imageUrl,
  className = "h-14 w-14",
  textClass = "text-base",
  sizes = "96px",
}: {
  nombre: string;
  imageUrl?: string;
  className?: string;
  textClass?: string;
  sizes?: string;
}) {
  const [error, setError] = useState(false);
  const mostrarFoto = Boolean(imageUrl) && !error;

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full bg-linear-to-br from-blue-700 to-sky-500 ${className}`}
    >
      {mostrarFoto ? (
        <Image
          src={imageUrl as string}
          alt={nombre}
          fill
          sizes={sizes}
          className="object-cover"
          onError={() => setError(true)}
        />
      ) : (
        <span
          className={`grid h-full w-full place-items-center font-bold text-white ${textClass}`}
        >
          {iniciales(nombre)}
        </span>
      )}
    </div>
  );
}
