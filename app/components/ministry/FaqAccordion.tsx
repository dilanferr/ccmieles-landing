"use client";

import { useState } from "react";
import { ChevronDown } from "../icons";

export type Faq = { pregunta: string; respuesta: string };

/**
 * Acordeón accesible de preguntas frecuentes. Una sola pregunta abierta a la
 * vez, con transición suave de altura y rotación del icono. Botones con
 * aria-expanded/controls para lectores de pantalla.
 */
export default function FaqAccordion({ items }: { items: Faq[] }) {
  const [abierta, setAbierta] = useState<number | null>(0);

  return (
    <div className="mx-auto mt-12 max-w-3xl space-y-3">
      {items.map((f, i) => {
        const open = abierta === i;
        return (
          <div
            key={f.pregunta}
            className={`overflow-hidden rounded-2xl border bg-white transition-colors ${
              open ? "border-blue-200 shadow-sm" : "border-slate-200"
            }`}
          >
            <h3>
              <button
                type="button"
                onClick={() => setAbierta(open ? null : i)}
                aria-expanded={open}
                aria-controls={`faq-panel-${i}`}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="text-base font-semibold text-slate-900">
                  {f.pregunta}
                </span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-blue-600 transition-transform duration-300 ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </button>
            </h3>
            <div
              id={`faq-panel-${i}`}
              className="grid transition-all duration-300 ease-out"
              style={{
                gridTemplateRows: open ? "1fr" : "0fr",
                opacity: open ? 1 : 0,
              }}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-5 text-sm leading-relaxed text-slate-600">
                  {f.respuesta}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
