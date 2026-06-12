/** Encabezado superior reutilizable para las páginas internas. */
export default function PageHeader({
  eyebrow,
  titulo,
  descripcion,
}: {
  eyebrow?: string;
  titulo: string;
  descripcion?: string;
}) {
  return (
    <header className="relative overflow-hidden bg-linear-to-br from-blue-900 via-blue-800 to-sky-600 text-white">
      {/* Decoración */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
        {eyebrow && (
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-sky-200">
            {eyebrow}
          </span>
        )}
        <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl">
          {titulo}
        </h1>
        {descripcion && (
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-sky-50/90">
            {descripcion}
          </p>
        )}
      </div>
    </header>
  );
}
