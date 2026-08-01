/**
 * Rejilla de estadísticas/indicadores reutilizable.
 * Tarjetas limpias con número grande + etiqueta.
 */
export default function StatsGrid({
  items,
}: {
  items: { valor: string; label: string; wide?: boolean }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
      {items.map((s) => (
        <div
          key={s.label}
          className={`rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-600/10 sm:p-8 ${
            s.wide ? "col-span-2 lg:col-span-1" : ""
          }`}
        >
          <p className="bg-linear-to-br from-blue-700 to-sky-500 bg-clip-text text-3xl font-bold leading-tight tracking-tight text-transparent wrap-anywhere sm:text-4xl lg:text-5xl">
            {s.valor}
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-600">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
