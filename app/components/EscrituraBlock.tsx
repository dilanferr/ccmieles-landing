/**
 * Bloque premium de Escritura — fondo azul profundo, tipografía serif grande.
 * Pensado para un pasaje que marca un momento (ej. Josué 1:1-9).
 */
export default function EscrituraBlock({
  etiqueta,
  referencia,
  texto,
  nota,
}: {
  etiqueta?: string;
  referencia: string;
  texto: string;
  nota?: string;
}) {
  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <figure className="relative isolate overflow-hidden rounded-3xl bg-linear-to-br from-blue-950 via-blue-800 to-sky-700 px-8 py-16 text-center text-white shadow-2xl sm:px-16 sm:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.12),transparent_55%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl"
          />
          <div className="relative">
            {etiqueta && (
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-sky-200">
                {etiqueta}
              </span>
            )}
            <span
              aria-hidden
              className="mt-4 block font-serif text-7xl leading-none text-sky-300/50"
            >
              “
            </span>
            <blockquote className="-mt-6 font-serif text-2xl font-medium leading-relaxed sm:text-3xl">
              {texto}
            </blockquote>
            <figcaption className="mt-8 text-sm font-bold uppercase tracking-[0.25em] text-sky-200">
              {referencia} · Reina-Valera 1960
            </figcaption>
            {nota && (
              <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-sky-50/80">
                {nota}
              </p>
            )}
          </div>
        </figure>
      </div>
    </section>
  );
}
