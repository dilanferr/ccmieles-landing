/**
 * Contenido del Departamento de Comunicación Digital.
 *
 * TODO el contenido de la página vive aquí (modelos de datos separados de la
 * UI). Cada bloque es un arreglo/objeto tipado, listo para reemplazarse por
 * una consulta a Supabase con la misma forma. Nada hardcodeado en el widget.
 *
 * Paleta institucional: Azul (dominante) · Celeste/Sky (acentos) · Blanco.
 */

import type { IconName } from "@/app/components/icons";
import type { BrandKey } from "@/app/components/brand-logos";
import type { FotoGaleria } from "@/app/data/iglesia";
import { IGLESIA } from "@/app/data/iglesia";

const CORREO_DEPTO = "comunicacion@ccmieles.cl";

/* ===============================================================
   1 · HERO — estado del departamento + métricas (tarjeta glass)
   =============================================================== */

export type HeroStat = { icon: IconName; valor: string; label: string };

export const HERO = {
  estado: "Activo",
  stats: [
    { icon: "signal", valor: "8", label: "Servicios digitales" },
    { icon: "users", valor: "5", label: "Integrantes" },
    { icon: "rocket", valor: "6", label: "Proyectos activos" },
    { icon: "video", valor: "14", label: "Transmisiones este mes" },
  ] as HeroStat[],
};

/* ===============================================================
   2 · NUESTRA MISIÓN
   =============================================================== */

export const MISION = {
  icon: "signal" as IconName,
  eyebrow: "Nuestra misión",
  titulo: "La iglesia más allá de las paredes del templo",
  texto:
    "Llevamos el Evangelio más allá de las paredes del templo mediante herramientas digitales, creando contenido que inspire, enseñe y conecte a las personas con Cristo.",
};

/* ===============================================================
   3 · ¿QUÉ HACEMOS? — servicios (grid de tarjetas)
   =============================================================== */

export type Servicio = { icon: IconName; titulo: string; texto: string };

export const SERVICIOS: Servicio[] = [
  {
    icon: "camera",
    titulo: "Fotografía",
    texto:
      "Registramos los momentos de la vida de la iglesia con una mirada que cuenta historias.",
  },
  {
    icon: "video",
    titulo: "Producción Audiovisual",
    texto:
      "Testimonios, resúmenes y contenido en video que alcanza corazones.",
  },
  {
    icon: "share",
    titulo: "Redes Sociales",
    texto:
      "Administramos Facebook, Instagram, TikTok y YouTube con contenido que edifica e invita.",
  },
  {
    icon: "code",
    titulo: "Desarrollo Web",
    texto:
      "Construimos y mantenemos el sitio oficial y las plataformas internas del ministerio.",
  },
  {
    icon: "megaphone",
    titulo: "Publicidad Digital",
    texto:
      "Difundimos eventos y campañas para llegar a más personas en el mundo digital.",
  },
  {
    icon: "signal",
    titulo: "Transmisiones",
    texto:
      "Llevamos cada culto y evento a los hogares en tiempo real, para que nadie se quede sin la Palabra.",
  },
];

/* ===============================================================
   4 · NUESTRO IMPACTO — contadores animados (AnimatedCounter)
   =============================================================== */

export type Impacto = {
  icon: IconName;
  valor: number;
  prefix?: string;
  suffix?: string;
  label: string;
};

export const IMPACTO: Impacto[] = [
  { icon: "share", valor: 350, prefix: "+", label: "Publicaciones" },
  { icon: "signal", valor: 120, label: "Cultos transmitidos" },
  { icon: "users", valor: 5000, label: "Personas alcanzadas" },
  { icon: "video", valor: 900, label: "Horas de edición" },
  { icon: "palette", valor: 100, label: "Diseños realizados" },
  { icon: "check", valor: 99, suffix: "%", label: "Disponibilidad" },
];

/* ===============================================================
   5 · PROYECTOS — tarjetas con estado, progreso, fecha y responsable
   =============================================================== */

export type EstadoProyecto = "activo" | "desarrollo" | "planificado";

export type Proyecto = {
  icon: IconName;
  nombre: string;
  descripcion: string;
  estado: EstadoProyecto;
  progreso: number; // 0–100
  fecha: string;
  responsable: string;
};

