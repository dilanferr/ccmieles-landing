/**
 * Contenido del ministerio de Coro y Juventud.
 *
 * TODO el contenido de la página vive aquí (modelos separados de la UI),
 * listo para migrar a Supabase. Reutiliza el cancionero y el reglamento que
 * ya existen en iglesia.ts para no duplicar datos.
 *
 * Enfoque: adoración a Dios en espíritu y verdad, y formación de nuevas
 * generaciones para el servicio del Señor.
 */

import type { IconName } from "@/app/components/icons";
import type { FotoGaleria } from "@/app/data/iglesia";
import type { Faq } from "@/app/components/ministry/FaqAccordion";

/* ===============================================================
   1 · HERO — tarjeta de adoración (glass)
   =============================================================== */

export type HeroStat = { icon: IconName; valor: string; label: string };

export const HERO = {
  eyebrow: "Ministerio de Alabanza",
  titulo: "Una familia que adora a Cristo",
  stats: [
    { icon: "music", valor: "2", label: "Ensayos por semana" },
    { icon: "users", valor: "12+", label: "Voces e instrumentos" },
    { icon: "spark", valor: "30+", label: "Cantos de adoración" },
    { icon: "flame", valor: "2007", label: "Sirviendo desde" },
  ] as HeroStat[],
};

/* ===============================================================
   2 · NUESTRA MISIÓN
   =============================================================== */

export const MISION = {
  icon: "music" as IconName,
  eyebrow: "Nuestra misión",
  titulo: "Adoradores que forman nuevas generaciones",
  texto:
    "Guiamos a la congregación a los pies de Cristo a través de la alabanza y la adoración, y formamos a los jóvenes en el amor por la música consagrada, el servicio y una vida entregada a Dios.",
};

/* ===============================================================
   3 · ¿QUÉ HACEMOS? — áreas del ministerio
   =============================================================== */

export type Area = { icon: IconName; titulo: string; texto: string };

export const AREAS: Area[] = [
  {
    icon: "music",
    titulo: "Alabanza congregacional",
    texto:
      "Guiamos la adoración en cada culto, llevando a la iglesia a la presencia de Dios.",
  },
  {
    icon: "users",
    titulo: "Coro",
    texto:
      "Voces unidas que exaltan el nombre del Señor con reverencia y alegría.",
  },
  {
    icon: "flame",
    titulo: "Juventud",
    texto:
      "Acompañamos y formamos a la nueva generación para amar y servir a Cristo.",
  },
  {
    icon: "spark",
    titulo: "Escuela de Música",
    texto:
      "Enseñamos a niños y jóvenes a tocar instrumentos para servir con excelencia.",
  },
  {
    icon: "play",
    titulo: "Producción musical",
    texto:
      "Preparamos el repertorio, el sonido y la parte técnica de cada servicio.",
  },
  {
    icon: "book",
    titulo: "Discipulado",
    texto:
      "Cultivamos la vida espiritual de cada integrante en la Palabra y la oración.",
  },
  {
    icon: "praying",
    titulo: "Ministración",
    texto:
      "Momentos de adoración profunda donde Dios consuela, sana y transforma.",
  },
  {
    icon: "rocket",
    titulo: "Nuevos talentos",
    texto:
      "Descubrimos y desarrollamos los dones que Dios ha puesto en cada joven.",
  },
];

/* ===============================================================
   4 · PILARES DE LA ADORACIÓN — con respaldo bíblico
   =============================================================== */

export type Pilar = {
  icon: IconName;
  titulo: string;
  texto: string;
  cita: string;
};

