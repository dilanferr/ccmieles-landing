import type { Metadata } from "next";
import PageHeader from "@/app/components/PageHeader";
import PrayerForm from "@/app/components/PrayerForm";
import PersonCard from "@/app/components/PersonCard";
import MinisteriosNav from "@/app/components/MinisteriosNav";
import CtaFinal from "@/app/components/ministry/CtaFinal";
import SectionHeader from "@/app/components/SectionHeader";
import { getSettings } from "@/src/utils/settings";
import { PrayingHands, LockIcon, HeartIcon } from "@/app/components/icons";
import { IGLESIA, NAV_GRUPOS } from "@/app/data/iglesia";

export const metadata: Metadata = {
  title: "Oración y Petición",
  description:
    "Envía tu petición de oración al Centro Cristiano Mieles. El Cuerpo Ministerial intercede por cada necesidad de forma 100% confidencial.",
  alternates: { canonical: "/oracion-peticion" },
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

// Promesas bíblicas sobre la oración (Reina-Valera 1960).
const VERSICULOS = [
  {
    cita: "Marcos 11:24",
    texto:
      "Por tanto, os digo que todo lo que pidiereis orando, creed que lo recibiréis, y os vendrá.",
  },
  {
    cita: "San Juan 15:7",
    texto:
      "Si permanecéis en mí, y mis palabras permanecen en vosotros, pedid todo lo que queréis, y os será hecho.",
  },
  {
    cita: "San Mateo 21:22",
    texto: "Y todo lo que pidiereis en oración, creyendo, lo recibiréis.",
  },
  {
    cita: "1 Juan 5:14-15",
    texto:
      "Y esta es la confianza que tenemos en él, que si pedimos alguna cosa conforme a su voluntad, él nos oye.",
  },
];

export const revalidate = 60;

export default async function OracionPeticionPage() {
  const s = await getSettings();
  return (
    <>
      <PageHeader
        eyebrow="Estamos contigo en oración"
        titulo="Oración y Petición"
        descripcion="Un espacio consagrado a la intercesión. Comparte tu necesidad y nuestro Cuerpo Ministerial clamará a Dios por ti."
        primaryCta={{ label: "Enviar petición", href: "#formulario" }}
        secondaryCta={{
          label: "Cómo llegar",
          href: s.mapsUrl,
          external: true,
        }}
        aside={
          <div>
            <div className="flex items-center gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                <PrayingHands className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-200">
                  Intercesión
                </p>
                <p className="text-lg font-bold">Estamos contigo</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-sky-50/90">
              Recibimos cada petición con amor y respeto. No estás solo/a:
              oramos contigo y por ti con fe.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/15">
              <LockIcon className="h-3.5 w-3.5" />
              100% confidencial
            </div>
          </div>
        }
      />

      <MinisteriosNav items={NAV_GRUPOS} activeHref="/oracion-peticion" />

      {/* ============ PROMESAS BÍBLICAS (4 versículos) ============ */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader
            eyebrow="Promesas de Su Palabra"
            icon={PrayingHands}
            titulo="Él escucha y responde"
          />

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VERSICULOS.map((v) => (
              <article
                key={v.cita}
                className="flex flex-col rounded-3xl bg-linear-to-br from-blue-900 to-blue-700 p-6 text-white shadow-lg shadow-blue-900/10 transition-all hover:-translate-y-1.5 hover:shadow-xl sm:p-7"
              >
                <span
                  aria-hidden
                  className="font-serif text-5xl leading-none text-sky-300/70"
                >
                  “
                </span>
                <blockquote className="-mt-3 flex-1 text-sm italic leading-relaxed text-sky-50/95">
                  {v.texto}
                </blockquote>
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.15em] text-sky-200">
                  {v.cita}
                </p>
              </article>
            ))}
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
          <SectionHeader
            eyebrow="Cómo funciona"
            titulo="Un Ministerio de intercesión"
            subtitulo="Cada petición que recibimos es tomada con amor y respeto. Así cuidamos y presentamos tu necesidad delante de Dios."
          />

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
          <div className="mx-auto mt-10 max-w-sm">
            <PersonCard
              nombre={IGLESIA.encargadaOracion.nombre}
              cargo="Encargada de Petición de Oración"
              imageUrl={IGLESIA.encargadaOracion.foto}
              descripcion="Recibe, clasifica y coordina cada petición junto al Cuerpo Ministerial, asegurando la absoluta confidencialidad y el compromiso de clamar a Dios por cada motivo: Sanidad, Liberación y Consolación."
            />
          </div>
        </div>
      </section>

      <CtaFinal
        titulo="No estás solo/a"
        texto="Estamos contigo en oración. Ven y sé parte de nuestra familia de fe en el Centro Cristiano Mieles."
        primaryCta={{
          label: "Cómo llegar",
          href: s.mapsUrl,
          external: true,
        }}
        secondaryCta={{ label: "Conoce la iglesia", href: "/nosotros" }}
      />
    </>
  );
}
