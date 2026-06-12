"use client";

import { useMemo, useState } from "react";
import { actualizarPeticion } from "../actions";

export type Peticion = {
  id: string;
  created_at: string;
  nombre: string;
  apellido: string;
  motivo: string;
  descripcion: string;
  leido: boolean;
};

const PER_PAGE = 10;

type EstadoFiltro = "todas" | "pendientes" | "atendidas";
const MOTIVOS = ["Todos", "Sanidad", "Liberación", "Consolación"] as const;

const motivoColor: Record<string, string> = {
  Sanidad: "bg-emerald-100 text-emerald-700",
  Liberación: "bg-violet-100 text-violet-700",
  Consolación: "bg-sky-100 text-sky-700",
};

function fechaCorta(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
        active
          ? "bg-blue-700 text-white shadow-md shadow-blue-600/25"
          : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700"
      }`}
    >
      {children}
    </button>
  );
}

export default function PeticionesPanel({
  peticiones,
}: {
  peticiones: Peticion[];
}) {
  const [estado, setEstado] = useState<EstadoFiltro>("todas");
  const [motivo, setMotivo] = useState<string>("Todos");
  const [page, setPage] = useState(1);

  const totalPendientes = peticiones.filter((p) => !p.leido).length;
  const totalAtendidas = peticiones.length - totalPendientes;

  // Filtrado por estado y motivo.
  const filtradas = useMemo(() => {
    return peticiones.filter((p) => {
      if (estado === "pendientes" && p.leido) return false;
      if (estado === "atendidas" && !p.leido) return false;
      if (motivo !== "Todos" && p.motivo !== motivo) return false;
      return true;
    });
  }, [peticiones, estado, motivo]);

  // Paginación.
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / PER_PAGE));
  const paginaActual = Math.min(page, totalPaginas);
  const inicio = (paginaActual - 1) * PER_PAGE;
  const visibles = filtradas.slice(inicio, inicio + PER_PAGE);

  const setEstadoYReset = (v: EstadoFiltro) => {
    setEstado(v);
    setPage(1);
  };
  const setMotivoYReset = (v: string) => {
    setMotivo(v);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Aviso de confidencialidad + contador */}
      <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 px-5 py-4 sm:flex-row sm:items-center">
        <p className="flex items-center gap-2 text-sm text-slate-600">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-700 text-white">
            🔒
          </span>
          Contenido <span className="font-semibold text-slate-800">confidencial</span>.
          Solo visible para el Obispo y el Cuerpo Ministerial.
        </p>
        <span className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-blue-700 shadow-sm">
          {totalPendientes} {totalPendientes === 1 ? "pendiente" : "pendientes"}
        </span>
      </div>

      {/* Filtros */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-bold uppercase tracking-wider text-slate-400">
            Estado
          </span>
          <Chip active={estado === "todas"} onClick={() => setEstadoYReset("todas")}>
            Todas ({peticiones.length})
          </Chip>
          <Chip
            active={estado === "pendientes"}
            onClick={() => setEstadoYReset("pendientes")}
          >
            Pendientes ({totalPendientes})
          </Chip>
          <Chip
            active={estado === "atendidas"}
            onClick={() => setEstadoYReset("atendidas")}
          >
            Atendidas ({totalAtendidas})
          </Chip>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-bold uppercase tracking-wider text-slate-400">
            Motivo
          </span>
          {MOTIVOS.map((m) => (
            <Chip key={m} active={motivo === m} onClick={() => setMotivoYReset(m)}>
              {m}
            </Chip>
          ))}
        </div>
      </div>

      {/* Lista */}
      {filtradas.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-400">
          {peticiones.length === 0
            ? "Aún no hay peticiones de oración. Las que se envíen desde el sitio aparecerán aquí."
            : "No hay peticiones que coincidan con los filtros seleccionados."}
        </p>
      ) : (
        <>
          <ul className="grid gap-5 lg:grid-cols-2">
            {visibles.map((p) => (
              <li
                key={p.id}
                className={`flex flex-col rounded-3xl border bg-white p-6 shadow-sm transition-all ${
                  p.leido
                    ? "border-slate-200 opacity-70"
                    : "border-blue-200 shadow-blue-600/5"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {p.nombre} {p.apellido}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {fechaCorta(p.created_at)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      motivoColor[p.motivo] ?? "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {p.motivo}
                  </span>
                </div>

                <p className="mt-4 flex-1 whitespace-pre-line rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                  {p.descripcion}
                </p>

                <div className="mt-5 flex items-center justify-between gap-3">
                  {p.leido ? (
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                      ✓ Atendida
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600">
                      ● Pendiente
                    </span>
                  )}

                  <form action={actualizarPeticion}>
                    <input type="hidden" name="id" value={p.id} />
                    <input
                      type="hidden"
                      name="leido"
                      value={p.leido ? "false" : "true"}
                    />
                    <button
                      type="submit"
                      className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                        p.leido
                          ? "border border-slate-200 text-slate-500 hover:bg-slate-50"
                          : "bg-blue-700 text-white shadow-lg shadow-blue-600/25 hover:-translate-y-0.5 hover:bg-blue-800"
                      }`}
                    >
                      {p.leido ? "Marcar pendiente" : "Marcar como atendida"}
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>

          {/* Paginación */}
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-slate-500">
              Mostrando{" "}
              <span className="font-semibold text-slate-700">
                {inicio + 1}–{Math.min(inicio + PER_PAGE, filtradas.length)}
              </span>{" "}
              de{" "}
              <span className="font-semibold text-slate-700">
                {filtradas.length}
              </span>
            </p>

            {totalPaginas > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((v) => Math.max(1, v - 1))}
                  disabled={paginaActual === 1}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Anterior
                </button>
                <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700">
                  {paginaActual} / {totalPaginas}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((v) => Math.min(totalPaginas, v + 1))}
                  disabled={paginaActual === totalPaginas}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
