/**
 * Contenido del Cuerpo Ministerial (liderazgo de la iglesia).
 *
 * TODO el contenido de la página vive aquí (modelos separados de la UI), listo
 * para migrar a Supabase. Nada hardcodeado en el widget principal.
 *
 * Enfoque: el liderazgo que pastorea la visión de la iglesia, velando por la
 * sana doctrina y el cuidado del rebaño del Señor (1 Pedro 5:2-4).
 */

import type { IconName } from "@/app/components/icons";
import type { Faq } from "@/app/components/ministry/FaqAccordion";

/* ===============================================================
   1 · HERO — tarjeta (glass)
   =============================================================== */

export type HeroStat = { icon: IconName; valor: string; label: string };

export const HERO = {
  eyebrow: "Liderazgo de la iglesia",
  titulo: "Siervos que pastorean el rebaño",
  stats: [
    { icon: "users", valor: "5", label: "En el cuerpo ministerial" },
    { icon: "flame", valor: "2007", label: "Sirviendo desde" },
    { icon: "calendar", valor: "3", label: "Cultos por semana" },
    { icon: "church", valor: "1", label: "Familia de la fe" },
  ] as HeroStat[],
};

/* ===============================================================
   2 · NUESTRO LLAMADO
   =============================================================== */

export const MISION = {
  icon: "church" as IconName,
  eyebrow: "Nuestro llamado",
  titulo: "Pastorear con el corazón de Cristo",
  texto:
    "El cuerpo ministerial dirige espiritual y administrativamente la obra, velando por la sana doctrina y el cuidado del rebaño del Señor, sirviendo con amor, orden y transparencia.",
};

/* ===============================================================
   3 · ¿QUÉ HACEMOS? — responsabilidades
   =============================================================== */

export type Area = { icon: IconName; titulo: string; texto: string };

export const AREAS: Area[] = [
  {
    icon: "spark",
    titulo: "Dirección espiritual",
    texto:
      "Guiamos la visión de la iglesia y velamos por la sana doctrina conforme a la Palabra.",
  },
  {
    icon: "heart",
    titulo: "Cuidado del rebaño",
    texto:
      "Acompañamos, exhortamos y consolamos a la familia de la fe con amor y cercanía.",
  },
  {
    icon: "megaphone",
    titulo: "Enseñanza y predicación",
    texto:
      "Alimentamos a la congregación con la Palabra de Dios en cada culto y estudio.",
  },
  {
    icon: "book",
    titulo: "Sana doctrina",
    texto:
      "Custodiamos la fe verdadera, enseñando y refutando conforme a las Escrituras.",
  },
  {
    icon: "praying",
    titulo: "Consejería pastoral",
    texto:
      "Acompañamos a personas y familias con la Palabra, la oración y la escucha.",
  },
  {
    icon: "chart",
    titulo: "Administración de la obra",
    texto:
      "Conducimos con orden y transparencia los asuntos de la congregación.",
  },
  {
    icon: "church",
    titulo: "Ordenanzas",
    texto:
      "Ministramos el bautismo y la Santa Cena, guardando lo que el Señor mandó.",
  },
  {
    icon: "globe",
    titulo: "Visión y gobierno",
    texto:
      "Discernimos la dirección de Dios para la iglesia y su misión en la ciudad.",
  },
];

/* ===============================================================
   4 · EL CORAZÓN DEL PASTOR — fundamento del liderazgo
   =============================================================== */

export const CORAZON = {
  eyebrow: "El corazón del pastor",
  titulo: "No como señores, sino como ejemplos",
  cita: "1 Pedro 5:2-4",
  parrafos: [
    "El cuerpo ministerial no gobierna por autoridad propia, sino como siervos puestos por el Espíritu Santo para apacentar la iglesia del Señor, la cual Él ganó por su propia sangre.",
    "Pastorear es cuidar: acompañar al que sufre, corregir con amor, enseñar la sana doctrina y velar por cada alma como quienes han de dar cuenta a Dios.",
    "Por eso servimos no por obligación ni por ganancia, sino de corazón, siendo ejemplos de la grey, con la mirada puesta en el Príncipe de los pastores, Jesucristo.",
  ],
};

