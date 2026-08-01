import { ICONS } from "../icons";
import type { Pilar } from "@/app/data/iglesia";

/**
 * "¿Qué hace este ministerio?" — 3 (o más) pilares con icono.
 * Mismo patrón de tarjeta en todo el sitio.
 */
export default function Pilares({
  titulo,
  subtitulo,
  items,
}: {
  titulo: string;
  subtitulo?: string;
  items: Pilar[];
}) {
  return (
    <section className="bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
            ¿Qué hacemos?
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {titulo}
          </h2>
          {subtitulo && (
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              {subtitulo}
            </p>
          )}
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {items.map((p) => {
            const Ico = ICONS[p.icon];
            return (
              <article
                key={p.titulo}
                className="flex flex-col rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm transition-all hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-600/10"
              >
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-linear-to-br from-blue-50 to-sky-50 text-blue-700">
                  <Ico className="h-7 w-7" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  {p.titulo}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                  {p.texto}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