export const PROYECTOS: Proyecto[] = [
  {
    icon: "globe",
    nombre: "Portal Web",
    descripcion:
      "La casa digital de la iglesia: ministerios, eventos, testimonios y peticiones de oración.",
    estado: "activo",
    progreso: 100,
    fecha: "En línea",
    responsable: "Hno. Dilan Ferreira",
  },
  {
    icon: "signal",
    nombre: "Streaming",
    descripcion:
      "Sistema de transmisión en vivo de cultos y eventos con calidad profesional.",
    estado: "activo",
    progreso: 95,
    fecha: "Cada semana",
    responsable: "Hno. Dilan Ferreira - Hno. Bryan Cerda",
  },
  {
    icon: "device",
    nombre: "Aplicación Móvil",
    descripcion:
      "Una app para acompañar la vida devocional y mantener conectada a la congregación.",
    estado: "planificado",
    progreso: 0,
    fecha: "2027",
    responsable: "Hno. Dilan Ferreira",
  },
  {
    icon: "camera",
    nombre: "Gestión Multimedia",
    descripcion:
      "Organización y respaldo del archivo de fotos y videos de la iglesia en la nube.",
    estado: "activo",
    progreso: 100,
    fecha: "2026",
    responsable: "Diác. Gabriel Acosta - Diác. Deisy Acosta",
  },
  {
    icon: "praying",
    nombre: "Sistema de Peticiones",
    descripcion:
      "Plataforma para recibir y gestionar las peticiones de oración de la congregación.",
    estado: "activo",
    progreso: 100,
    fecha: "En línea",
    responsable: "Hno. Dilan Ferreira",
  },
];

/** Etiqueta y color de cada estado (badge). */
export const ESTADO_INFO: Record<
  EstadoProyecto,
  { label: string; badge: string; dot: string; barra: string }
> = {
  activo: {
    label: "Activo",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
    barra: "from-emerald-500 to-green-500",
  },
  desarrollo: {
    label: "En desarrollo",
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
    dot: "bg-amber-500",
    barra: "from-amber-500 to-orange-500",
  },
  planificado: {
    label: "Planificado",
    badge: "bg-sky-50 text-sky-700 ring-sky-200",
    dot: "bg-sky-500",
    barra: "from-sky-500 to-blue-500",
  },
};

/* ===============================================================
   6 · TECNOLOGÍAS — badges con logos de marca oficiales
   =============================================================== */

export type Tecnologia = { nombre: string; logo: BrandKey };

export const TECNOLOGIAS: Tecnologia[] = [
  { nombre: "Flutter", logo: "flutter" },
  { nombre: "Supabase", logo: "supabase" },
  { nombre: "GitHub", logo: "github" },
  { nombre: "Cloudflare", logo: "cloudflare" },
  { nombre: "Canva", logo: "canva" },
  { nombre: "OBS Studio", logo: "obs" },
  { nombre: "Google Workspace", logo: "googleWorkspace" },
];

/* ===============================================================
   7 · EQUIPO — info que se cruza con GRUPOS por nombre.
   Fotos y cargos viven en data/iglesia.ts (getGrupo); aquí solo
   agregamos bio, especialidad y correo para no duplicar la persona.
   =============================================================== */

export type EquipoInfo = {
  descripcion: string;
  especialidad: string;
  correo: string;
};

export const EQUIPO_INFO: Record<string, EquipoInfo> = {
  "Pastor Luis Torres": {
    descripcion:
      "Dirige la visión del departamento, cuidando que cada mensaje que sale a lo digital honre a Dios y edifique a la iglesia.",
    especialidad: "Dirección y visión",
    correo: CORREO_DEPTO,
  },
  "Pastora Paola Acosta": {
    descripcion:
      "Acompaña la dirección y la producción de contenido, velando por la excelencia y la sana doctrina en cada publicación.",
    especialidad: "Contenido y edición",
    correo: CORREO_DEPTO,
  },
  "Hermano Dilan Ferreira": {
    descripcion:
      "Desarrolla y mantiene el sitio web y las plataformas internas, poniendo la tecnología al servicio del evangelio.",
    especialidad: "Desarrollo web",
    correo: CORREO_DEPTO,
  },
  "Hermano Bryan Cerda": {
    descripcion:
      "Apoya la producción técnica, el streaming y la cobertura de los eventos de la iglesia.",
    especialidad: "Producción y streaming",
    correo: CORREO_DEPTO,
  },
  "Diacono Gabriel Acosta": {
    descripcion:
      "Administra las redes sociales, creando contenido que conecta e invita a nuevas vidas a conocer a Cristo.",
    especialidad: "Redes sociales",
    correo: CORREO_DEPTO,
  },
};

/* ===============================================================
   8 · GALERÍA — masonry por categorías + modal
   =============================================================== */

