"use client";

import { motion, useReducedMotion } from "motion/react";

type Hito = { fecha: string; titulo: string; texto: string };

/**
 * Línea de tiempo vertical con revelado animado al hacer scroll.
 * Riel a la izquierda (punto + línea) y contenido a la derecha.
 */
export default function StoryTimeline({ items }: { items: Hito[] }) {
  const reduce = useReducedMotion();

  return (
    <ol className="relative mx-auto max-w-3xl">
      {/* Riel vertical */}
      <span
        aria-hidden
        className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-linear-to-b from-blue-600 via-sky-400 to-blue-200 sm:left-[9px]"
      />
      {items.map((h) => (
        <motion.li
          key={h.titulo}
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="relative pb-10 pl-10 last:pb-0 sm:pl-14"
        >
          {/* Punto */}
          <span
            aria-hidden
            className="absolute left-0 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-blue-700 ring-4 ring-white sm:h-5 sm:w-5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
          </span>

          <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-blue-700">
            {h.fecha}
          </span>
          <h3 className="mt-3 text-lg font-bold text-slate-900 sm:text-xl">
            {h.titulo}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600 sm:text-base">
            {h.texto}
          </p>
        </motion.li>
      ))}
    </ol>
  );
}
