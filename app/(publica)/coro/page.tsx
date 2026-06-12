import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/app/components/PageHeader";
import { CheckIcon, MusicIcon, CalendarIcon } from "@/app/components/icons";
import { REGLAMENTO_CORO, CANCIONERO } from "@/app/data/iglesia";

export const metadata: Metadata = {
  title: "Coro y Alabanza",
  description:
    "Ensayos, reglamento interno y cancionero del Ministerio de Coro y Juventud del Centro Cristiano Mieles.",
};

export default function CoroPage() {
  return (
    <>
      <PageHeader
        eyebrow="Ministerio de Alabanza"
        titulo="Coro y Adoración"
        descripcion="Voces e instrumentos consagrados para exaltar el nombre del Señor en cada servicio."
      />

      {/* ============ ENSAYOS Y REUNIONES ============ */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-700">
                <CalendarIcon className="h-6 w-6" />
              </span>
              <h2 className="mt-5 text-xl font-bold text-slate-900">
                Los Ensayos
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Cada semana nos reunimos para preparar las alabanzas que
                ministraremos. Los ensayos son un tiempo de práctica, unidad y
                consagración delante de Dios.
              </p>
              <p className="mt-4 inline-flex rounded-xl bg-sky-50 px-4 py-2 text-sm font-semibold text-blue-700">
                Viernes · 20:00 hrs
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-700">
                <MusicIcon className="h-6 w-6" />
              </span>
              <h2 className="mt-5 text-xl font-bold text-slate-900">
                Reunión de Coro
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Espacios de comunión, organización y crecimiento espiritual del
                ministerio. Aquí coordinamos los servicios y fortalecemos el
                compañerismo entre los integrantes.
              </p>
              <Link
                href="/grupos/coro-juventud"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-700 transition-all hover:gap-2"
              >
                Ver integrantes del coro <span aria-hidden>→</span>
              </Link>
            </div>
          </div>

          {/* Reglamento */}
          <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50/60 p-8 sm:p-10">
            <h2 className="text-2xl font-bold text-slate-900">
              Reglamento Interno del Coro
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Lineamientos que cuidamos para servir en orden y santidad.
            </p>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {REGLAMENTO_CORO.map((regla, i) => (
                <li
                  key={i}
                  className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-blue-700 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed text-slate-700">
                    {regla}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ============ CANCIONERO ============ */}
      <section className="bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
              <MusicIcon className="h-4 w-4" />
              Repertorio
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Alabanzas que Ensayamos
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Nuestro cancionero. Pronto enlazado a los archivos en Google Drive.
            </p>
          </div>

          <ul className="mt-12 divide-y divide-slate-200 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {CANCIONERO.map((c, i) => (
              <li
                key={c.titulo}
                className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-blue-50/50"
              >
                <span className="w-6 text-sm font-bold text-slate-300">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-blue-700">
                  <MusicIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{c.titulo}</p>
                  <p className="text-xs text-slate-500">{c.autor}</p>
                </div>
                {c.tono && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    Tono {c.tono}
                  </span>
                )}
                <CheckIcon className="h-5 w-5 text-emerald-500" />
              </li>
            ))}
          </ul>

          <p className="mt-6 text-center text-sm text-slate-500">
            Los audios y partituras estarán disponibles en la carpeta compartida
            de Google Drive del ministerio.
          </p>
        </div>
      </section>
    </>
  );
}