export const CATEGORIAS_GALERIA = [
  "Cultos",
  "Eventos",
  "Evangelismo",
  "Conferencias",
  "Aniversarios",
  "Escuela Dominical",
] as const;

export type CategoriaGaleria = (typeof CATEGORIAS_GALERIA)[number];

export type FotoCategoria = FotoGaleria & { categoria: CategoriaGaleria };

export const GALERIA_COMUNICACION: FotoCategoria[] = [
  { publicId: "comdig-culto-1", alt: "Adoración durante el culto dominical", span: "big", categoria: "Cultos" },
  { publicId: "comdig-evento-1", alt: "Cobertura del aniversario de la iglesia", span: "tall", categoria: "Eventos" },
  { publicId: "comdig-evang-1", alt: "Evangelismo en la vía pública", span: "normal", categoria: "Evangelismo" },
  { publicId: "comdig-conf-1", alt: "Conferencia de la Palabra", span: "wide", categoria: "Conferencias" },
  { publicId: "comdig-aniv-1", alt: "Celebración de aniversario", span: "normal", categoria: "Aniversarios" },
  { publicId: "comdig-culto-2", alt: "Predicación en el culto de enseñanza", span: "normal", categoria: "Cultos" },
  { publicId: "comdig-dominical-1", alt: "Escuela dominical infantil", span: "normal", categoria: "Escuela Dominical" },
  { publicId: "comdig-evento-2", alt: "Vigilia de oración", span: "tall", categoria: "Eventos" },
  { publicId: "comdig-evang-2", alt: "Campaña de evangelización", span: "normal", categoria: "Evangelismo" },
  { publicId: "comdig-conf-2", alt: "Encuentro de jóvenes", span: "normal", categoria: "Conferencias" },
  { publicId: "comdig-aniv-2", alt: "Aniversario del ministerio", span: "wide", categoria: "Aniversarios" },
  { publicId: "comdig-culto-3", alt: "Coro y alabanza en vivo", span: "normal", categoria: "Cultos" },
  { publicId: "comdig-dominical-2", alt: "Actividades con los niños", span: "normal", categoria: "Escuela Dominical" },
  { publicId: "comdig-evento-3", alt: "Bautismos en agua", span: "big", categoria: "Eventos" },
];

/* ===============================================================
   9 · CALENDARIO DE COBERTURA — timeline semanal
   `equipos`: qué roles participan (icono + etiqueta).
   =============================================================== */

export type RolEquipo = { icon: IconName; label: string };

export type Cobertura = {
  dia: string;
  actividad: string;
  detalle: string;
  equipos: RolEquipo[];
};

const R_FOTO: RolEquipo = { icon: "camera", label: "Fotografía" };
const R_VIDEO: RolEquipo = { icon: "video", label: "Video" };
const R_AUDIO: RolEquipo = { icon: "music", label: "Audio" };
const R_WEB: RolEquipo = { icon: "code", label: "Web / Redes" };

export const COBERTURA_SEMANAL: Cobertura[] = [
  {
    dia: "Domingo",
    actividad: "Culto General",
    detalle: "Cobertura completa: fotografía, video, streaming y redes en vivo.",
    equipos: [R_FOTO, R_VIDEO, R_AUDIO, R_WEB],
  },
  {
    dia: "Miércoles",
    actividad: "Estudio Bíblico",
    detalle: "Transmisión en vivo y resúmenes de la enseñanza para redes.",
    equipos: [R_VIDEO, R_AUDIO, R_WEB],
  },
  {
    dia: "Viernes",
    actividad: "Culto de Jóvenes",
    detalle: "Fotografía y contenido dinámico para redes sociales.",
    equipos: [R_FOTO, R_VIDEO, R_WEB],
  },
  {
    dia: "Sábado",
    actividad: "Actividad Especial",
    detalle: "Cobertura según el evento: campañas, conferencias o aniversarios.",
    equipos: [R_FOTO, R_VIDEO, R_AUDIO],
  },
];

/* ===============================================================
   10 · FLUJO DE TRABAJO — línea de pasos
   =============================================================== */

export type PasoFlujo = { icon: IconName; titulo: string };

export const FLUJO: PasoFlujo[] = [
  { icon: "mail", titulo: "Solicitud" },
  { icon: "calendar", titulo: "Planificación" },
  { icon: "palette", titulo: "Diseño" },
  { icon: "search", titulo: "Revisión" },
  { icon: "check", titulo: "Aprobación" },
  { icon: "share", titulo: "Publicación" },
  { icon: "chart", titulo: "Seguimiento" },
];

/* ===============================================================
   11 · REDES SOCIALES — tarjetas grandes
   =============================================================== */

