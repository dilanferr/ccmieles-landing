import type { Metadata } from "next";
import PageHeader from "@/app/components/PageHeader";
import MosaicGallery from "@/app/components/MosaicGallery";
import { HeartIcon, PrayingHands, CheckIcon } from "@/app/components/icons";
import { IGLESIA, GALERIA_VISITAS } from "@/app/data/iglesia";

export const metadata: Metadata = {
  title: "Visita a Hogares",
  description:
    "Departamento de visitación a los hogares de enfermos y miembros de la comunidad del Centro Cristiano Mieles.",
};

// Tarjetas con foto de fondo (degradado de respaldo si la imagen no carga).
const LABORES = [
  {
    emoji: "🙏",
    titulo: "Oración en los hogares",
    texto:
      "Llevamos la presencia de Dios a cada casa, intercediendo por las familias y sus necesidades.",
    imagen:
      "https://images.unsplash.com/photo-1517021897933-0e0319cfbc28?auto=format&fit=crop&w=1200&q=80",
    gradiente: "from-blue-800 to-sky-600",
  },
  {
    emoji: "❤️",
    titulo: "Acompañamiento a enfermos",
    texto:
      "Visitamos a los hermanos enfermos para consolarlos, animarlos y orar por su sanidad.",
    imagen:
      "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=1200&q=80",
    gradiente: "from-blue-900 to-blue-600",
  },
  {
    emoji: "🤝",
    titulo: "Apoyo a la comunidad",
    texto:
      "Atendemos las necesidades espirituales y sociales de los miembros y vecinos del sector.",
    imagen:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80",
    gradiente: "from-sky-700 to-blue-800",
  },
];

// Encargadas del Departamento de Visita a Hogares.
const ENCARGADOS = [
  { nombre: "Hermana Erika Pérez", cargo: "Encargada" },
  { nombre: "Hermana Karina Obando", cargo: "Encargada" },
];

export default function VisitasPage() {
  return (
    <>
      <PageHeader
        eyebrow={IGLESIA.ministerio}
        titulo="Departamento de Visita a Hogares"
        descripcion="Grupo de Trabajo dedicado a llevar el amor de Cristo a los hogares de los enfermos y de toda la comunidad."
      />

      {/* ============ LA LABOR ============ */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Una labor social y espiritual
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
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-2xl ring-1 ring-white/25 backdrop-blur-sm">
                    {l.emoji}
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
          <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-700">
                <HeartIcon className="h-6 w-6" />
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                Encargadas del Ministerio
              </h2>
            </div>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {ENCARGADOS.map((p) => (
                <li
                  key={p.nombre}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
                >
                  <CheckIcon className="h-5 w-5 shrink-0 text-sky-500" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {p.nombre}
                    </p>
                    <p className="text-xs font-medium text-blue-700">
                      {p.cargo}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ============ GALERÍA: AMOR EN CADA HOGAR ============ */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
              Nuestra labor en imágenes
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Amor en cada hogar
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Cada visita es una huella del amor de Cristo. Estos son algunos
              momentos de nuestra labor en los hogares de la comunidad.
            </p>
          </div>

          <div className="mt-14">
            <MosaicGallery fotos={GALERIA_VISITAS} />
          </div>
        </div>
      </section>
    </>
  );
}
