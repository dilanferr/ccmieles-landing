/**
 * Contenido de la Escuela de Música.
 *
 * TODO el contenido de la página vive aquí (modelos separados de la UI), listo
 * para migrar a Supabase. Los "avances de los alumnos" y el horario se leen
 * desde iglesia.ts (getGrupo) para no duplicarlos.
 *
 * Enfoque: formar a niños y jóvenes en la música para servir a Dios con
 * excelencia, disciplina y un corazón consagrado.
 */

import type { IconName } from "@/app/components/icons";
import type { FotoGaleria } from "@/app/data/iglesia";
import type { Faq } from "@/app/components/ministry/FaqAccordion";

/* ===============================================================
   1 · HERO — tarjeta (glass)
   =============================================================== */

export type HeroStat = { icon: IconName; valor: string; label: string };

export const HERO = {
  eyebrow: "Formación musical",
  titulo: "Aprende a servir con la música",
  stats: [
    { icon: "music", valor: "6", label: "Instrumentos" },
    { icon: "calendar", valor: "Sáb", label: "Clases cada semana" },
    { icon: "users", valor: "20+", label: "Alumnos formados" },
    { icon: "spark", valor: "0", label: "Nivel para empezar" },
  ] as HeroStat[],
};

/* ===============================================================
   2 · NUESTRA MISIÓN
   =============================================================== */

export const MISION = {
  icon: "music" as IconName,
  eyebrow: "Nuestra misión",
  titulo: "Talentos formados para la gloria de Dios",
  texto:
    "Preparamos a niños y jóvenes en el dominio de los instrumentos para que sirvan en la casa de Dios, cultivando la excelencia, la disciplina y un corazón consagrado al Señor.",
};

/* ===============================================================
   3 · ¿QUÉ ENSEÑAMOS? — instrumentos y áreas
   =============================================================== */

export type Area = { icon: IconName; titulo: string; texto: string };

export const INSTRUMENTOS: Area[] = [
  {
    icon: "music",
    titulo: "Guitarra",
    texto: "Acordes, ritmos y acompañamiento para la alabanza congregacional.",
  },
  {
    icon: "spark",
    titulo: "Teclado / Piano",
    texto: "Notas, escalas y armonía para dirigir y acompañar la adoración.",
  },
  {
    icon: "signal",
    titulo: "Bajo",
    texto: "El fundamento rítmico y armónico que sostiene a toda la banda.",
  },
  {
    icon: "play",
    titulo: "Batería",
    texto: "Tiempo, coordinación y dinámica para marcar el pulso de los cantos.",
  },
  {
    icon: "flame",
    titulo: "Canto",
    texto: "Técnica vocal, afinación y expresión para adorar con la voz.",
  },
  {
    icon: "book",
    titulo: "Teoría musical",
    texto: "Lectura, ritmo y lenguaje musical como base para todo instrumento.",
  },
  {
    icon: "users",
    titulo: "Ensamble",
    texto: "Práctica grupal para aprender a tocar juntos y servir en equipo.",
  },
  {
    icon: "praying",
    titulo: "Adoración",
    texto: "Más que técnica: aprender a ministrar con el corazón delante de Dios.",
  },
];

/* ===============================================================
   4 · PILARES — valores de la escuela (con respaldo bíblico)
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
    titulo: "Excelencia",
    texto:
      "Enseñamos a hacer las cosas bien, porque lo que se ofrece a Dios se da con lo mejor.",
    cita: "Salmos 33:3",
  },
  {
    icon: "check",
    titulo: "Disciplina",
    texto:
      "La constancia en la práctica forma el carácter tanto como el talento.",
    cita: "Proverbios 22:29",
  },
  {
    icon: "praying",
    titulo: "Consagración",
    texto:
      "El don musical es de Dios y a Él se lo devolvemos como acto de adoración.",
    cita: "Romanos 12:1",
  },
  {
    icon: "heart",
    titulo: "Servicio",
    texto:
      "No formamos artistas para el aplauso, sino siervos para la casa de Dios.",
    cita: "1 Pedro 4:10",
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
  { icon: "users", valor: 20, prefix: "+", label: "Alumnos formados" },
  { icon: "music", valor: 6, label: "Instrumentos" },
  { icon: "calendar", valor: 4, label: "Clases al mes" },
  { icon: "chart", valor: 200, prefix: "+", label: "Horas de práctica" },
];

/* ===============================================================
   6 · RUTA DE APRENDIZAJE — niveles
   =============================================================== */

export type Nivel = { icon: IconName; titulo: string; texto: string };

