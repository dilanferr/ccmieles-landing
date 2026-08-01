/**
 * Contenido del Grupo Dorcas (ministerio femenino).
 *
 * TODO el contenido de la página vive aquí (modelos separados de la UI), listo
 * para migrar a Supabase. Nada hardcodeado en el widget principal.
 *
 * Enfoque: mujeres al servicio de Dios y de la comunidad, inspiradas en el
 * ejemplo de Dorcas (Hechos 9:36-42), sirviendo con amor y obras de misericordia.
 */

import type { IconName } from "@/app/components/icons";
import type { FotoGaleria } from "@/app/data/iglesia";
import type { Faq } from "@/app/components/ministry/FaqAccordion";

/* ===============================================================
   1 · HERO — tarjeta (glass)
   =============================================================== */

export type HeroStat = { icon: IconName; valor: string; label: string };

export const HERO = {
  eyebrow: "Ministerio Femenino",
  titulo: "Mujeres que sirven con amor",
  stats: [
    { icon: "heart", valor: "100+", label: "Obras de amor" },
    { icon: "users", valor: "50+", label: "Familias bendecidas" },
    { icon: "calendar", valor: "Sáb", label: "Culto femenino" },
    { icon: "flame", valor: "2007", label: "Sirviendo desde" },
  ] as HeroStat[],
};

/* ===============================================================
   2 · NUESTRA MISIÓN
   =============================================================== */

export const MISION = {
  icon: "heart" as IconName,
  eyebrow: "Nuestra misión",
  titulo: "Manos de amor al servicio del Señor",
  texto:
    "Inspiradas en el ejemplo de Dorcas, las hermanas sirven con amor a la iglesia y a los más necesitados a través de obras de misericordia, la oración y una vida entregada a Dios.",
};

/* ===============================================================
   3 · ¿QUÉ HACEMOS? — labores del ministerio
   =============================================================== */

export type Area = { icon: IconName; titulo: string; texto: string };

export const AREAS: Area[] = [
  {
    icon: "heart",
    titulo: "Obras de misericordia",
    texto:
      "Extendemos la mano al que sufre, llevando ayuda y consuelo en el nombre de Cristo.",
  },
  {
    icon: "map",
    titulo: "Visitas a hogares de ancianos",
    texto:
      "Acompañamos con oración y cariño a los ancianos en necesidad.",
  },
  {
    icon: "users",
    titulo: "Ayuda al necesitado",
    texto:
      "Reunimos y compartimos recursos para bendecir a familias y personas vulnerables.",
  },
  {
    icon: "praying",
    titulo: "Oración e intercesión",
    texto:
      "Clamamos juntas por la iglesia, las familias y las peticiones de la congregación.",
  },
  {
    icon: "palette",
    titulo: "Labores y manos que sirven",
    texto:
      "Como Dorcas, usamos nuestros dones y trabajos para servir y bendecir a otros con el amor de Dios.",
  },
  {
    icon: "spark",
    titulo: "Comunión femenina",
    texto:
      "Cultivamos la amistad, el ánimo y el crecimiento espiritual entre las hermanas.",
  },
  {
    icon: "book",
    titulo: "Consejería y apoyo",
    texto:
      "Acompañamos a mujeres y familias con la Palabra, escucha y contención.",
  },
  {
    icon: "megaphone",
    titulo: "Evangelismo",
    texto:
      "Compartimos el amor de Jesús con otras mujeres, invitándolas a los pies de Cristo.",
  },
];

/* ===============================================================
   4 · QUIÉN FUE DORCAS — fundamento del ministerio
   =============================================================== */

export const QUIEN_DORCAS = {
  eyebrow: "Nuestro nombre",
  titulo: "¿Quién fue Dorcas?",
  cita: "Hechos 9:36-42",
  parrafos: [
    "Dorcas —también llamada Tabita— fue una discípula que vivía en Jope, conocida por ser «abundante en buenas obras y en limosnas que hacía». Con sus propias manos confeccionaba túnicas y vestidos para las viudas y los más necesitados.",
    "Cuando enfermó y murió, la comunidad la lloró mostrando las ropas que ella había hecho. El apóstol Pedro, movido por Dios, oró y el Señor la levantó de entre los muertos; y muchos en Jope creyeron en el Señor.",
    "Su vida es nuestro modelo: una fe que se hace visible en el servicio, en manos dispuestas a bendecir y en un corazón lleno del amor de Cristo.",
  ],
};

/* ===============================================================
   5 · PILARES — valores del ministerio (con respaldo bíblico)
   =============================================================== */

export type Pilar = {
  icon: IconName;
  titulo: string;
  texto: string;
  cita: string;
};

export const PILARES: Pilar[] = [
  {
    icon: "check",
    titulo: "Fe con obras",
    texto:
      "La religión pura se muestra visitando y sirviendo a los que sufren, no solo con palabras.",
    cita: "Santiago 1:27",
  },
  {
    icon: "heart",
    titulo: "Manos que sirven",
    texto:
      "Como Dorcas, abundamos en buenas obras que reflejan el amor de Dios.",
    cita: "Hechos 9:36",
  },
  {
    icon: "spark",
    titulo: "Mujer virtuosa",
    texto:
      "Extendemos la mano al pobre y al necesitado, con fortaleza y bondad.",
    cita: "Proverbios 31:20",
  },
  {
    icon: "users",
    titulo: "Hacer el bien",
    texto:
      "Mientras tengamos oportunidad, hacemos bien a todos, y a la familia de la fe.",
    cita: "Gálatas 6:10",
  },
];

/* ===============================================================
   6 · EN NÚMEROS — contadores animados
   =============================================================== */

export type Cifra = {
  icon: IconName;
  valor: number;
  prefix?: string;
  suffix?: string;
  label: string;
};

