import { ICONS } from "./icons";
import type { Pilar } from "@/app/data/iglesia";

/** Renderiza el título coloreando en azul las letras iniciales indicadas. */
function Titulo({
  titulo,
  resaltar,
}: {
  titulo: string;
  resaltar?: { palabra: number; letras?: number }[];
}) {
  if (!resaltar || resaltar.length === 0) return <>{titulo}</>;
  const palabras = titulo.split(" ");
  return (
    <>
      {palabras.map((palabra, i) => {
        const r = resaltar.find((x) => x.palabra === i);
        const n = r ? r.letras ?? 1 : 0;
        return (
          <span key={i}>
            {n > 0 ? (
              <>
                <span className="text-blue-700">{palabra.slice(0, n)}</span>
                {palabra.slice(n)}
              </>
            ) : (
              palabra
            )}
            {i < palabras.length - 1 ? " " : ""}
          </span>
        );
      })}
    </>
  );
}

/**
 * Rejilla reutilizable de tarjetas con icono (clave serializable).
 * Se usa para "¿Qué significa nuestro nombre?", "Nuestra Identidad", etc.
 */
export default function IconCardGrid({
  eyebrow,
  titulo,
  subtitulo,
  items,
  gridClass = "sm:grid-cols-2 lg:grid-cols-3",
  bg = "bg-background",
}: {
  eyebrow?: string;
  titulo: string;
  subtitulo?: string;
  items: Pilar[];
  gridClass?: string;
  bg?: string;
}) {
  return (
    <section className={`${bg} py-20 sm:py-24`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          {eyebrow && (
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
              {eyebrow}
            </span>
          )}
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {titulo}
          </h2>
          {subtitulo && (
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              {subtitulo}
            </p>
          )}
        </div>

        <div className={`mt-14 grid gap-6 ${gridClass}`}>
          {items.map((item) => {
            const Ico = ICONS[item.icon];
            return (
              <article
                key={item.titulo}
                className="flex flex-col rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm transition-all hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-600/10"
              >
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-linear-to-br from-blue-50 to-sky-50 text-blue-700">
                  <Ico className="h-7 w-7" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  <Titulo titulo={item.titulo} resaltar={item.resaltar} />
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                  {item.texto}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
