import type { ReactNode } from "react";
import { cloudinaryUrl } from "@/app/data/iglesia";
import TrackLink from "./TrackLink";

export type HeaderCta = { label: string; href: string; external?: boolean };
export type HeaderStat = { valor: string; label: string };

/**
 * Encabezado superior reutilizable para las páginas internas.
 *
 * Retrocompatible: con solo `eyebrow/titulo/descripcion` se ve igual que
 * siempre. Los ministerios pueden enriquecerlo con:
 *  - `primaryCta` / `secondaryCta`: botones de acción,
 *  - `stats`: fila de indicadores (ej. "2007 · Desde"),
 *  - `aside`: contenido para la tarjeta "glass" flotante a la derecha,
 *  - `bgPublicId`: Public ID de una imagen de Cloudinary como fondo del hero
 *    (se cubre con un degradado azul para mantener el texto legible).
 */
export default function PageHeader({
  eyebrow,
  titulo,
  descripcion,
  primaryCta,
  secondaryCta,
  stats,
  aside,
  bgPublicId,
}: {
  eyebrow?: string;
  titulo: string;
  descripcion?: string;
  primaryCta?: HeaderCta;
  secondaryCta?: HeaderCta;
  stats?: HeaderStat[];
  aside?: ReactNode;
  bgPublicId?: string;
}) {
  const hasAside = Boolean(aside);
  const bgUrl = bgPublicId ? cloudinaryUrl(bgPublicId) : "";

  return (
    <header className="relative isolate overflow-hidden bg-linear-to-br from-blue-900 via-blue-800 to-sky-600 text-white">
      {/* Imagen de fondo opcional (Cloudinary) + velo azul para legibilidad */}
      {bgUrl && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bgUrl}
            alt=""
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-linear-to-br from-black/60 via-black/40 to-black/20"
          />
        </>
      )}

      {/* Profundidad: realce radial + blobs suaves */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,0.10),transparent_45%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl"
      />

      <div
        className={`relative mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24 ${
          hasAside ? "lg:grid lg:grid-cols-2 lg:items-center lg:gap-12" : ""
        }`}
      >
        <div>
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

          {(primaryCta || secondaryCta) && (
            <div className="mt-8 flex flex-wrap gap-3">
              {primaryCta && (
                <CtaButton
                  cta={primaryCta}
                  className="bg-white text-blue-700 shadow-lg hover:-translate-y-0.5 hover:bg-sky-50"
                />
              )}
              {secondaryCta && (
                <CtaButton
                  cta={secondaryCta}
                  className="border border-white/30 text-white hover:-translate-y-0.5 hover:bg-white/10"
                />
              )}
            </div>
          )}

          {stats && stats.length > 0 && (
            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-6">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="text-3xl font-bold tracking-tight">
                    {s.valor}
                  </dt>
                  <dd className="mt-1 text-xs font-semibold uppercase tracking-[0.15em] text-sky-200">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        {hasAside && (
          <div className="mt-12 lg:mt-0">
            <div className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl ring-1 ring-white/10 backdrop-blur-md sm:p-8">
              {aside}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

/** Botón del hero. Si es externo (mapa) registra la intención de visita. */
function CtaButton({ cta, className }: { cta: HeaderCta; className: string }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all";
  return (
    <TrackLink
      href={cta.href}
      external={cta.external}
      event={cta.external ? "visit_plan_click" : undefined}
      className={`${base} ${className}`}
    >
      {cta.label}
    </TrackLink>
  );
}
