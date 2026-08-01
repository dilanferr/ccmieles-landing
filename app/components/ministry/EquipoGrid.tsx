import PersonCard from "../PersonCard";
import type { Persona } from "@/app/data/iglesia";

/**
 * Rejilla de integrantes/encargados con encabezado y contador.
 * Reutilizable por cualquier ministerio (tarjetas PersonCard con tilt 3D).
 */
export default function EquipoGrid({
  titulo = "Directiva e Integrantes",
  lema,
  personas,
}: {
  titulo?: string;
  lema?: string;
  personas: Persona[];
}) {
  return (
    <section className="bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {titulo}
          </h2>
          <span className="h-px flex-1 bg-slate-200" />
          <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">
            {personas.length}{" "}
            {personas.length === 1 ? "integrante" : "integrantes"}
          </span>
        </div>

        {lema && <p className="mt-3 max-w-2xl text-slate-600">{lema}</p>}

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {personas.map((p) => (
            <PersonCard
              key={p.nombre}
              nombre={p.nombre}
              cargo={p.cargo}
              imageUrl={p.foto}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
