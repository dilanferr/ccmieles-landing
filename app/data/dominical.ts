/**
 * Contenido de la Escuela Dominical Infantil.
 *
 * TODO el contenido de la página vive aquí (modelos separados de la UI), listo
 * para migrar a Supabase. Nada hardcodeado en el widget principal.
 *
 * Enfoque: sembrar la Palabra de Dios en el corazón de los niños con amor,
 * alegría y seguridad, formando una nueva generación que ama y sirve a Cristo.
 */

import type { IconName } from "@/app/components/icons";
import type { FotoGaleria } from "@/app/data/iglesia";
import type { Faq } from "@/app/components/ministry/FaqAccordion";

/* ===============================================================
   1 · HERO — tarjeta (glass)
   =============================================================== */

export type HeroStat = { icon: IconName; valor: string; label: string };

export const HERO = {
  eyebrow: "Ministerio Infantil",
  titulo: "El amor de Jesús para los más pequeños",
  stats: [
    { icon: "heart", valor: "3-12", label: "Años de edad" },
    { icon: "calendar", valor: "Dom", label: "Cada domingo" },
    { icon: "users", valor: "5+", label: "Niños cada semana" },
    { icon: "book", valor: "+20", label: "Historias bíblicas" },
  ] as HeroStat[],
};

/* ===============================================================
   2 · NUESTRA MISIÓN
   =============================================================== */

export const MISION = {
  icon: "spark" as IconName,
  eyebrow: "Nuestra misión",
  titulo: "Sembrando la Palabra en el corazón de los niños",
  texto:
    "Enseñamos a los más pequeños el amor de Jesús a través de historias bíblicas, cantos, manualidades y juegos, formando una nueva generación que ama, conoce y sirve a Dios.",
};

/* ===============================================================
   3 · ¿QUÉ HACEMOS? — actividades
   =============================================================== */

export type Area = { icon: IconName; titulo: string; texto: string };

export const AREAS: Area[] = [
  {
    icon: "book",
    titulo: "Historias bíblicas",
    texto:
      "Enseñamos la Palabra de forma sencilla y visual, para que los niños conozcan a Jesús.",
  },
  {
    icon: "music",
    titulo: "Cantos y alabanza",
    texto:
      "Adoramos a Dios con cantos alegres que quedan grabados en su corazón.",
  },
  {
    icon: "palette",
    titulo: "Manualidades",
    texto:
      "Reforzamos cada enseñanza con actividades creativas que los niños se llevan a casa.",
  },
  {
    icon: "spark",
    titulo: "Juegos y dinámicas",
    texto:
      "Aprender es divertido: los niños crecen jugando en un ambiente sano y seguro.",
  },
  {
    icon: "check",
    titulo: "Versículos para memorizar",
    texto:
      "Guardamos la Palabra de Dios en el corazón, un versículo a la vez.",
  },
  {
    icon: "praying",
    titulo: "Oración",
    texto:
      "Enseñamos a los niños a hablar con Dios y a confiar en Él desde pequeños.",
  },
  {
    icon: "heart",
    titulo: "Valores cristianos",
    texto:
      "Sembramos amor, respeto, obediencia y bondad conforme a la Palabra.",
  },
  {
    icon: "flame",
    titulo: "Actividades especiales",
    texto:
      "Celebraciones, obras y fechas especiales que hacen inolvidable cada domingo.",
  },
];

/* ===============================================================
   4 · PILARES — por qué enseñamos a los niños (con respaldo bíblico)
   =============================================================== */

export type Pilar = {
  icon: IconName;
  titulo: string;
  texto: string;
  cita: string;
};

export const PILARES: Pilar[] = [
  {
    icon: "spark",
    titulo: "Formar desde la niñez",
    texto:
      "Lo que se siembra en la infancia da fruto toda la vida: instruimos al niño en su camino.",
    cita: "Proverbios 22:6",
  },
  {
    icon: "heart",
    titulo: "De ellos es el Reino",
    texto:
      "Jesús mismo llamó a los niños a su lado; por eso los recibimos con amor.",
    cita: "Mateo 19:14",
  },
  {
    icon: "book",
    titulo: "Enseñar la Palabra",
    texto:
      "Repetimos las enseñanzas de Dios a los niños en cada oportunidad.",
    cita: "Deuteronomio 6:6-7",
  },
  {
    icon: "users",
    titulo: "Herencia de Dios",
    texto:
      "Los hijos son herencia de Jehová; los cuidamos como un tesoro que Él confía.",
    cita: "Salmos 127:3",
  },
];

/* ===============================================================
   5 · EN NÚMEROS — contadores animados
   =============================================================== */

export type Cifra = {
  icon: IconName;
  valor: number;
  prefix?: string;
  suffix?: string;
  label: string;
};

