"use client";

import { useState } from "react";
import AvisoForm from "./AvisoForm";
import TestimonioForm from "./TestimonioForm";
import EventoForm from "./EventoForm";
import RecentList, { type RecentItem } from "./RecentList";
import PeticionesPanel, { type Peticion } from "./PeticionesPanel";

type TabId = "avisos" | "testimonios" | "eventos" | "peticiones";

const TABS: { id: TabId; label: string; emoji: string; descripcion: string }[] = [
  {
    id: "avisos",
    label: "Avisos Clasificados",
    emoji: "📌",
    descripcion: "Publica los servicios y oficios que ofrecen los hermanos.",
  },
  {
    id: "testimonios",
    label: "Testimonios",
    emoji: "🕊️",
    descripcion: "Agrega testimonios de fe con su video de YouTube.",
  },
  {
    id: "eventos",
    label: "Eventos",
    emoji: "📅",
    descripcion: "Crea actividades con afiche subido a Cloudinary.",
  },
  {
    id: "peticiones",
    label: "Peticiones de Oración",
    emoji: "🙏",
    descripcion:
      "Lee los motivos confidenciales y márcalos como atendidos.",
  },
];

export default function DashboardClient({
  avisos,
  testimonios,
  eventos,
  peticiones,
}: {
  avisos: RecentItem[];
  testimonios: RecentItem[];
  eventos: RecentItem[];
  peticiones: Peticion[];
}) {
  const [tab, setTab] = useState<TabId>("avisos");
  const activo = TABS.find((t) => t.id === tab)!;

  const recientes = { avisos, testimonios, eventos } as const;

  // Avisos y testimonios viven en 'noticias'; los eventos en 'eventos'.
  const tablaDestino = {
    avisos: "noticias",
    testimonios: "noticias",
    eventos: "eventos",
  } as const;

  const pendientes = peticiones.filter((p) => !p.leido).length;

  return (
    <div>
      {/* Pestañas */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm sm:inline-flex">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
              tab === t.id
                ? "bg-blue-700 text-white shadow-md shadow-blue-600/25"
                : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
            }`}
          >
            <span>{t.emoji}</span>
            {t.label}
            {t.id === "peticiones" && pendientes > 0 && (
              <span
                className={`ml-1 grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-bold ${
                  tab === "peticiones"
                    ? "bg-white text-blue-700"
                    : "bg-blue-700 text-white"
                }`}
              >
                {pendientes}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "peticiones" ? (
        /* ---- Panel de peticiones (ancho completo) ---- */
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-slate-900">
            {activo.emoji} {activo.label}
          </h2>
          <p className="mt-1 mb-6 text-sm text-slate-500">{activo.descripcion}</p>
          <PeticionesPanel peticiones={peticiones} />
        </section>
      ) : (
        /* ---- Formularios de gestión ---- */
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-slate-900">
              {activo.emoji} {activo.label}
            </h2>
            <p className="mt-1 mb-6 text-sm text-slate-500">
              {activo.descripcion}
            </p>

            {tab === "avisos" && <AvisoForm />}
            {tab === "testimonios" && <TestimonioForm />}
            {tab === "eventos" && <EventoForm />}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-slate-50/60 p-6 sm:p-8">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Últimos registros
            </h3>
            <div className="mt-4">
              <RecentList tabla={tablaDestino[tab]} items={recientes[tab]} />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
