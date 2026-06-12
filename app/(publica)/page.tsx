import Link from "next/link";
import HeroCarousel from "@/app/components/HeroCarousel";
import TextMarquee from "@/app/components/TextMarquee";
import BlurText from "@/app/components/BlurText";
import { CalendarIcon, MapPinIcon } from "@/app/components/icons";
import { IGLESIA, ACCESOS, HORARIOS } from "@/app/data/iglesia";

export default function Home() {
  return (
    <>
      <HeroCarousel />

      {/* ============ BIENVENIDA ============ */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
            Bienvenido a casa
          </span>
          <BlurText
            as="h2"
            text={IGLESIA.nombre}
            className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
          />
          <BlurText
            as="p"
            delay={250}
            text={`Somos el ${IGLESIA.ministerio}, una familia de fe donde el amor de Cristo transforma vidas. Te invitamos a conocer nuestra obra, nuestros ministerios y a ser parte de lo que Dios está haciendo.`}
            className="mt-5 text-lg leading-relaxed text-slate-600"
          />
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/nosotros"
              className="rounded-full bg-blue-700 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:-translate-y-0.5 hover:bg-blue-800"
            >
              Conoce nuestra historia
            </Link>
            <Link
              href="/eventos"
              className="rounded-full border border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700"
            >
              Ver eventos
            </Link>
          </div>
        </div>
      </section>

      {/* ============ FRASES DE FE (marquee) ============ */}
      <section
        aria-hidden
        className="overflow-hidden border-y border-blue-100 bg-linear-to-b from-blue-50/60 to-white py-10 sm:py-14"
      >
        <TextMarquee
          baseVelocity={-2.2}
          delay={300}
          className="font-black leading-[0.95] tracking-tight text-blue-700"
        >
          Dios es amor - Jesús te ama - Hay esperanza en Cristo -&nbsp;
        </TextMarquee>
        <TextMarquee
          baseVelocity={2.2}
          delay={300}
          className="font-black leading-[0.95] tracking-tight text-transparent [-webkit-text-stroke:1.5px_#38bdf8]"
        >
          Su amor es eterno - Cristo transforma vidas - Bienvenido a casa -&nbsp;
        </TextMarquee>
      </section>

      {/* ============ ACCESOS RÁPIDOS ============ */}
      <section className="bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Explora nuestra comunidad
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Todo lo que necesitas para crecer y servir, en un solo lugar.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ACCESOS.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-600/10"
              >
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-linear-to-br from-blue-50 to-sky-50 text-2xl transition-transform group-hover:scale-110">
                  {a.emoji}
                </span>
                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  {a.titulo}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                  {a.descripcion}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-700 transition-all group-hover:gap-2">
                  Ver más <span aria-hidden>→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CULTOS GENERALES ============ */}
      <section id="cultos" className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
              <CalendarIcon className="h-4 w-4" />
              Cultos Generales
            </span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Te esperamos cada semana
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Estos son nuestros servicios y actividades. ¡Las puertas están
              abiertas para ti y para tu familia!
            </p>
          </div>

          {/* Grilla responsiva de horarios */}
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HORARIOS.map((h, i) => (
              <div
                key={i}
                className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50 p-5 transition-all hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-lg hover:shadow-blue-600/10"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex rounded-full bg-blue-700 px-3 py-1 text-xs font-bold text-white">
                    {h.dia}
                  </span>
                  <CalendarIcon className="h-5 w-5 text-blue-300" />
                </div>
                <p className="mt-4 text-base font-bold leading-snug text-slate-900">
                  {h.actividad}
                </p>
                <p className="mt-1 text-sm font-semibold text-blue-700">
                  {h.hora}
                </p>
              </div>
            ))}
          </div>

          {/* Dirección + botón de mapa (responsivo: columna en móvil, fila en PC) */}
          <div className="mt-8 flex flex-col items-center justify-between gap-6 overflow-hidden rounded-3xl bg-linear-to-br from-blue-900 to-blue-700 p-6 text-center text-white shadow-xl md:flex-row md:p-8 md:text-left">
            {/* Icono + textos */}
            <div className="flex flex-col items-center gap-4 md:flex-row">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                <MapPinIcon className="h-6 w-6" />
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-sky-200">
                  Nuestro Templo
                </span>
                <p className="mt-1 text-lg font-semibold">
                  {IGLESIA.direccion}
                </p>
              </div>
            </div>

            {/* Botón */}
            <a
              href={IGLESIA.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full max-w-xs shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-sky-50 md:w-auto"
            >
              <MapPinIcon className="h-4 w-4" />
              Cómo llegar
            </a>
          </div>
        </div>
      </section>

    </>
  );
}
