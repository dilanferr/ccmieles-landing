"use client";

import { eliminarRegistro } from "../actions";

export type RecentItem = {
  id: string;
  titulo: string;
  subtitulo?: string;
};

export default function RecentList({
  tabla,
  items,
}: {
  tabla: "noticias" | "eventos";
  items: RecentItem[];
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
        Aún no hay registros. Los que publiques aparecerán aquí.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex items-center justify-between gap-3 px-4 py-3"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">
              {item.titulo}
            </p>
            {item.subtitulo && (
              <p className="truncate text-xs text-slate-400">{item.subtitulo}</p>
            )}
          </div>
          <form action={eliminarRegistro}>
            <input type="hidden" name="tabla" value={tabla} />
            <input type="hidden" name="id" value={item.id} />
            <button
              type="submit"
              className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
            >
              Eliminar
            </button>
          </form>
        </li>
      ))}
    </ul>
  );
}