export const PILARES: Pilar[] = [
  {
    icon: "flame",
    titulo: "En espíritu y en verdad",
    texto:
      "Adoramos de corazón, con sinceridad y guiados por el Espíritu Santo, no solo con la voz.",
    cita: "Juan 4:23-24",
  },
  {
    icon: "praying",
    titulo: "Consagración",
    texto:
      "Presentamos nuestra vida como ofrenda viva y santa, agradable a Dios.",
    cita: "Romanos 12:1",
  },
  {
    icon: "spark",
    titulo: "Excelencia",
    texto:
      "Servimos con lo mejor de nuestros dones, cantando con arte y dedicación al Señor.",
    cita: "Salmos 33:3",
  },
  {
    icon: "heart",
    titulo: "Unidad",
    texto:
      "Cultivamos el amor y el compañerismo, porque en la unidad Dios envía bendición.",
    cita: "Salmos 133:1",
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
  { icon: "music", valor: 75, prefix: "+", label: "Cantos en el repertorio" },
  { icon: "calendar", valor: 100, prefix: "+", label: "Ensayos al año" },
  { icon: "users", valor: 12, label: "Voces e instrumentos" },
  { icon: "flame", valor: 18, prefix: "+", label: "Años de servicio" },
];

/* ===============================================================
   6 · ENSAYOS — horarios semanales
   =============================================================== */

export type Ensayo = { dia: string; actividad: string; hora: string; icon: IconName };

export const ENSAYOS: Ensayo[] = [
  {
    dia: "Sábado",
    actividad: "Escuela de Música",
    hora: "18:00 – 19:30 hrs",
    icon: "spark",
  },
  {
    dia: "Sábado",
    actividad: "Ensayo de Coro",
    hora: "20:00 – 21:30 hrs",
    icon: "music",
  },
  {
    dia: "Domingo",
    actividad: "Alabanza · Culto Familiar",
    hora: "11:30 hrs",
    icon: "flame",
  },
];

/* ===============================================================
   7 · EQUIPO — biografías (se cruzan con GRUPOS por nombre)
   =============================================================== */

export const EQUIPO_BIOS: Record<string, string> = {
  "Diacono Gabriel Acosta M.":
    "Dirige la alabanza y la adoración, guiando a la iglesia a la presencia de Dios con reverencia.",
  "Hermana Gloria Carrillo":
    "Coordina y organiza al equipo, sirviendo con orden y dedicación en cada actividad.",
  "Hermana Lissette Torres":
    "Administra los recursos del ministerio con fidelidad y transparencia.",
  "Hermano Miguel Wirth":
    "Encargado de la música y los instrumentos, cuida la excelencia técnica de cada servicio.",
};

/* ===============================================================
   8 · CÓMO PUEDES SERVIR — voces e instrumentos
   =============================================================== */

export type FormaDeServir = { icon: IconName; nombre: string };

export const FORMAS_SERVIR: FormaDeServir[] = [
  // Voces
  { icon: "music", nombre: "Voz / Coro" },
  // Teclas
  { icon: "spark", nombre: "Piano" },
  { icon: "spark", nombre: "Teclado" },
  { icon: "spark", nombre: "Acordeón" },
  // Cuerdas
  { icon: "music", nombre: "Guitarra" },
  { icon: "music", nombre: "Guitarra eléctrica" },
  { icon: "music", nombre: "Bajo" },
  { icon: "music", nombre: "Banjo" },
  { icon: "music", nombre: "Mandolina" },
  // Percusión
  { icon: "play", nombre: "Batería" },
  { icon: "play", nombre: "Bombo" },
  { icon: "play", nombre: "Güiro" },
  { icon: "play", nombre: "Pandero" },
  // Apoyo
  { icon: "signal", nombre: "Sonido" },
  { icon: "flame", nombre: "Juventud" },
];

/* ===============================================================
   9 · GALERÍA — masonry por categorías + modal
   =============================================================== */

export type FotoCategoria = FotoGaleria & { categoria: string };

export const GALERIA_CORO: FotoCategoria[] = [
  { publicId: "coro-culto-1", alt: "Alabanza en el culto dominical", span: "big", categoria: "Cultos" },
  { publicId: "coro-ensayo-1", alt: "Ensayo del coro", span: "tall", categoria: "Ensayos" },
  { publicId: "coro1", alt: "Encuentro de jóvenes", span: "normal", categoria: "Jóvenes" },
  { publicId: "coro-presentacion-1", alt: "Presentación especial de alabanza", span: "wide", categoria: "Presentaciones" },
  { publicId: "coro-culto-2", alt: "Adoración congregacional", span: "normal", categoria: "Cultos" },
  { publicId: "coro-musica-1", alt: "Clase de la escuela de música", span: "normal", categoria: "Escuela de Música" },
  { publicId: "coro-ensayo-2", alt: "Ensayo de voces e instrumentos", span: "normal", categoria: "Ensayos" },
  { publicId: "coro-jovenes-2", alt: "Jóvenes en comunión", span: "tall", categoria: "Jóvenes" },
  { publicId: "coro-presentacion-2", alt: "Coro en un aniversario", span: "normal", categoria: "Presentaciones" },
  { publicId: "coro-culto-3", alt: "Ministración en adoración", span: "wide", categoria: "Cultos" },
  { publicId: "coro-musica-2", alt: "Aprendiendo a tocar", span: "normal", categoria: "Escuela de Música" },
  { publicId: "coro-jovenes-3", alt: "Actividad juvenil", span: "big", categoria: "Jóvenes" },
];

/* ===============================================================
   10 · ÚNETE — invitación
   =============================================================== */

export const UNETE = {
  titulo: "¿Amas la música y quieres adorar a Dios?",
  texto:
    "Si tienes una voz para cantar, tocas un instrumento o deseas aprender, hay un lugar para ti en el coro y la juventud. Ven y sirve al Señor con tus dones.",
  cta: { label: "Quiero servir", href: "/oracion-peticion" },
};

/* ===============================================================
   11 · VERSÍCULOS destacados
   =============================================================== */

export type VersiculoDestacado = { cita: string; texto: string };

export const VERSICULOS: VersiculoDestacado[] = [
  {
    cita: "Salmos 95:1-2",
    texto:
      "Venid, aclamemos alegremente a Jehová; cantemos con júbilo a la roca de nuestra salvación. Lleguemos ante su presencia con alabanza; aclamémosle con cánticos.",
  },
  {
    cita: "Salmos 150:3-6",
    texto:
      "Alabadle a son de bocina; alabadle con salterio y arpa. Alabadle con pandero y danza; alabadle con cuerdas y flautas. Alabadle con címbalos resonantes; alabadle con címbalos de júbilo. Todo lo que respira alabe a JAH. Aleluya.",
  },
];

/* ===============================================================
   12 · PREGUNTAS FRECUENTES
   =============================================================== */

export const FAQ: Faq[] = [
  {
    pregunta: "¿Cómo puedo entrar al coro?",
    respuesta:
      "Acércate a un integrante del ministerio o al Ministro de Alabanza. Lo más importante no es tu nivel, sino tu deseo de adorar a Dios y tu compromiso con los ensayos.",
  },
  {
    pregunta: "¿Necesito saber música para participar?",
    respuesta:
      "No es indispensable. Recibimos a quienes quieren aprender, y en la Escuela de Música enseñamos desde lo básico. Dios usa a los corazones dispuestos.",
  },
  {
    pregunta: "¿Cuándo son los ensayos?",
    respuesta:
      "Los sábados: Escuela de Música de 18:00 a 19:30 hrs y Ensayo de Coro de 20:00 a 21:30 hrs. La constancia en el ensayo es parte del servicio.",
  },
  {
    pregunta: "¿Hay actividades para los jóvenes?",
    respuesta:
      "Sí. Además de la alabanza, tenemos encuentros y actividades para que la juventud crezca en la fe, la amistad y el servicio a Dios.",
  },
  {
    pregunta: "¿Puedo tocar un instrumento aunque sea principiante?",
    respuesta:
      "¡Claro! La Escuela de Música es justamente para formar nuevos músicos. Con dedicación y práctica podrás servir en la casa de Dios.",
  },
];