export const CIFRAS: Cifra[] = [
  { icon: "heart", valor: 100, prefix: "+", label: "Obras de amor" },
  { icon: "users", valor: 50, prefix: "+", label: "Familias bendecidas" },
  { icon: "calendar", valor: 4, label: "Reuniones al mes" },
  { icon: "flame", valor: 18, prefix: "+", label: "Años de servicio" },
];

/* ===============================================================
   7 · REUNIONES — cuándo servimos
   =============================================================== */

export type Reunion = { icon: IconName; titulo: string; cuando: string; detalle: string };

export const REUNIONES: Reunion[] = [
  {
    icon: "heart",
    titulo: "Culto Femenino (Dorcas)",
    cuando: "Sábados · 16:00 hrs",
    detalle: "Adoración, Palabra y comunión entre las hermanas.",
  },
  {
    icon: "map",
    titulo: "Visitas y obras",
    cuando: "Durante la semana",
    detalle: "Salidas  programadas y obras de servicio a hogares de ancianos.",
  },
  {
    icon: "praying",
    titulo: "Oración e intercesión",
    cuando: "Coordinada",
    detalle: "Nos reunimos a clamar por la iglesia y las familias.",
  },
];

/* ===============================================================
   8 · EQUIPO — biografías (se cruzan con GRUPOS por nombre)
   =============================================================== */

export const EQUIPO_BIOS: Record<string, string> = {
  "Pastora Gloria Mori C.":
    "Guía al ministerio con corazón de madre y sierva, inspirando a las hermanas a amar y servir como Cristo.",
  "Hermana Verónica Jerez":
    "Organiza y coordina las actividades del grupo, sirviendo con orden, entrega y dedicación.",
  "Hermana Nancy Fernández":
    "Administra con fidelidad los recursos del ministerio para bendecir a quienes lo necesitan.",
};

/* ===============================================================
   9 · GALERÍA — masonry por categorías + modal
   =============================================================== */

export type FotoCategoria = FotoGaleria & { categoria: string };

export const GALERIA_DORCAS: FotoCategoria[] = [
  { publicId: "dorcas-culto-1", alt: "Culto femenino Dorcas", span: "big", categoria: "Reuniones" },
  { publicId: "dorcas-servicio-1", alt: "Obras de misericordia", span: "tall", categoria: "Servicio" },
  { publicId: "dorcas-visita-1", alt: "Visita a un hogar", span: "normal", categoria: "Visitas" },
  { publicId: "dorcas-comunion-1", alt: "Comunión entre hermanas", span: "wide", categoria: "Comunión" },
  { publicId: "dorcas-culto-2", alt: "Adoración de las hermanas", span: "normal", categoria: "Reuniones" },
  { publicId: "dorcas-servicio-2", alt: "Ayuda a familias", span: "normal", categoria: "Servicio" },
  { publicId: "dorcas-visita-2", alt: "Oración por los enfermos", span: "tall", categoria: "Visitas" },
  { publicId: "dorcas-comunion-2", alt: "Compañerismo femenino", span: "normal", categoria: "Comunión" },
  { publicId: "dorcas-servicio-3", alt: "Manos que sirven", span: "wide", categoria: "Servicio" },
];

/* ===============================================================
   10 · ÚNETE — invitación + formas de servir
   =============================================================== */

export type Opcion = { icon: IconName; nombre: string };

export const FORMAS_SERVIR: Opcion[] = [
  { icon: "praying", nombre: "Oración" },
  { icon: "map", nombre: "Visitas" },
  { icon: "palette", nombre: "Labores" },
  { icon: "users", nombre: "Ayuda social" },
  { icon: "book", nombre: "Consejería" },
  { icon: "megaphone", nombre: "Evangelismo" },
];

export const UNETE = {
  titulo: "Sirve a Dios con manos de amor",
  texto:
    "Si eres mujer y deseas servir al Señor bendiciendo a otros —con oración, ayuda, visitas o tus dones— hay un lugar para ti en el Grupo Dorcas.",
  cta: { label: "Quiero servir", href: "/oracion-peticion" },
};

/* ===============================================================
   11 · VERSÍCULO destacado
   =============================================================== */

export const VERSICULO = {
  cita: "Proverbios 31:30",
  texto:
    "Engañosa es la gracia, y vana la hermosura; la mujer que teme a Jehová, ésa será alabada.",
};

/* ===============================================================
   12 · PREGUNTAS FRECUENTES
   =============================================================== */

export const FAQ: Faq[] = [
  {
    pregunta: "¿Quiénes pueden participar en el Grupo Dorcas?",
    respuesta:
      "Todas las mujeres de la congregación que deseen servir a Dios y a los demás. No se necesita experiencia, solo un corazón dispuesto a amar y ayudar.",
  },
  {
    pregunta: "¿Cuándo se reúnen?",
    respuesta:
      "El Culto Femenino (Dorcas) es los sábados a las 16:00 hrs. Además, durante la semana coordinamos visitas y obras de servicio.",
  },
  {
    pregunta: "¿Qué tipo de ayuda brindan?",
    respuesta:
      "Visitamos enfermos y hogares, apoyamos a familias en necesidad, oramos por la congregación y realizamos obras de misericordia inspiradas en Dorcas.",
  },
  {
    pregunta: "¿Cómo puedo colaborar o aportar?",
    respuesta:
      "Puedes servir con tu tiempo, tus dones o con donaciones para las obras de ayuda. Acércate a la directiva y con gusto te orientaremos.",
  },
  {
    pregunta: "¿Necesito alguna habilidad especial?",
    respuesta:
      "No. Dios usa la disposición del corazón. Si sabes coser, cocinar, orar o simplemente acompañar, todo eso bendice a quienes servimos.",
  },
];
