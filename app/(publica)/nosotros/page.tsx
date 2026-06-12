import type { Metadata } from "next";
import PageHeader from "@/app/components/PageHeader";
import { CheckIcon, SparkIcon, HeartIcon } from "@/app/components/icons";
import TimelineCarousel from "@/app/components/TimelineCarousel";
import {
  IGLESIA,
  DECLARACION_FE,
  OBJETIVOS,
  LO_QUE_HACEMOS,
  HITOS,
} from "@/app/data/iglesia";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Conoce el génesis del Centro Cristiano Mieles, nuestra declaración de fe y los objetivos de nuestro ministerio.",
};

// Revalida la página periódicamente para no servir una versión congelada.
export const revalidate = 60;

export default function NosotrosPage() {
  return (
    <>
      <PageHeader
        eyebrow="Nuestra Iglesia"
        titulo="Nosotros"
        descripcion="Una obra levantada por Dios para la restauración, la fe y la comunión familiar."
      />

      {/* ============ NUESTRO GÉNESIS ============ */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
              Nuestro Génesis
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Una historia que comenzó el{" "}
              <span className="text-blue-700">30 de agosto de 2007</span>
            </h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-600">
              <p>
                El Centro Cristiano Mieles nació del llamado de Dios para
                levantar un lugar de liberación y restauración. Desde aquel 30 de
                agosto de 2007, la obra ha crecido como una familia unida por la
                fe en Jesucristo.
              </p>
              <p>
                A lo largo de los años, Dios ha sido fiel: ha sanado, ha
                libertado y ha transformado innumerables vidas. Hoy seguimos
                firmes en el propósito de predicar el evangelio y servir a nuestra
                comunidad.
              </p>
            </div>
          </div>

          {/* Carrusel interactivo de línea de tiempo */}
          <TimelineCarousel hitos={HITOS} />
        </div>
      </section>

      {/* ============ DOCTRINA ============ */}
      <section className="bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
              Lo que creemos
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Doctrina y fundamentos
            </h2>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Declaración de Fe */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
              <div className="mb-6 flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-700">
                  <SparkIcon className="h-6 w-6" />
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  Declaración de Fe
                </h3>
              </div>
              <ul className="space-y-4">
                {DECLARACION_FE.map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-sky-500" />
                    <span className="text-sm leading-relaxed text-slate-700">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Objetivos */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
              <div className="mb-6 flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-700">
                  <CheckIcon className="h-6 w-6" />
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  Objetivos del Ministerio
                </h3>
              </div>
              <ul className="space-y-4">
                {OBJETIVOS.map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue-700 text-[11px] font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="text-sm leading-relaxed text-slate-700">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Lo que hacemos como iglesia */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10 md:col-span-2 lg:col-span-1">
              <div className="mb-6 flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-700">
                  <HeartIcon className="h-6 w-6" />
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  Lo que hacemos como iglesia
                </h3>
              </div>
              <ul className="space-y-4">
                {LO_QUE_HACEMOS.map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-sky-500" />
                    <span className="text-sm leading-relaxed text-slate-700">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Personalidad Jurídica */}
          <div className="mt-8 overflow-hidden rounded-3xl bg-linear-to-br from-blue-900 to-blue-700 p-8 text-white sm:p-10">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-sky-200">
              Personalidad Jurídica
            </span>
            <p className="mt-3 max-w-3xl text-lg font-semibold leading-relaxed sm:text-xl">
              {IGLESIA.personaJuridica}
            </p>
            <p className="mt-4 text-sm text-sky-100/80">
              Institución legalmente constituida al servicio del Señor y de la
              comunidad.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
