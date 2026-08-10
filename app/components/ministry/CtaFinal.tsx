import type { HeaderCta } from "../PageHeader";
import TrackLink from "../TrackLink";
import ShareButton from "../ShareButton";

/**
 * Bloque de cierre full-width en azul oscuro. Mismo patrón para todos los
 * ministerios → el usuario aprende un único "siguiente paso".
 */
export default function CtaFinal({
  titulo,
  texto,
  primaryCta,
  secondaryCta,
  tertiaryCta,
  animated = false,
}: {
  titulo: string;
  texto: string;
  primaryCta: HeaderCta;
  secondaryCta?: HeaderCta;
  tertiaryCta?: HeaderCta;
  /** Añade brillo y partículas animadas en el fondo. */
  animated?: boolean;
}) {
  return (
    <section className="bg-background pb-20 sm:pb-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative isolate overflow-hidden rounded-3xl bg-linear-to-br from-blue-950 via-blue-800 to-sky-700 px-8 py-14 text-center text-white shadow-2xl sm:px-16 sm:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.10),transparent_45%)]"
          />
          <div
            aria-hidden
            className={`pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-sky-400/20 blur-3xl ${
              animated ? "animate-float-slow" : ""
            }`}
          />
          {animated && (
            <>
              <div
                aria-hidden
                className="animate-float-slower pointer-events-none absolute -bottom-20 -left-12 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl"
              />
              <div
                aria-hidden
                className="animate-shimmer pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(125,211,252,0.18),transparent_50%)]"
              />
              <Particulas />
            </>
          )}
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {titulo}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-sky-50/90">
              {texto}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Cta
                cta={primaryCta}
                className="bg-white text-blue-700 shadow-lg hover:-translate-y-0.5 hover:bg-sky-50"
              />
              {secondaryCta && (
                <Cta
                  cta={secondaryCta}
                  className="border border-white/30 text-white hover:-translate-y-0.5 hover:bg-white/10"
                />
              )}
              {tertiaryCta && (
                <Cta
                  cta={tertiaryCta}
                  className="border border-white/30 text-white hover:-translate-y-0.5 hover:bg-white/10"
                />
              )}
              <ShareButton className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Puntos de luz flotantes. Posiciones fijas → consistente entre servidor y
 *  cliente (sin Math.random en render). Puramente decorativo. */
const PUNTOS = [
  { left: "12%", top: "24%", size: 6, delay: "0s" },
  { left: "28%", top: "70%", size: 4, delay: "1.2s" },
  { left: "46%", top: "18%", size: 5, delay: "2.1s" },
  { left: "63%", top: "62%", size: 4, delay: "0.6s" },
  { left: "78%", top: "32%", size: 7, delay: "1.8s" },
  { left: "88%", top: "72%", size: 4, delay: "2.6s" },
];

function Particulas() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {PUNTOS.map((p, i) => (
        <span
          key={i}
          className="animate-float-slow absolute rounded-full bg-white/40 blur-[1px]"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

function Cta({ cta, className }: { cta: HeaderCta; className: string }) {
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
