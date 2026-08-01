import type { Icon } from "./icons";

/**
 * Encabezado de sección reutilizable: eyebrow (opcional con icono) + título
 * + subtítulo. Centrado por defecto. Unifica el markup repetido en las
 * secciones de todo el sitio.
 */
export default function SectionHeader({
  eyebrow,
  icon: IconCmp,
  titulo,
  subtitulo,
}: {
  eyebrow?: string;
  icon?: Icon;
  titulo: string;
  subtitulo?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow && (
        <span className="eyebrow">
          {IconCmp && <IconCmp className="h-4 w-4" />}
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
  );
}
