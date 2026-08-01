/**
 * Versículo destacado: bloque centrado en azul con comilla serif.
 * Reutiliza el lenguaje visual de las "Promesas bíblicas" de Oración.
 */
export default function VersiculoDestacado({
  cita,
  texto,
}: {
  cita: string;
  texto: string;
}) {
  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <figure className="relative overflow-hidden rounded-3xl bg-linear-to-br from-blue-900 to-blue-700 p-10 text-center text-white shadow-xl sm:p-14">
          <span
            aria-hidden
            className="font-serif text-6xl leading-none text-sky-300/60"
          >
            “
          </span>
          <blockquote className="-mt-4 text-xl font-medium italic leading-relaxed text-sky-50 sm:text-2xl">
            {texto}
          </blockquote>
          <figcaption className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-sky-200">
            {cita} · Reina-Valera 1960
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
