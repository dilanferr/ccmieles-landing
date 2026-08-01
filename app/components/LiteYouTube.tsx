"use client";

import { useState } from "react";
import { track } from "./track";
import { PlayIcon } from "./icons";

/**
 * Reproductor "facade" de YouTube: muestra la miniatura + botón de play y solo
 * carga el iframe al hacer clic. Además registra el evento `testimonio_play`
 * (reproducción real) y mejora el rendimiento (no carga el iframe hasta que
 * el usuario decide ver el video).
 */
export default function LiteYouTube({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const [play, setPlay] = useState(false);

  if (play) {
    return (
      <iframe
        className="absolute inset-0 h-full w-full"
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        track("testimonio_play", { video_id: id, title });
        setPlay(true);
      }}
      aria-label={`Reproducir: ${title}`}
      className="group absolute inset-0 h-full w-full"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
        alt={title}
        loading="lazy"
        className="h-full w-full object-cover"
      />
      <span className="absolute inset-0 bg-blue-950/30 transition-colors group-hover:bg-blue-950/45" />
      <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-blue-700 shadow-xl transition-transform group-hover:scale-110">
        <PlayIcon className="h-7 w-7" />
      </span>
    </button>
  );
}