export type RedSocial = {
  logo: BrandKey;
  nombre: string;
  handle: string;
  seguidores: string;
  ultima: string;
  url: string;
  color: string; // degradado de marca para el encabezado
};

export const REDES: RedSocial[] = [
  {
    logo: "facebook",
    nombre: "Facebook",
    handle: "@centrocristianomieles",
    seguidores: "3.2K",
    ultima: "Hace 1 día",
    url: IGLESIA.redes.facebook,
    color: "from-blue-600 to-blue-500",
  },
  {
    logo: "instagram",
    nombre: "Instagram",
    handle: "@centrocristianomieles",
    seguidores: "1.8K",
    ultima: "Hace 2 días",
    url: IGLESIA.redes.instagram,
    color: "from-fuchsia-600 via-rose-500 to-amber-500",
  },
  {
    logo: "tiktok",
    nombre: "TikTok",
    handle: "@ccmieles",
    seguidores: "2.1K",
    ultima: "Hace 3 días",
    url: IGLESIA.redes.tiktok,
    color: "from-slate-800 to-slate-900",
  },
  {
    logo: "youtube",
    nombre: "YouTube",
    handle: "@CCMieles",
    seguidores: "1.2K",
    ultima: "Cada domingo",
    url: IGLESIA.redes.youtube,
    color: "from-red-600 to-red-500",
  },
  {
    logo: "whatsapp",
    nombre: "WhatsApp",
    handle: "Comunidad Mieles",
    seguidores: "300+",
    ultima: "A diario",
    url: "#",
    color: "from-emerald-500 to-green-600",
  },
  {
    logo: "telegram",
    nombre: "Telegram",
    handle: "Canal Mieles",
    seguidores: "150+",
    ultima: "A diario",
    url: "#",
    color: "from-sky-500 to-blue-500",
  },
];

/* ===============================================================
   12 · ÚNETE AL EQUIPO — CTA + especialidades
   =============================================================== */

export type Especialidad = { icon: IconName; nombre: string };

export const ESPECIALIDADES: Especialidad[] = [
  { icon: "palette", nombre: "Diseño" },
  { icon: "video", nombre: "Video" },
  { icon: "camera", nombre: "Fotografía" },
  { icon: "code", nombre: "Programación" },
  { icon: "signal", nombre: "Streaming" },
  { icon: "music", nombre: "Audio" },
  { icon: "share", nombre: "Community Manager" },
];

export const UNETE = {
  titulo: "¿Quieres servir con tus talentos?",
  texto:
    "Si tienes conocimientos en diseño, fotografía, programación, video, redes sociales o simplemente deseas aprender, puedes ser parte del Departamento de Comunicación Digital.",
  cta: { label: "Quiero Servir", href: "/oracion-peticion" },
};

/* ===============================================================
   13 · VERSÍCULO
   =============================================================== */

export const VERSICULO_COMUNICACION = {
  cita: "Marcos 16:15",
  texto: "Id por todo el mundo y predicad el evangelio a toda criatura.",
};

/* ===============================================================
   14 · PREGUNTAS FRECUENTES — accordion
   =============================================================== */

export type Faq = { pregunta: string; respuesta: string };

export const FAQ: Faq[] = [
  {
    pregunta: "¿Cómo solicito cobertura para una actividad?",
    respuesta:
      "Escríbenos con al menos una semana de anticipación indicando la fecha, el lugar y el tipo de cobertura que necesitas (fotografía, video o streaming). Coordinaremos el equipo disponible.",
  },
  {
    pregunta: "¿Cómo envío anuncios para publicar?",
    respuesta:
      "Envía el texto del anuncio y las imágenes (si las tienes) al correo del departamento. Lo revisamos, lo diseñamos y lo publicamos en las redes y el sitio.",
  },
  {
    pregunta: "¿Cómo puedo servir en el departamento?",
    respuesta:
      "No necesitas ser experto: si tienes disposición para aprender diseño, fotografía, video, programación o manejo de redes, acércate y con gusto te integramos al equipo.",
  },
  {
    pregunta: "¿Cómo solicito una transmisión en vivo?",
    respuesta:
      "Los cultos regulares ya se transmiten. Para un evento especial, avísanos con anticipación para preparar los equipos, la conexión y el enlace de transmisión.",
  },
  {
    pregunta: "¿Cuánto tiempo demora un diseño?",
    respuesta:
      "Un diseño sencillo suele estar listo en 1 a 2 días; piezas más elaboradas pueden tomar más. Entre más anticipación nos des, mejor podremos servirte.",
  },
];