/* ===============================================================
   5 · PILARES — cómo servimos (con respaldo bíblico)
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
    titulo: "Dirección espiritual",
    texto:
      "Cuidamos de la iglesia sobre la cual el Espíritu Santo nos ha puesto por obispos.",
    cita: "Hechos 20:28",
  },
  {
    icon: "heart",
    titulo: "Cuidado del rebaño",
    texto:
      "Apacentamos la grey de Dios, no por fuerza, sino voluntariamente y con ánimo pronto.",
    cita: "1 Pedro 5:2",
  },
  {
    icon: "book",
    titulo: "Sana doctrina",
    texto:
      "Retenemos la palabra fiel para exhortar con sana enseñanza y convencer a los que contradicen.",
    cita: "Tito 1:9",
  },
  {
    icon: "check",
    titulo: "Administración fiel",
    texto:
      "Se requiere de los administradores que cada uno sea hallado fiel ante Dios.",
    cita: "1 Corintios 4:2",
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
  { icon: "users", valor: 5, label: "Líderes Cuerpo Ministerial" },
  { icon: "flame", valor: 18, prefix: "+", label: "Años Pastoreando" },
  { icon: "heart", valor: 50, prefix: "+", label: "Familias Acompañadas" },
  { icon: "calendar", valor: 3, label: "Cultos por semana" },
];

/* ===============================================================
   7 · EQUIPO — biografías (se cruzan con GRUPOS por nombre)
   =============================================================== */

export const EQUIPO_BIOS: Record<string, string> = {
  "Obispo Juan Acosta G.":
    "Fundador y pastor principal. Guía la visión de la iglesia con amor, firmeza en la Palabra y un llamado que Dios confirmó desde su niñez.",
  "Pastora Paola Acosta M.":
    "Acompaña la dirección de la obra y el cuidado de la congregación con corazón pastoral y entrega.",
  "Diaconisa Daisy Acosta":
    "Administra con fidelidad y transparencia los recursos de la iglesia al servicio del Señor.",
  "Pastor Luis Torres":
    "Apoya el pastoreo y la enseñanza, sirviendo al rebaño con dedicación y cercanía.",
  "Diaconisa Marta Meza":
    "Sirve en la dirección y el cuidado de la familia de la fe con amor y disposición.",
};

/* ===============================================================
   8 · CUENTA CON NOSOTROS — cuidado pastoral
   =============================================================== */

export type Opcion = { icon: IconName; nombre: string };

export const ACOMPANAMIENTO: Opcion[] = [
  { icon: "praying", nombre: "Oración" },
  { icon: "heart", nombre: "Consejería" },
  { icon: "book", nombre: "Enseñanza" },
  { icon: "users", nombre: "Familia" },
  { icon: "church", nombre: "Bautismo" },
  { icon: "map", nombre: "Visitas" },
];

export const UNETE = {
  titulo: "Cuenta con tu liderazgo",
  texto:
    "Estamos para pastorearte. Si necesitas oración, consejería o acompañamiento, tu cuerpo ministerial está a tu disposición para servirte en el amor de Cristo.",
  cta: { label: "Enviar petición de oración", href: "/oracion-peticion" },
};

/* ===============================================================
   9 · PREGUNTAS FRECUENTES
   =============================================================== */

export const FAQ: Faq[] = [
  {
    pregunta: "¿Qué es el cuerpo ministerial?",
    respuesta:
      "Es el grupo de pastores y líderes que Dios ha puesto para dirigir espiritual y administrativamente la iglesia, velando por la sana doctrina y el cuidado de cada miembro.",
  },
  {
    pregunta: "¿Cómo puedo hablar con un pastor?",
    respuesta:
      "Acércate después de cualquier culto o déjanos tu petición por el sitio. Con gusto coordinamos un tiempo para escucharte y orar contigo.",
  },
  {
    pregunta: "¿Cómo solicito consejería?",
    respuesta:
      "Puedes pedirla directamente a un pastor o enviar tu solicitud por la sección de oración. El acompañamiento es confidencial y con amor.",
  },
  {
    pregunta: "¿Cómo puedo bautizarme o ser miembro?",
    respuesta:
      "El bautismo es un paso de obediencia tras creer en Cristo. Habla con el liderazgo y te acompañaremos en la preparación y en tu integración a la familia de la fe.",
  },
  {
    pregunta: "¿Cómo puedo servir en la iglesia?",
    respuesta:
      "Dios tiene un lugar para ti. Cuéntale al liderazgo tus dones e inquietudes y te ayudaremos a integrarte a un ministerio donde puedas servir al Señor.",
  },
];