export const CIFRAS: Cifra[] = [
  { icon: "users", valor: 25, prefix: "+", label: "Niños cada domingo" },
  { icon: "calendar", valor: 50, label: "Clases al año" },
  { icon: "book", valor: 40, prefix: "+", label: "Historias bíblicas" },
  { icon: "heart", valor: 100, suffix: "%", label: "Hecho con amor" },
];

/* ===============================================================
   6 · CÓMO ES UNA CLASE — momentos del domingo
   =============================================================== */

export type Momento = { icon: IconName; titulo: string; texto: string };

export const MOMENTOS: Momento[] = [
  { icon: "heart", titulo: "Bienvenida", texto: "Recibimos a cada niño con cariño." },
  { icon: "music", titulo: "Alabanza", texto: "Cantos alegres para adorar a Dios." },
  { icon: "book", titulo: "Historia bíblica", texto: "La enseñanza del día, contada con amor." },
  { icon: "check", titulo: "Versículo", texto: "Memorizamos la Palabra juntos." },
  { icon: "palette", titulo: "Manualidad", texto: "Creamos algo que refuerza la lección." },
  { icon: "praying", titulo: "Oración", texto: "Cerramos hablando con nuestro Padre." },
];

/* ===============================================================
   7 · EQUIPO — biografías (se cruzan con GRUPOS por nombre)
   =============================================================== */

export const EQUIPO_BIOS: Record<string, string> = {
  "Hermana Gloria Garrillo":
    "Con vocación y ternura, guía a los niños en el conocimiento de Jesús, sembrando en ellos la Palabra que dará fruto toda la vida.",
};

/* ===============================================================
   8 · GALERÍA — masonry por categorías + modal
   =============================================================== */

export type FotoCategoria = FotoGaleria & { categoria: string };

export const GALERIA_DOMINICAL: FotoCategoria[] = [
  { publicId: "escuela-dominical-1", alt: "Clase bíblica con los niños", span: "big", categoria: "Clases" },
  { publicId: "escuela-dominical-3", alt: "Cantos y alabanza infantil", span: "tall", categoria: "Alabanza" },
  { publicId: "escuela-dominical-2", alt: "Manualidades y actividades", span: "normal", categoria: "Actividades" },
  { publicId: "escuela-dominical-4", alt: "Historias de la Biblia", span: "wide", categoria: "Clases" },
  { publicId: "escuela-dominical-5", alt: "Juegos y aprendizaje", span: "normal", categoria: "Actividades" },
  { publicId: "escuela-dominical-6", alt: "Momento de oración", span: "normal", categoria: "Oración" },
];

/* ===============================================================
   9 · INVITACIÓN — para los papás
   =============================================================== */

export type Opcion = { icon: IconName; nombre: string };

export const APRENDEN: Opcion[] = [
  { icon: "book", nombre: "Historias" },
  { icon: "music", nombre: "Cantos" },
  { icon: "check", nombre: "Versículos" },
  { icon: "palette", nombre: "Manualidades" },
  { icon: "heart", nombre: "Valores" },
  { icon: "praying", nombre: "Oración" },
];

export const UNETE = {
  titulo: "Trae a tus hijos a conocer a Jesús",
  texto:
    "Cada domingo tus hijos aprenden el amor de Dios de una forma divertida, segura y llena de cariño. Un espacio donde crecen felices en la fe.",
  cta: { label: "Quiero participar", href: "/oracion-peticion" },
};

/* ===============================================================
   10 · VERSÍCULO destacado
   =============================================================== */

export const VERSICULO = {
  cita: "Mateo 19:14",
  texto:
    "Dejad a los niños venir a mí, y no se lo impidáis; porque de los tales es el reino de los cielos.",
};

/* ===============================================================
   11 · PREGUNTAS FRECUENTES
   =============================================================== */

export const FAQ: Faq[] = [
  {
    pregunta: "¿Desde qué edad pueden asistir los niños?",
    respuesta:
      "Recibimos a niños de aproximadamente 3 a 12 años, con enseñanzas adaptadas a cada edad para que todos aprendan y disfruten.",
  },
  {
    pregunta: "¿Cuándo es la Escuela Dominical?",
    respuesta:
      "Los domingos, durante el culto familiar, para que los papás puedan participar del servicio mientras sus hijos aprenden en su propio espacio.",
  },
  {
    pregunta: "¿Es un lugar seguro para mi hijo?",
    respuesta:
      "Sí. Los niños están siempre acompañados por hermanas responsables, en un ambiente sano, cuidado y lleno de amor.",
  },
  {
    pregunta: "¿Qué aprenden los niños?",
    respuesta:
      "Historias bíblicas, cantos, versículos para memorizar, valores cristianos y a orar, todo de una forma divertida y cercana a su edad.",
  },
  {
    pregunta: "¿Cómo puedo servir en el ministerio infantil?",
    respuesta:
      "Si amas a los niños y quieres enseñarles de Jesús, acércate a la encargada. Siempre hay lugar para servir con manualidades, cantos o enseñanza.",
  },
];
