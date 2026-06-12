import type { Metadata } from "next";
import PageHeader from "@/app/components/PageHeader";
import PrayerForm from "@/app/components/PrayerForm";
import { PrayingHands, LockIcon, HeartIcon } from "@/app/components/icons";
import { IGLESIA } from "@/app/data/iglesia";

const inicialesEncargada = IGLESIA.encargadaOracion
  .replace(/^(Hermana|Hermano|Pastora|Pastor|Diaconisa)\s+/i, "")
  .split(" ")
  .slice(0, 2)
  .map((w) => w[0])
  .join("")
  .toUpperCase();

export const metadata: Metadata = {
  title: "Oración y Petición",
  description:
    "Envía tu petición de oración al Centro Cristiano Mieles. El Cuerpo Ministerial intercede por cada necesidad de forma 100% confidencial.",
};

const COMO_FUNCIONA = [
  {
    Icon: LockIcon,
    titulo: "100% confidencial",
    texto:
      "Tu petición es privada. Solo la visualiza el Encargado y el Cuerpo Ministerial de la iglesia; nunca se publica sin autorización de la persona que la envía.",
  },
  {
    Icon: PrayingHands,
    titulo: "El Cuerpo Ministerial intercede",
    texto:
      "Nuestros pastores y líderes velan y claman a Dios por cada necesidad que llega, presentándola delante del Señor.",
  },
  {
    Icon: HeartIcon,
    titulo: "Unidos en acuerdo",
    texto:
      "Creemos en el poder de la oración en común acuerdo. No estás solo/a: oramos contigo y por ti con fe.",
  },
];

export default function OracionPeticionPage() {
  return (
    <>
      <PageHeader
        eyebrow="Estamos contigo en oración"
        titulo="Oración y Petición"
        descripcion="Un espacio consagrado a la intercesión. Comparte tu necesidad y nuestro Cuerpo Ministerial clamará a Dios por ti."
      />

      {/* ============ PROMESA BÍBLICA ============ */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-blue-900 via-blue-800 to-sky-600 p-10 text-center text-white shadow-2xl sm:p-14">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-sky-400/20 blur-3xl"
            />
            <div className="relative">
              <PrayingHands className="mx-auto h-12 w-12 text-sky-200" />
              <blockquote className="mx-auto mt-6 max-w-2xl text-2xl font-semibold leading-relaxed sm:text-3xl">
                «Porque donde están dos o tres congregados en mi nombre, allí
                estoy yo en medio de ellos.»
              </blockquote>
              <p className="mt-5 text-sm font-bold uppercase tracking-[0.2em] text-sky-200">
                Mateo 18:20
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FORMULARIO (directo, debajo del banner) ============ */}
      <section
        id="formulario"
        className="relative overflow-hidden bg-linear-to-b from-blue-50 to-white py-16 sm:py-20"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl"
        />

        <div className="relative mx-auto max-w-3xl px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
              <PrayingHands className="h-4 w-4" />
              Tu petición
            </span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Envía tu petición de oración
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">
              Completa el formulario con tu motivo (Sanidad, Liberación o
              Consolación) y oraremos por ti en privado.
            </p>
          </div>

          <div className="mt-12">
            <PrayerForm />
          </div>
        </div>
      </section>

      {/* ============ CÓMO FUNCIONA (respaldo de confianza) ============ */}
      <section className="bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
              Cómo funciona
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Un ministerio de intercesión
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Cada petición que recibimos es tomada con amor y respeto. Así
              cuidamos y presentamos tu necesidad delante de Dios.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {COMO_FUNCIONA.map(({ Icon, titulo, texto }) => (
              <article
                key={titulo}
                className="flex flex-col rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm transition-all hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-600/10"
              >
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-linear-to-br from-blue-50 to-sky-50 text-blue-700">
                  <Icon className="h-7 w-7" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  {titulo}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                  {texto}
                </p>
              </article>
            ))}
          </div>

          {/* Encargada del ministerio de intercesión (cierra la confianza) */}
          <div className="mx-auto mt-8 max-w-4xl overflow-hidden rounded-3xl border border-blue-100 bg-linear-to-br from-blue-50 to-white p-8 shadow-sm sm:p-10">
            <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
              <div className="grid h-24 w-24 shrink-0 place-items-center rounded-full bg-linear-to-br from-blue-700 to-sky-500 text-2xl font-bold text-white shadow-lg shadow-blue-600/25 ring-4 ring-white">
                {inicialesEncargada}
              </div>
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-700/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
                  <HeartIcon className="h-3.5 w-3.5" />
                  Encargada de Intercesión
                </span>
                <h3 className="mt-3 text-2xl font-bold text-slate-900">
                  {IGLESIA.encargadaOracion}
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                  Es la servidora encargada de recibir, clasificar y coordinar
                  cada petición junto al Cuerpo Ministerial, asegurando la
                  absoluta confidencialidad y el compromiso de clamar a Dios por
                  cada motivo: Sanidad, Liberación y Consolación.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