export const RUTA: Nivel[] = [
  {
    icon: "book",
    titulo: "Fundamentos",
    texto: "Notas, ritmo, postura y primeros conceptos musicales.",
  },
  {
    icon: "music",
    titulo: "Primeros acordes",
    texto: "Los primeros pasos reales en tu instrumento.",
  },
  {
    icon: "spark",
    titulo: "Práctica y repertorio",
    texto: "Cantos de adoración que ya puedes tocar y cantar.",
  },
  {
    icon: "users",
    titulo: "Ensamble",
    texto: "Tocar junto a otros músicos como un solo cuerpo.",
  },
  {
    icon: "flame",
    titulo: "Servicio en el culto",
    texto: "Ministrar en la alabanza de la iglesia.",
  },
];

/* ===============================================================
   7 · REQUISITOS — para inscribirse
   =============================================================== */

export const REQUISITOS: string[] = [
  "Ganas de aprender y compromiso con las clases de los sábados.",
  "Asistir con puntualidad y practicar durante la semana.",
  "Traer tu instrumento si lo tienes; hay algunos disponibles para practicar.",
  "Un corazón dispuesto a servir a Dios con la música.",
];

/* ===============================================================
   7b · EQUIPO — biografías (se cruzan con GRUPOS por nombre)
   =============================================================== */

export const EQUIPO_BIOS: Record<string, string> = {
  "Hermano Jordan Zamorano":
    "Con paciencia y dedicación, enseña a los alumnos no solo a tocar, sino a entender que su talento es un don de Dios para servir en la casa del Señor.",
};

/* ===============================================================
   8 · GALERÍA — masonry por categorías + modal
   =============================================================== */

export type FotoCategoria = FotoGaleria & { categoria: string };

export const GALERIA_MUSICA: FotoCategoria[] = [
  { publicId: "c_1", alt: "Clase de guitarra", span: "big", categoria: "Clases" },
  { publicId: "musica-practica-1", alt: "Práctica en el teclado", span: "tall", categoria: "Práctica" },
  { publicId: "musica-presentacion-1", alt: "Presentación de los alumnos", span: "normal", categoria: "Presentaciones" },
  { publicId: "c_2", alt: "Aprendiendo teoría musical", span: "wide", categoria: "Clases" },
  { publicId: "musica-practica-2", alt: "Ensamble de banda", span: "normal", categoria: "Práctica" },
  { publicId: "musica-clase-3", alt: "Clase de batería", span: "normal", categoria: "Clases" },
  { publicId: "musica-presentacion-2", alt: "Recital interno", span: "tall", categoria: "Presentaciones" },
  { publicId: "musica-practica-3", alt: "Práctica de canto", span: "normal", categoria: "Práctica" },
  { publicId: "c_3", alt: "Primeros acordes en guitarra", span: "wide", categoria: "Clases" },
];

/* ===============================================================
   9 · INSCRÍBETE — invitación + qué puedes aprender
   =============================================================== */

export type Opcion = { icon: IconName; nombre: string };

export const APRENDER: Opcion[] = [
  { icon: "music", nombre: "Guitarra" },
  { icon: "spark", nombre: "Teclado" },
  { icon: "signal", nombre: "Bajo" },
  { icon: "play", nombre: "Batería" },
  { icon: "flame", nombre: "Canto" },
  { icon: "book", nombre: "Teoría musical" },
];

export const UNETE = {
  titulo: "¿Quieres aprender música para servir a Dios?",
  texto:
    "No importa tu edad ni tu nivel: en la Escuela de Música te enseñamos desde cero a tocar un instrumento y a usar tus dones para la gloria de Dios.",
  cta: { label: "Quiero inscribirme", href: "/oracion-peticion" },
};

/* ===============================================================
   10 · VERSÍCULO destacado
   =============================================================== */

export const VERSICULO = {
  cita: "Salmos 33:3",
  texto: "Cantadle cántico nuevo; hacedlo bien, tañendo con júbilo.",
};

/* ===============================================================
   11 · PREGUNTAS FRECUENTES
   =============================================================== */

export const FAQ: Faq[] = [
  {
    pregunta: "¿Quién puede inscribirse?",
    respuesta:
      "Niños y jóvenes de la congregación con deseo de aprender. Lo importante no es la edad ni la experiencia, sino el compromiso y el corazón para servir.",
  },
  {
    pregunta: "¿Necesito traer mi propio instrumento?",
    respuesta:
      "Si tienes uno, tráelo para practicar. Si no, contamos con algunos instrumentos disponibles para las clases mientras consigues el tuyo.",
  },
  {
    pregunta: "¿Cuándo son las clases?",
    respuesta:
      "Las clases son los sábados de 18:00 a 19:30 hrs, antes del ensayo del coro, para que puedas integrarte al servicio poco a poco.",
  },
  {
    pregunta: "¿Tiene algún costo?",
    respuesta:
      "No. La Escuela de Música es un ministerio de la iglesia; enseñamos de forma gratuita como parte del servicio a Dios y a la comunidad.",
  },
  {
    pregunta: "¿Qué instrumentos puedo aprender?",
    respuesta:
      "Guitarra, teclado, bajo, batería y canto, además de teoría musical como base. Con el tiempo te integrarás al ensamble y a la alabanza.",
  },
];
