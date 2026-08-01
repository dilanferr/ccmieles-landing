"use client";

import { useEffect, useState } from "react";
import PersonAvatar from "../PersonAvatar";
import { CardTilt3D } from "../ui/card-tilt-3d";
import { CloseIcon, UsersIcon, MailIcon, SparkIcon } from "../icons";

export type MiembroDigital = {
  nombre: string;
  cargo: string;
  foto?: string;
  descripcion?: string;
  especialidad?: string;
  correo?: string;
};

/**
 * Rejilla del equipo del departamento con foto, cargo, descripción breve y
 * botón "Ver Perfil" que abre un modal accesible con la biografía completa.
 * Animaciones suaves de entrada (fade-in escalonado por CSS) y hover.
 */
export default function EquipoDigital({
  personas,
}: {
  personas: MiembroDigital[];
}) {
  const [activo, setActivo] = useState<MiembroDigital | null>(null);

  return (
    <section className="bg-blue-50/40 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow justify-center">
            <UsersIcon className="h-4 w-4" />
            Nuestro equipo
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Integrantes del departamento
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Voluntarios que ponen sus dones al servicio del evangelio en el
            mundo digital.
          </p>
        </div>

        <ul className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {personas.map((p, i) => (
            <li
              key={p.nombre}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <CardTilt3D className="h-full">
                <article className="flex h-full flex-col items-center rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-600/10">
                  <PersonAvatar
                    nombre={p.nombre}
                    imageUrl={p.foto}
                    className="mb-4 h-28 w-28 border-4 border-white shadow-md ring-4 ring-blue-50 md:h-32 md:w-32"
                    textClass="text-3xl"
                    sizes="(max-width: 768px) 112px, 128px"
                  />
                  <h3 className="text-base font-bold text-slate-900">
                    {p.nombre}
                  </h3>
                  <span className="mt-2 inline-block rounded-full bg-blue-50 px-4 py-1 text-xs font-semibold text-blue-600">
                    {p.cargo}
                  </span>
                  {p.especialidad && (
                    <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <SparkIcon className="h-3.5 w-3.5 text-sky-500" />
                      {p.especialidad}
                    </span>
                  )}
                  {p.descripcion && (
                    <p className="mt-4 line-clamp-3 max-w-xs text-sm leading-relaxed text-slate-600">
                      {p.descripcion}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setActivo(p)}
                    className="mt-5 inline-flex items-center gap-2 rounded-full border border-blue-200 px-5 py-2 text-sm font-semibold text-blue-700 transition-all hover:-translate-y-0.5 hover:bg-blue-50"
                  >
                    Ver perfil
                  </button>
                </article>
              </CardTilt3D>
            </li>
          ))}
        </ul>
      </div>

      <PerfilModal miembro={activo} onClose={() => setActivo(null)} />
    </section>
  );
}

/** Modal accesible con la biografía completa del integrante. */
function PerfilModal({
  miembro,
  onClose,
}: {
  miembro: MiembroDigital | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!miembro) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [miembro, onClose]);

  if (!miembro) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Perfil de ${miembro.nombre}`}
      className="animate-fade-in fixed inset-0 z-50 grid place-items-center bg-blue-950/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="animate-fade-up relative w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
        <PersonAvatar
          nombre={miembro.nombre}
          imageUrl={miembro.foto}
          className="mx-auto mb-4 h-28 w-28 border-4 border-white shadow-md ring-4 ring-blue-50"
          textClass="text-3xl"
          sizes="112px"
        />
        <h3 className="text-xl font-bold text-slate-900">{miembro.nombre}</h3>
        <span className="mt-2 inline-block rounded-full bg-blue-50 px-4 py-1 text-xs font-semibold text-blue-600">
          {miembro.cargo}
        </span>
        {miembro.especialidad && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500">
            <SparkIcon className="h-4 w-4 text-sky-500" />
            {miembro.especialidad}
          </p>
        )}
        {miembro.descripcion && (
          <p className="mt-5 text-sm leading-relaxed text-slate-600">
            {miembro.descripcion}
          </p>
        )}
        {miembro.correo && (
          <a
            href={`mailto:${miembro.correo}`}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-blue-800"
          >
            <MailIcon className="h-4 w-4" />
            Escribir correo
          </a>
        )}
      </div>
    </div>
  );
}
