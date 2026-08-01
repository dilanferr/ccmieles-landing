import type { Metadata } from "next";
import PageHeader from "@/app/components/PageHeader";
import MosaicGallery from "@/app/components/MosaicGallery";
import PersonCard from "@/app/components/PersonCard";
import MinisteriosNav from "@/app/components/MinisteriosNav";
import CtaFinal from "@/app/components/ministry/CtaFinal";
import SectionHeader from "@/app/components/SectionHeader";
import { getSettings } from "@/src/utils/settings";
import { HeartIcon, PrayingHands, UsersIcon, type Icon } from "@/app/components/icons";
import { IGLESIA, GALERIA_VISITAS, NAV_GRUPOS, cloudinaryUrl } from "@/app/data/iglesia";

export const metadata: Metadata = {
  title: "Visita a Hogares",
  description:
    "Departamento de visitación a los hogares de enfermos y miembros de la comunidad del Centro Cristiano Mieles.",
  alternates: { canonical: "/departamento-visitas" },
};

// Tarjetas con foto de fondo (degradado de respaldo si la imagen no carga).
const LABORES: {
  Icon: Icon;
  titulo: string;
  texto: string;
  imagen: string;
  gradiente: string;
}[] = [
  {
    Icon: PrayingHands,
    titulo: "Oración en los Hogares",
    texto:
      "Llevamos la presencia de Dios a cada casa, intercediendo por las familias y sus necesidades.",
    imagen:
      "https://images.unsplash.com/photo-1517021897933-0e0319cfbc28?auto=format&fit=crop&w=1200&q=80",
    gradiente: "from-blue-800 to-sky-600",
  },
  {
    Icon: HeartIcon,
    titulo: "Acompañamiento a Enfermos",
    texto:
      "Visitamos a los hermanos enfermos para consolarlos, animarlos y orar por su sanidad.",
    imagen:
      "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=1200&q=80",
    gradiente: "from-blue-900 to-blue-600",
  },
  {
    Icon: UsersIcon,
    titulo: "Apoyo a la Comunidad",
    texto:
      "Atendemos las necesidades espirituales y sociales de los miembros y vecinos del sector.",
    imagen:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80",
    gradiente: "from-sky-700 to-blue-800",
  },
];

// Encargadas del Departamento de Visita a Hogares.
// imageUrl: pega la URL de la foto en Cloudinary (déjalo "" para usar iniciales).
const ENCARGADOS = [
  { 
    nombre: "Hermana Erika Pérez",
    cargo: "Encargada", 
    foto: cloudinaryUrl("Hermana-Erika-Perez-2")},
];

export const revalidate = 60;

export default async function VisitasPage() {
  const s = await getSettings();
  return (
    <>
      <PageHeader
        eyebrow={IGLESIA.ministerio}
        titulo="Departamento de Visita a Hogares"
        descripcion="Grupo de Trabajo dedicado a llevar el amor de Cristo a los hogares de los enfermos y de toda la comunidad."
        primaryCta={{
          label: "Cómo llegar",
          href: s.mapsUrl,
          external: true,
        }}
        aside={
          <div>
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                <HeartIcon className="h-7 w-7" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-200">
                  Visitación
                </p>
                <p className="text-lg font-bold">El amor de Cristo, casa por casa</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-sky-50/90">
              Llevamos oración, compañía y apoyo espiritual a los enfermos y a
              toda la comunidad.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/15">
              <PrayingHands className="h-3.5 w-3.5" />
              {ENCARGADOS.length} encargadas del ministerio
            </div>
          </div>
        }
      />

      <MinisteriosNav items={NAV_GRUPOS} activeHref="/departamento-visitas" />

      {/* ============ LA LABOR ============ */}
      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Una Labor Social y Espiritual
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">
              Creemos que la iglesia no vive solo dentro de cuatro paredes. Por
              eso salimos a los hogares para servir, orar y compartir la esperanza
              que hay en Cristo Jesús, tal como Él nos enseñó.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {LABORES.map((l) => (
              <article
                key={l.titulo}
                className="group relative flex min-h-80 flex-col justify-end overflow-hidden rounded-3xl shadow-lg ring-1 ring-blue-900/10 transition-all hover:-translate-y-1.5 hover:shadow-xl hover:shadow-blue-600/20"
              >
                {/* Degradado base (respaldo si la foto no carga) */}
                <div
                  className={`absolute inset-0 bg-linear-to-br ${l.gradiente}`}
                />
                {/* Foto de fondo con zoom al hover */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url('${l.imagen}')` }}
                />
                {/* Veladura azul para legibilidad */}
                <div className="absolute inset-0 bg-linear-to-t from-blue-950/90 via-blue-950/55 to-blue-900/25" />

                {/* Contenido */}
                <div className="relative p-7 text-white">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-sm">
                    <l.Icon className="h-7 w-7" />
                  </span>
                  <h3 className="mt-4 text-xl font-bold drop-shadow">
                    {l.titulo}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-sky-50/90 drop-shadow">
                    {l.texto}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============ VERSÍCULO + ENCARGADAS ============ */}
      <section className="bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl bg-linear-to-br from-blue-900 via-blue-800 to-sky-600 p-10 text-white shadow-2xl sm:p-14">
            <div className="mx-auto max-w-3xl text-center">
              <PrayingHands className="mx-auto h-10 w-10 text-sky-200" />
              <blockquote className="mt-6 text-2xl font-semibold leading-relaxed sm:text-3xl">
                «Enfermo, y me visitasteis... En cuanto lo hicisteis a uno de
                estos mis hermanos más pequeños, a mí lo hicisteis.»
              </blockquote>
              <p className="mt-4 text-sm font-medium uppercase tracking-[0.2em] text-sky-200">
                Mateo 25:36, 40
              </p>
            </div>
          </div>

          {/* Encargadas */}
          <div className="mt-12 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
              <HeartIcon className="h-4 w-4" />
              Encargadas del Departamento
            </span>
          </div>
          <div className="mx-auto mt-4 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2">
            {ENCARGADOS.map((p) => (
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

      {/* ============ GALERÍA: AMOR EN CADA HOGAR ============ */}
      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader
            eyebrow="Nuestra labor en imágenes"
            titulo="Amor en cada Hogar"
            subtitulo="Cada visita es una huella del amor de Cristo. Estos son algunos momentos de nuestra labor en los hogares de la comunidad."
          />

          <div className="mt-14">
            <MosaicGallery fotos={GALERIA_VISITAS} />
          </div>
        </div>
      </section>

      <CtaFinal
        titulo="¿Conoces a alguien que necesite una visita?"
        texto="Llevamos oración, compañía y apoyo espiritual a los hogares. Cuéntanos y oraremos por esa familia."
        primaryCta={{
          label: "Cómo llegar",
          href: s.mapsUrl,
          external: true,
        }}
        secondaryCta={{ label: "Petición de oración", href: "/oracion-peticion" }}
      />
    </>
  );
}
