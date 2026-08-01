/**
 * Contenido institucional del Centro Cristiano Mieles.
 * Centralizado aquí para editar textos, personas y datos sin tocar la UI.
 *
 * Paleta institucional: Azul (dominante) · Celeste/Sky (acentos) · Blanco.
 */

import type { IconName } from "@/app/components/icons";

/* ===============================================================
   CLOUDINARY — helpers de imágenes
   Se declara ARRIBA del todo porque arrays como GRUPOS lo usan al
   inicializar el módulo; si estuviera más abajo daría un error TDZ
   ("Cannot access ... before initialization").
   =============================================================== */

const CLOUDINARY_CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

/**
 * Construye la URL optimizada de una imagen de Cloudinary.
 *
 * IMPORTANTE — esta cuenta usa "carpetas dinámicas": la carpeta
 * (Mieles/grupos/...) es solo la ubicación en la Media Library, pero el
 * Public ID de ENTREGA es únicamente el nombre del archivo, SIN carpeta
 * y SIN extensión. Cloudinary entrega el mejor formato gracias a f_auto.
 *
 *   ✅ correcto:   cloudinaryUrl("Obispo-Juan-Acosta-2")
 *   ❌ incorrecto: cloudinaryUrl("Mieles/grupos/cuerpo_ministerial/Obispo-Juan-Acosta-2.jpg")  → 404
 *
 * Para obtener el Public ID: en la Media Library, abre la imagen y copia
 * el campo "Public ID" (lo que va después de la carpeta).
 *
 * El parámetro `carpeta` queda disponible por si en el futuro subes assets
 * en "modo carpeta fija" (donde el Public ID sí incluye la ruta). Por
 * defecto va vacío, porque esta cuenta entrega los IDs planos.
 *
 * @param publicId ej: "Obispo-Juan-Acosta-2"
 * @param carpeta  opcional, ej: "Mieles/logo" (déjalo vacío para esta cuenta)
 */
export function cloudinaryUrl(publicId: string, carpeta = ""): string {
  if (!CLOUDINARY_CLOUD) return "";
  const ruta = carpeta ? `${carpeta}/${publicId}` : publicId;
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/upload/f_auto,q_auto/${ruta}`;
}

export const IGLESIA = {
  nombre: "Centro Cristiano Mieles",
  nombreCorto: "Mieles",
  ministerio: "Ministerio Evangélico de Liberación del Espíritu Santo",
  dominio: "ccmieles.cl",
  url: "https://ccmieles.cl",
  correo: "contacto@ccmieles.cl",
  fundacion: "30 de agosto de 2007",
  anioFundacion: "2007",
  personaJuridica:
    "Ministerio Evangélico de Liberación del Espíritu Santo. Persona Jurídica N° 01488 del 30 de agosto de 2007",
  aniversario: "29 de agosto",
  desarrollador: "Hermano Dilan Ferreira",
  // Encargada del ministerio de Oración y Petición (intercesión).
  // imageUrl: pega la URL de su foto en Cloudinary (déjalo "" para usar iniciales).
  encargadaOracion: {
    nombre: "Hermana Madelein Vargas",
    foto: cloudinaryUrl("Hermana-Madelein-Vargas-2"),
  },
  // Dirección física del templo (edítala con la calle y comuna reales).
  direccion: "Ven y visítanos en nuestro Templo",
  mapsUrl: "https://maps.app.goo.gl/fWqRQmspHwUjXZ3A9",
  redes: {
    facebook: "https://www.facebook.com/centrocristianomieles?locale=es_LA",
    tiktok: "https://www.tiktok.com/@ccmieles",
    youtube: "https://youtube.com/@CCMieles",
    instagram: "https://www.instagram.com/centrocristianomieles",
  },
} as const;

/* ===============================================================
   NAVEGACIÓN
   =============================================================== */

export type NavLink = { label: string; href: string };

/** Enlaces principales del navbar (visibles en escritorio). */
export const NAV_SIMPLE: NavLink[] = [
  { label: "Inicio", href: "/" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Eventos", href: "/eventos" },
  { label: "Testimonios", href: "/testimonios" },
];

/** Enlaces secundarios, agrupados en el menú "Más" del navbar. */
export const NAV_MAS: NavLink[] = [
  { label: "Comunidad", href: "/comunidad" },
  { label: "Entrevistas", href: "/entrevistas" },
];

/**
 * Menú desplegable "Grupos y Ministerios".
 * Incluye los grupos (páginas /grupos/[slug]) y los departamentos afines
 * que tienen su propia página (Visita a Hogares, Oración y Petición).
 */
export const NAV_GRUPOS: NavLink[] = [
  { label: "Cuerpo Ministerial", href: "/grupos/cuerpo-ministerial" },
  { label: "Grupo Dorcas", href: "/grupos/ministerio-femenino" },
  { label: "Coro y Juventud", href: "/grupos/coro-juventud" },
  { label: "Escuela de Música", href: "/grupos/escuela-musica" },
  { label: "Evangelización", href: "/grupos/evangelizacion" },
  { label: "Visita a Hogares", href: "/departamento-visitas" },
  { label: "Oración y Petición", href: "/oracion-peticion" },
  { label: "Escuela Dominical Infantil", href: "/grupos/escuela-dominical" },
  { label: "Comunicación Digital", href: "/grupos/comunicacion-digital" },
];

/* ===============================================================
   NOSOTROS — Doctrina y horarios
   =============================================================== */

export const DECLARACION_FE: string[] = [
  "Creemos en un solo Dios, eterno, revelado en Padre, Hijo y Espíritu Santo.",
  "Creemos en Jesucristo, su muerte, resurrección y su segunda venida.",
  "Creemos que la salvación es por gracia, mediante la fe en Cristo Jesús.",
  "Creemos en la obra del Espíritu Santo que transforma, libera y consuela.",
  "Creemos en la Santa Biblia como Palabra inspirada y guía para nuestra vida.",
];

export const OBJETIVOS: string[] = [
  "Predicar el evangelio de Jesucristo a toda criatura.",
  "Edificar a la familia de la fe a través de la enseñanza de la Palabra.",
  "Servir a la comunidad en el amor del Señor (Edificación, Exhortación y Consolación). ",
  "Formar nuevas generaciones en el conocimiento de Dios.",
];

export const LO_QUE_HACEMOS: string[] = [
  "Llevamos el mensaje de salvación y libertad a las calles mediante la predicación en la vía pública.",
  "Visitamos los hogares de los hermanos y de la comunidad para llevar oración, compañía y apoyo espiritual.",
  "Formamos a niños y jóvenes en el servicio a Dios a través de nuestra Escuela de Música y Ensayos de Coro.",
  "Realizamos cultos de adoración, enseñanza de la Palabra y oración familiar durante la semana.",
  "Desarrollamos la obra de evangelización para alcanzar a los necesitados con el amor de Jesucristo.",
];

export type Horario = { dia: string; actividad: string; hora: string };

export const HORARIOS: Horario[] = [
  { dia: "Miércoles", actividad: "Culto General", hora: "19:00 hrs" },
  { dia: "Viernes", actividad: "Culto de Enseñanza Bíblica", hora: "19:00 hrs" },
  { dia: "Sábado", actividad: "Predicación en la vía pública", hora: "16:00 hrs" },
  { dia: "Sábado", actividad: "Culto Femenino (Dorcas)", hora: "16:00 hrs" },
  { dia: "Sábado", actividad: "Escuela de Música", hora: "18:00 – 19:30 hrs" },
  { dia: "Sábado", actividad: "Ensayo de Coro", hora: "20:00 – 21:30 hrs" },
  { dia: "Domingo", actividad: "Predicación en la vía pública", hora: "10:30 – 11:15 hrs" },
  { dia: "Domingo", actividad: "Culto Familiar y Adoración", hora: "11:30 – 14:00 hrs" },
];

/* ===============================================================
   GRUPOS Y MINISTERIOS — detalle por slug
   =============================================================== */

export type Persona = { nombre: string; cargo: string; foto?: string };

/** Un pilar / tarjeta con icono.
 *  `resaltar`: por cada palabra a destacar, su índice y cuántas letras
 *  iniciales van en azul (por defecto 1). Se usa para el acróstico MIELES
 *  en "¿Qué significa nuestro nombre?". */
export type Pilar = {
  icon: IconName;
  titulo: string;
  texto: string;
  resaltar?: { palabra: number; letras?: number }[];
};

/** Versículo destacado del ministerio (Reina-Valera 1960). */
export type Versiculo = { cita: string; texto: string };

export type Grupo = {
  slug: string;
  titulo: string;
  tituloCorto: string;
  icon: IconName;
  lema: string;
  descripcion: string;
  enDropdown: boolean;
  personas: Persona[];
  // Opcional: "¿Qué hace este ministerio?" (3 pilares con icono).
  pilares?: Pilar[];
  // Opcional: versículo destacado.
  versiculo?: Versiculo;
  // Opcionales (Escuela de Música): horario de clases y avances de los alumnos.
  horarioTexto?: string;
  avances?: { titulo: string; nota: string }[];
  // Opcional: galería de fotos (ej. "Avances de las Clases" en Escuela Dominical).
  galeria?: { titulo: string; fotos: FotoGaleria[] };
};

export const GRUPOS: Grupo[] = [
  {
    slug: "cuerpo-ministerial",
    titulo: "Cuerpo Ministerial",
    tituloCorto: "Cuerpo Ministerial",
    icon: "church",
    lema: "El liderazgo que pastorea la visión de la iglesia.",
    descripcion:
      "El cuerpo ministerial dirige espiritual y administrativamente la obra, velando por la sana doctrina y el cuidado del rebaño del Señor.",
    enDropdown: true,
    // EJEMPLO de la nueva plantilla. Replica este patrón (pilares + versiculo)
    // en los demás grupos para enriquecer su página. Son opcionales: si no
    // están, la plantilla simplemente omite esos bloques.
    pilares: [
      {
        icon: "spark",
        titulo: "Dirección espiritual",
        texto:
          "Pastorean la visión de la iglesia y velan por la sana doctrina conforme a la Palabra.",
      },
      {
        icon: "heart",
        titulo: "Cuidado del rebaño",
        texto:
          "Acompañan, exhortan y consuelan a la familia de la fe con amor y cercanía.",
      },
      {
        icon: "check",
        titulo: "Administración de la obra",
        texto:
          "Conducen con orden y transparencia los asuntos de la congregación al servicio del Señor.",
      },
    ],
    versiculo: {
      cita: "1 Pedro 5:2",
      texto:
        "Apacentad la grey de Dios que está entre vosotros, cuidando de ella, no por fuerza, sino voluntariamente; no por ganancia deshonesta, sino con ánimo pronto.",
    },
    personas: [
      // ✅ Foto verificada (200). En esta cuenta el Public ID es PLANO
      //    (sin carpeta ni extensión), aunque en el panel esté en
      //    Mieles/grupos/cuerpo_ministerial/. cloudinaryUrl añade f_auto,q_auto.
      {
        nombre: "Obispo Juan Acosta G.",
        cargo: "Presidente",
        foto: cloudinaryUrl("Obispo-Juan-Acosta-2"),
      },
      // ⏳ Espacios listos para los demás líderes de la carpeta.
      //    Copia el "Public ID" plano desde la Media Library (lo que va
      //    DESPUÉS de la carpeta, sin .jpg) y pégalo en cloudinaryUrl("...").
      //    Mientras esté "" se muestran las iniciales como respaldo.
      {
        nombre: "Pastora Paola Acosta M.",
        cargo: "Secretaria",
        foto: cloudinaryUrl("Pastora-Paola-Acosta-2"), // ej: cloudinaryUrl("Pastora-Paola-Acosta-M")
      },
      {
        nombre: "Diaconisa Daisy Acosta",
        cargo: "Tesorera",
        foto: cloudinaryUrl("Diac-Daisy-Acosta-2"), 
      },
      {
        nombre: "Pastor Luis Torres",
        cargo: "Primer Director (Ayudante)",
        foto: cloudinaryUrl("Pastor-Luis-Torres-2"), 
      },
      {
        nombre: "Diaconisa Marta Meza",
        cargo: "Segunda Directora",
        foto: cloudinaryUrl("Diac-Marta-Meza-2"), 
      },
    ],
  },
  {
    slug: "ministerio-femenino",
    titulo: "Grupo Dorcas",
    tituloCorto: "Grupo Dorcas",
    icon: "heart",
    lema: "Mujeres al servicio de Dios y de la comunidad.",
    descripcion:
      "Inspiradas en el ejemplo de Dorcas, las hermanas sirven con amor a la iglesia y a los más necesitados a través de obras de misericordia.",
    enDropdown: true,
    personas: [
      { 
        nombre: "Pastora Gloria Mori C.",
        cargo: "Presidenta",
        foto: cloudinaryUrl("Pastora-Gloria-Mori-2")
       },
      { 
        nombre: "Hermana Verónica Jerez",
        cargo: "Secretaría",
        foto: cloudinaryUrl("Hermana-Veronica-Jerez-2")
      },
      { 
        nombre: "Hermana Nancy Fernández",
        cargo: "Tesorera",
        foto: cloudinaryUrl("Hermana-Nancy-Fernandez-2")
      },
    ],
  },
  {
    slug: "coro-juventud",
    titulo: "Grupo Coro y Juventud",
    tituloCorto: "Coro y Juventud",
    icon: "music",
    lema: "Alabanza, adoración y nuevas generaciones.",
    descripcion:
      "El ministerio de coro y juventud guía la adoración congregacional y forma a los jóvenes en el servicio y el amor por la música consagrada.",
    enDropdown: true,
    personas: [
      { 
        nombre: "Diacono Gabriel Acosta M.",
        cargo: "Ministro de Alabanza",
        foto: cloudinaryUrl("Diac-Gabriel-Acosta-2")
      },
      { 
        nombre: "Hermana Gloria Carrillo", 
        cargo: "Secretaria", 
        foto: cloudinaryUrl("Hermana-Gloria-Carrillo-2") 
      },
      { 
        nombre: "Hermana Lissette Torres", 
        cargo: "Tesorera", 
        foto: cloudinaryUrl("Hermana-Lissette-Torres-2") 
      },
      { 
        nombre: "Hermano Miguel Wirth", 
        cargo: "Encargado de Música", 
        foto: cloudinaryUrl("Hermano-Miguel-Wirth-2")
      },
    ],
  },
  {
    slug: "escuela-musica",
    titulo: "Escuela de Música",
    tituloCorto: "Escuela de Música",
    icon: "music",
    lema: "Formación musical para servir con excelencia.",
    descripcion:
      "La escuela de música prepara a niños y jóvenes en el dominio de los instrumentos para servir en la casa de Dios. Clases los sábados de 18:00 a 19:30 hrs.",
    enDropdown: true,
    personas: [
      { 
        nombre: "Hermano Jordan Zamorano",
        cargo: "Profesor",
        foto: cloudinaryUrl("Hermano-Jordan-Zamorano-2")
      },
    ],
    horarioTexto: "Sábados de 18:00 a 19:30 hrs",
    avances: [
      {
        titulo: "Primeros acordes",
        nota: "Nuestros alumnos dando sus primeros pasos en la guitarra y el teclado.",
      },
      {
        titulo: "Práctica grupal",
        nota: "Integración con el coro para los servicios dominicales.",
      },
      {
        titulo: "Recital interno",
        nota: "Presentaciones que muestran el progreso de cada estudiante.",
      },
    ],
  },
  {
    slug: "evangelizacion",
    titulo: "Evangelización",
    tituloCorto: "Evangelización",
    icon: "megaphone",
    lema: "Llevando el evangelio a cada hogar.",
    descripcion:
      "El ministerio de evangelización lleva el mensaje de salvación a las calles y los hogares, alcanzando a los perdidos con el amor de Cristo.",
    enDropdown: true,
    personas: [
      { 
        nombre: "Hermano Evangelista Luis Huenupil",
        cargo: "Encargado",
        foto: cloudinaryUrl("Hermano-Luis-Huenupil-2")
       },
      { 
        nombre: "Hermana Valeria Jiménez",
         cargo: "Encargada",
         foto: cloudinaryUrl("Hermana-Valeria-Jimenez-2")
        },
    ],
  },
  {
    slug: "comunicacion-digital",
    titulo: "Departamento de Comunicación Digital",
    tituloCorto: "Comunicación Digital",
    icon: "device",
    lema: "La presencia de la iglesia en el mundo digital.",
    descripcion:
      "Administra la plataforma web, las redes sociales y la difusión digital del ministerio, llevando la Palabra más allá de las paredes del templo.",
    enDropdown: false,
    personas: [
      { 
        nombre: "Pastor Luis Torres",
        cargo: "Director",
        foto: cloudinaryUrl("Pastor-Luis-Torres-2")
        },
      { 
        nombre: "Pastora Paola Acosta",
        cargo: "Directora",
        foto: cloudinaryUrl("Pastora-Paola-Acosta-2")
      },
      { 
        nombre: "Hermano Dilan Ferreira",
        cargo: "Desarrollador",
        foto: cloudinaryUrl("Hermano-Dilan-Ferreira-2")
      },
      { 
        nombre: "Hermano Bryan Cerda",
        cargo: "Ayudante",
        foto: cloudinaryUrl("Hermano-Bryan-Cerda-2")
      },
      { 
        nombre: "Diacono Gabriel Acosta",
        cargo: "Redes Sociales",
        foto: cloudinaryUrl("Diac-Gabriel-Acosta-2")
      },
    ],
  },
  {
    slug: "escuela-dominical",
    titulo: "Escuela Dominical Infantil",
    tituloCorto: "Escuela Dominical",
    icon: "spark",
    lema: "Sembrando la Palabra de Dios en el corazón de los niños.",
    descripcion:
      "La Escuela Dominical Infantil enseña a los más pequeños el amor de Jesús a través de historias bíblicas, cantos y actividades, formando una nueva generación que ama y sirve a Dios.",
    enDropdown: true,
    personas: [
      // foto: pega la URL de Cloudinary (déjalo vacío para usar iniciales).
      { nombre: "Hermana Gloria Garrillo", cargo: "Encargada", foto: cloudinaryUrl("Hermana-Gloria-Carrillo-2") },
    ],
    galeria: {
      titulo: "Avances de las Clases",
      fotos: [
        { publicId: "escuela-dominical-1", alt: "Clase bíblica con los niños", span: "big" },
        { publicId: "escuela-dominical-2", alt: "Manualidades y actividades", span: "normal" },
        { publicId: "escuela-dominical-3", alt: "Cantos y alabanza infantil", span: "tall" },
        { publicId: "escuela-dominical-4", alt: "Historias de la Biblia", span: "wide" },
        { publicId: "escuela-dominical-5", alt: "Juegos y aprendizaje", span: "normal" },
        { publicId: "escuela-dominical-6", alt: "Momento de oración", span: "normal" },
      ],
    },
  },
];

// Mostramos todos los grupos en el menú (incluye Comunicación Digital).
export const GRUPOS_DROPDOWN = GRUPOS;

export function getGrupo(slug: string): Grupo | undefined {
  return GRUPOS.find((g) => g.slug === slug);
}

/* ===============================================================
   EVENTOS
   =============================================================== */

export type Evento = {
  id: string;
  nombre: string;
  descripcion: string;
  fecha: string; // ISO
  hora: string;
  lugar: string;
  destacado?: boolean;
};

export const EVENTOS: Evento[] = [
  {
    id: "aniversario",
    nombre: "Aniversario Mieles",
    descripcion:
      "Celebramos un año más de la fidelidad de Dios sobre nuestra congregación. Una jornada especial de alabanza, predicación y comunión para toda la familia.",
    fecha: "2025-08-29",
    hora: "19:00 hrs",
    lugar: "Templo Centro Cristiano Mieles",
    destacado: true,
  },
  {
    id: "ev-1",
    nombre: "Campaña de Evangelización",
    descripcion:
      "Salida evangelística para compartir el mensaje de salvación en nuestro sector. ¡Únete y sé parte de la cosecha!",
    fecha: "2025-09-13",
    hora: "16:00 hrs",
    lugar: "Plaza del sector",
  },
  {
    id: "ev-2",
    nombre: "Vigilia de Oración",
    descripcion:
      "Una noche entera buscando el rostro de Dios en oración, intercesión y adoración.",
    fecha: "2025-09-26",
    hora: "22:00 hrs",
    lugar: "Templo Centro Cristiano Mieles",
  },
  {
    id: "ev-3",
    nombre: "Encuentro de Jóvenes",
    descripcion:
      "Una tarde dedicada a la juventud con alabanza, palabra y actividades para crecer en la fe.",
    fecha: "2025-10-11",
    hora: "17:00 hrs",
    lugar: "Templo Centro Cristiano Mieles",
  },
];

/* ===============================================================
   COMUNIDAD — Avisos clasificados y Testimonios
   =============================================================== */

export type Aviso = {
  id: string;
  titulo: string;
  oficio: string;
  descripcion: string;
  autor: string;
  contacto?: string;
};

export const AVISOS: Aviso[] = [
  {
    id: "a-1",
    titulo: "Servicios de Gasfitería",
    oficio: "Gasfitería",
    descripcion:
      "Reparaciones e instalaciones de gasfitería a domicilio. Trabajo responsable, garantizado y a buen precio.",
    autor: "Hno. de la congregación",
    contacto: "Coordinar por la iglesia",
  },
  {
    id: "a-2",
    titulo: "Trabajos de Electricidad",
    oficio: "Electricidad",
    descripcion:
      "Instalaciones eléctricas, tableros y mantenciones para el hogar. Atención puntual y segura.",
    autor: "Hno. de la congregación",
    contacto: "Coordinar por la iglesia",
  },
  {
    id: "a-3",
    titulo: "Costuras y Arreglos de Ropa",
    oficio: "Costura",
    descripcion:
      "Confección, ajustes y arreglos de prendas. Trabajo prolijo hecho con dedicación.",
    autor: "Hna. de la congregación",
    contacto: "Coordinar por la iglesia",
  },
  {
    id: "a-4",
    titulo: "Clases Particulares",
    oficio: "Educación",
    descripcion:
      "Reforzamiento escolar y clases particulares para niños y jóvenes en distintas materias.",
    autor: "Hna. de la congregación",
    contacto: "Coordinar por la iglesia",
  },
];

export type Testimonio = {
  id: string;
  titulo: string;
  youtubeId: string; // reemplazar por el ID real del video de YouTube
  descripcion: string;
  bendecidos: string[];
};

export const TESTIMONIOS: Testimonio[] = [
  {
    id: "t-1",
    titulo: "Cicatrices de un milagro",
    youtubeId: "ysz5S6PUM-U",
    descripcion:
      "Donde los médicos vieron el final, Dios escribió un nuevo comienzo. Este es el relato de una sanidad imposible para los hombres, pero posible para el Señor. Las cicatrices quedaron como testimonio vivo de Su poder y fidelidad.",
    bendecidos: ["Familia Pérez", "Hna. María González"],
  },
  {
    id: "t-2",
    titulo: "Restaurados por Su amor",
    youtubeId: "ysz5S6PUM-U",
    descripcion:
      "Un hogar al borde de la ruptura encontró en Cristo la reconciliación y la paz. Hoy son una familia que sirve unida al Señor, dando gloria a Dios por la restauración.",
    bendecidos: ["Familia Rojas"],
  },
];

/* ===============================================================
   ENTREVISTAS — videos de YouTube (página /entrevistas)
   Reemplaza youtubeId por el ID real del video de cada entrevista.
   =============================================================== */

export type Entrevista = {
  id: string;
  titulo: string;
  entrevistado: string;
  cargo?: string;
  descripcion: string;
  youtubeId: string;
};

export const ENTREVISTAS: Entrevista[] = [
  {
    id: "ent-1",
    titulo: "El llamado a fundar la obra",
    entrevistado: "Obispo Juan Acosta G.",
    cargo: "Presidente",
    descripcion:
      "Conversamos sobre los inicios del Centro Cristiano Mieles, la visión que Dios puso en su corazón y los desafíos de levantar una iglesia desde cero.",
    youtubeId: "ysz5S6PUM-U",
  },
  {
    id: "ent-2",
    titulo: "Una vida al servicio del Señor",
    entrevistado: "Pastora Paola Acosta M.",
    cargo: "Secretaria",
    descripcion:
      "Una charla cercana sobre el ministerio femenino, la familia de la fe y el corazón pastoral que sostiene a la congregación.",
    youtubeId: "ysz5S6PUM-U",
  },
  {
    id: "ent-3",
    titulo: "Jóvenes que adoran con propósito",
    entrevistado: "Gabriel Acosta M.",
    cargo: "Ministro de Alabanza",
    descripcion:
      "Hablamos sobre la adoración, la formación de las nuevas generaciones y el rol de la música en la vida de la iglesia.",
    youtubeId: "ysz5S6PUM-U",
  },
];

/* ===============================================================
   CORO — Reglamento y cancionero
   =============================================================== */

export const REGLAMENTO_CORO: string[] = [
  "Asistir puntualmente a los ensayos y reuniones programadas.",
  "Mantener una vida de oración y testimonio acorde a la Palabra.",
  "Cuidar y respetar los instrumentos y el equipamiento de la iglesia.",
  "Vestir de forma sobria y consagrada durante los servicios.",
  "Avisar con anticipación en caso de inasistencia justificada.",
  "Cultivar la unidad, el amor y el compañerismo entre los integrantes.",
];

export type Alabanza = {
  titulo: string;
  autor: string;
  tono?: string;
  driveUrl?: string; // enlace al archivo en Google Drive
};

export const CANCIONERO: Alabanza[] = [
  { titulo: "Mora en mi vida", autor: "Gladis Muñoz", tono: "G" },
  { titulo: "Yo he creído", autor: "Tradicional", tono: "D" },
  { titulo: "Coros por sol mayor", autor: "Tradicional", tono: "G" },
  { titulo: "En la inmensidad", autor: "Tradicional", tono: "G" },
  { titulo: "Sol de la mañana", autor: "Tradicional", tono: "G" },
  { titulo: "Oh Dios mio", autor: "Tradicional", tono: "G" },
];

/* ===============================================================
   PETICIONES DE ORACIÓN
   =============================================================== */

export const MOTIVOS_ORACION = ["Liberación", "Sanidad", "Consolación"] as const;
export type MotivoOracion = (typeof MOTIVOS_ORACION)[number];

/* ===============================================================
   HERO — Carrusel (reemplazar imágenes por URLs de Cloudinary)
   =============================================================== */

export type Slide = {
  // Etiqueta corta de contexto (ej. "Bienvenida").
  etiqueta: string;
  // Titular corto y memorable (es el H1 visible del slide).
  titular: string;
  subtitulo: string;
  // Llamada a la acción propia de cada slide.
  cta: { label: string; href: string };
  gradiente: string;
  // Public ID de Cloudinary (solo el nombre, sin carpeta ni extensión).
  // Si se deja vacío, el slide muestra únicamente el degradado.
  publicId?: string;
};

// NOTA: cada slide cuenta una historia distinta con su propia llamada a la
// acción. Reemplaza los publicId por tus fotos reales cuando las subas.
export const SLIDES: Slide[] = [
  {
    etiqueta: "Bienvenida",
    titular: "Hay un lugar para ti",
    subtitulo:
      "Te esperamos con los brazos abiertos para encontrarte con Dios, restaurar tu vida y ser parte de la familia de la fe.",
    cta: { label: "Planifica tu visita", href: "/#cultos" },
    gradiente: "from-blue-950 via-blue-800 to-transparent",
    publicId: "congregacion",
  },
  {
    etiqueta: "Nuestra Iglesia",
    titular: "Una familia que adora a Cristo",
    subtitulo:
      "Somos una iglesia evangélica en Quilicura donde el amor de Cristo libera, restaura y transforma vidas.",
    cta: { label: "Conócenos", href: "/nosotros" },
    gradiente: "from-blue-950 via-blue-900 to-transparent",
    publicId: "Pastores",
  },
  {
    etiqueta: "Ministerios",
    titular: "Sirve y crece con nosotros",
    subtitulo:
      "Coro, música, jóvenes, evangelización y más: hay un lugar para que uses tus dones para Dios.",
    cta: { label: "Ver ministerios", href: "/grupos/cuerpo-ministerial" },
    gradiente: "from-sky-700 via-blue-800 to-blue-950",
    publicId: "Grupos_y_Ministerios",
  },
  {
    etiqueta: "Eventos",
    titular: "Vive lo que Dios está haciendo",
    subtitulo:
      "Campañas, administrativos y actividades para toda la familia. Acompáñanos en lo que viene.",
    cta: { label: "Ver eventos", href: "/eventos" },
    gradiente: "from-blue-900 via-blue-700 to-sky-600",
    publicId: "Eventos",
  },
  {
    etiqueta: "Oración",
    titular: "Oramos por ti",
    subtitulo:
      "Comparte tu necesidad. Nuestro Cuerpo Ministerial clamará a Dios por ti de forma 100% confidencial.",
    cta: { label: "Enviar petición", href: "/oracion-peticion" },
    gradiente: "from-blue-950 via-blue-800 to-transparent",
    publicId: "coro",
  },
];

/* ===============================================================
   ACCESOS RÁPIDOS (Home)
   =============================================================== */

export type Acceso = {
  titulo: string;
  descripcion: string;
  href: string;
  emoji: string;
};

export const ACCESOS: Acceso[] = [
  {
    titulo: "Nosotros",
    descripcion: "Nuestro génesis, declaración de fe y horarios de culto.",
    href: "/nosotros",
    emoji: "📖",
  },
  {
    titulo: "Eventos",
    descripcion: "Aniversario, campañas y actividades de la iglesia.",
    href: "/eventos",
    emoji: "📅",
  },
  {
    titulo: "Comunidad",
    descripcion: "Avisos clasificados y testimonios de fe en video.",
    href: "/comunidad",
    emoji: "🤝",
  },
  {
    titulo: "Grupos y Ministerios",
    descripcion: "Conoce a los líderes y equipos de cada departamento.",
    href: "/grupos/cuerpo-ministerial",
    emoji: "👥",
  },
];

/* ===============================================================
   CLOUDINARY — URLs derivadas (el helper cloudinaryUrl se define
   al inicio del archivo, antes de GRUPOS, para evitar el TDZ).
   =============================================================== */

/** Logo oficial (Public ID plano de entrega). */
export const LOGO_URL = cloudinaryUrl("logoof_yzayoq");

/**
 * Imagen de vista previa al compartir el enlace (Open Graph / WhatsApp).
 * Compone el logo sobre un fondo AZUL plano de 1200×630 (sin transparencia),
 * para que WhatsApp/Facebook no inyecten su recuadro blanco.
 */
export const OG_IMAGE = CLOUDINARY_CLOUD
  ? `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/upload/c_pad,w_1200,h_630,b_rgb:1e3a8a,f_jpg/logoof_yzayoq`
  : "";


/* ===============================================================
   GALERÍA MOSAICO — sección Nosotros
   Pega el Public ID de entrega (solo el nombre, sin carpeta ni .jpg),
   siguiendo el ejemplo del primero ("2_c8lbyh").
   span: tamaño dentro del mosaico → "normal" | "wide" | "tall" | "big"
   =============================================================== */

export type FotoGaleria = {
  publicId: string; // Public ID de entrega de Cloudinary, sin carpeta ni extensión
  alt: string;
  span: "normal" | "wide" | "tall" | "big";
};

export const GALERIA_NOSOTROS: FotoGaleria[] = [
  { publicId: "bautismos-1", alt: "Celebración de bautismos en el Centro Cristiano Mieles", span: "big" },
  { publicId: "bautismos-2", alt: "Bautismo en agua de un nuevo hermano", span: "normal" },
  { publicId: "bautismos-3", alt: "Hermanos sellando su fe en las aguas", span: "tall" },
  { publicId: "bautismos-4", alt: "Momento de bautismos en la congregación", span: "wide" },
  { publicId: "bautismos-5", alt: "Nueva criatura en Cristo tras el bautismo", span: "normal" },
  { publicId: "bautismos-6", alt: "Gozo de la familia de fe en los bautismos", span: "normal" },
  { publicId: "bautismos-7", alt: "Celebración de bautismos del ministerio", span: "tall" },
];

/* ===============================================================
   GALERÍA — Departamento de Visita a Hogares (carpeta Mieles/visita_hogares)
   Pega el Public ID de entrega de cada foto (solo el nombre, sin carpeta
   ni extensión), igual que en la galería de Nosotros.
   =============================================================== */

export const GALERIA_VISITAS: FotoGaleria[] = [
  { publicId: "visita-1", alt: "Oración en el hogar de un hermano", span: "big" },
  { publicId: "visita-2", alt: "Visita a un hermano enfermo", span: "normal" },
  { publicId: "visita-3", alt: "Compartiendo la Palabra en familia", span: "tall" },
  { publicId: "visita-4", alt: "Apoyo y compañía a la comunidad", span: "wide" },
  { publicId: "visita-5", alt: "Momento de comunión", span: "normal" },
  { publicId: "visita-6", alt: "Llevando esperanza a cada hogar", span: "normal" },
];

/* ===============================================================
   LÍNEA DE TIEMPO — hitos históricos (carrusel en /nosotros)

   Cada año (hito) puede tener VARIAS imágenes en "imagenes" (array de
   Public IDs de entrega: solo el nombre, sin carpeta ni extensión).
   El carrusel avanza solo, mostrando una a una; cuando termina las de
   un año pasa al siguiente y resalta ese año en la línea de tiempo.

   Para agregar fotos a un año, pega sus Public IDs en su array, ej:
     imagenes: ["2_c8lbyh", "otro_id", "otro_id_2"]
   Si un año queda con [] se muestra un degradado de respaldo.
   =============================================================== */

export type Hito = {
  anio: string;
  titulo: string;
  descripcion: string;
  imagenes: string[]; // Public IDs (sin carpeta ni extensión). Varias por año.
  gradiente: string; // respaldo estético si el año aún no tiene fotos
};

export const HITOS: Hito[] = [
  {
    anio: "2007",
    titulo: "Inicio de la Obra",
    descripcion:
      "El 30 de agosto nace el Centro Cristiano Mieles, una obra levantada por Dios para la liberación y restauración de las familias.",
    imagenes: ["2_c8lbyh", "1_jtxxdw", "3_wf9xuc", "4_rqen7e", "5_phewsr", "6_kc63v9", "7_pqrscg", "8_sa1wel", "9_l0hkzl", "10_hd2utt", "11_psmx3x", "12_ktrbeg"], // ✅ fotos reales de 2007 (agrega más IDs aquí)
    gradiente: "from-blue-800 via-blue-700 to-sky-500",
  },
  {
    anio: "2015",
    titulo: "Crecimiento y Consolidación",
    descripcion:
      "La congregación se fortalece: nuevas familias se suman y los ministerios comienzan a tomar forma para servir mejor a la comunidad.",
    imagenes: ["1_2015", "2_2015", "8_2015", "10_2015", "11_2015", "12_2015", "13_2015", "1_2016", "2_2016", "3_2016", "4_20216", "5_2016", "6_2016",], // ← pega aquí los Public IDs de las fotos de 2015
    gradiente: "from-blue-900 via-blue-700 to-blue-500",
  },
  {
    anio: "2022",
    titulo: "Nuevos Ministerios",
    descripcion:
      "Florecen la Escuela de Música, el Coro y el Departamento de Comunicación Digital, llevando la Palabra más allá del templo.",
    imagenes: ["F_2022_1", "F_2022_2", "F_2022_3", "F_2022_4", "F_2022_5"], // ← pega aquí los Public IDs de las fotos de 2022
    gradiente: "from-sky-600 via-blue-700 to-blue-900",
  },
  {
    anio: "Hoy",
    titulo: "Una Familia que Sigue Creciendo",
    descripcion:
      "Seguimos firmes en el propósito de predicar el evangelio, formar nuevas generaciones y servir con el amor de Cristo.",
    imagenes: [], // ← pega aquí los Public IDs de las fotos actuales
    gradiente: "from-blue-700 via-sky-600 to-cyan-500",
  },
];

/* ===============================================================
   NOSOTROS — narrativa, línea de tiempo, identidad y liderazgo
   Contenido reescrito a partir del acta histórica del ministerio,
   respetando los hechos reales (ver fechas en CRONOLOGÍA).
   =============================================================== */

/** Capítulos de la historia (estilo documental, bloques cortos). */
export const HISTORIA: { titulo: string; parrafo: string }[] = [
  {
    titulo: "Un llamado desde la niñez",
    parrafo:
      "En la ciudad de Lota, siendo apenas un niño, Juan Acosta García recibió por profecía el llamado de Dios a servirle. Aquel anuncio, confirmado una y otra vez a lo largo de los años, marcaría el rumbo de toda su vida.",
  },
  {
    titulo: "Siete años de servicio fiel",
    parrafo:
      "Durante siete años sirvió en la Iglesia Ejército Evangélico de Jesucristo, bajo el Obispo Luis Verdugo Ferrada, llegando a ser subdirector del estado mayor. Allí Dios lo formó en disciplina, entrega y amor por las almas.",
  },
  {
    titulo: "La salida con bendición",
    parrafo:
      "El 1 de abril de 2007, junto a su esposa Gloria Morí, comunicó la decisión que Dios ya había confirmado. Su Obispo, con tristeza pero en obediencia al Señor, los despidió con su bendición. Aquel día, terminada la exhortación, hubo un derramamiento del Espíritu Santo sobre casi todos los presentes: gozo y certeza de que la mano de Dios iba delante.",
  },
  {
    titulo: "Nace un ministerio ordenado por Dios",
    parrafo:
      "El 17 de agosto de 2007, en Santiago, quedó constituido el Ministerio Evangélico de Liberación El Espíritu Santo. La Palabra entregada en Josué 1:1-9 selló su comienzo. Inscrito el 30 de agosto y publicado en el Diario Oficial el 18 de enero de 2008, el ministerio nació con un fundamento inquebrantable.",
  },
];

/** Reflexión de cierre de la sección Historia. */
export const HISTORIA_REFLEXION =
  "Año tras año, hermanos llegan y otros parten; los directivos cambian. Pero el ministerio sigue firme en pie, porque la obra no es del hombre, sino de Dios.";

/** Línea de tiempo (hitos del origen del ministerio). */
export const LINEA_TIEMPO: { fecha: string; titulo: string; texto: string }[] = [
  {
    fecha: "Niñez · Lota",
    titulo: "El llamado",
    texto:
      "Dios anuncia por profecía, sobre la vida de Juan Acosta García, un llamado al servicio cristiano.",
  },
  {
    fecha: "7 años",
    titulo: "Servicio fiel",
    texto:
      "Sirve en la Iglesia Ejército Evangélico de Jesucristo hasta llegar a subdirector del estado mayor.",
  },
  {
    fecha: "1 abr 2007",
    titulo: "Salida con bendición y primer culto",
    texto:
      "Recibe la bendición de su Obispo para seguir el llamado; un derramamiento del Espíritu Santo confirma el nuevo ministerio.",
  },
  {
    fecha: "17 ago 2007",
    titulo: "Constitución",
    texto:
      "Queda fundado el Ministerio Evangélico de Liberación El Espíritu Santo, en Santiago de Chile.",
  },
  {
    fecha: "30 ago 2007",
    titulo: "Inscripción legal",
    texto: "El ministerio obtiene su Persona Jurídica N° 01488.",
  },
  {
    fecha: "18 ene 2008",
    titulo: "Publicación oficial",
    texto: "Publicado en el Diario Oficial de la República de Chile.",
  },
  {
    fecha: "Crecimiento",
    titulo: "Una obra que florece",
    texto:
      "Nuevas familias y ministerios se suman año tras año: Dorcas, Coro, Música, Evangelización y más.",
  },
  {
    fecha: "Hoy",
    titulo: "Una familia viva",
    texto:
      "El ministerio sigue firme, predicando el evangelio y sirviendo con el amor de Cristo.",
  },
];

/** Significado del nombre del ministerio (4 tarjetas). */
export const SIGNIFICADO_NOMBRE: Pilar[] = [
  {
    icon: "heart",
    titulo: "Ministerio",
    texto:
      "Servicio. Una vida entregada a la labor de Dios y al cuidado de su pueblo.",
    resaltar: [{ palabra: 0, letras: 2 }], // "Mi" → M, I
  },
  {
    icon: "megaphone",
    titulo: "Evangélico",
    texto:
      "Buenas noticias. El anuncio de la salvación en Cristo Jesús para todos.",
    resaltar: [{ palabra: 0 }], // E
  },
  {
    icon: "spark",
    titulo: "De Liberación",
    texto:
      "Libertad en el Señor. Cristo rompe toda cadena por el poder dado a cada creyente.",
    resaltar: [{ palabra: 1 }], // L (Liberación)
  },
  {
    icon: "flame",
    titulo: "Del Espíritu Santo",
    texto: "Un ministerio dirigido y guiado por el Espíritu de Dios.",
    resaltar: [{ palabra: 1 }, { palabra: 2 }], // E (Espíritu) y S (Santo)
  },
];

/** Identidad del ministerio (Misión, Visión, Valores, Propósito, Compromiso). */
export const IDENTIDAD: Pilar[] = [
  {
    icon: "megaphone",
    titulo: "Misión",
    texto:
      "Predicar el evangelio de Jesucristo a toda criatura y edificar a la familia de la fe en la Palabra.",
  },
  {
    icon: "spark",
    titulo: "Visión",
    texto:
      "Ser una iglesia viva que libera, restaura y forma nuevas generaciones para el servicio de Dios.",
  },
  {
    icon: "heart",
    titulo: "Valores",
    texto:
      "Amor, servicio, sana doctrina, unidad y compromiso con Dios y con la comunidad.",
  },
  {
    icon: "praying",
    titulo: "Propósito",
    texto:
      "Cultivar la presencia de Dios y llevar esperanza a cada hogar y a cada corazón.",
  },
  {
    icon: "check",
    titulo: "Compromiso",
    texto:
      "Servir con orden, transparencia e integridad, porque la obra es de Dios.",
  },
];

/** Liderazgo del ministerio (sección Liderazgo de Nosotros). */
export type Lider = {
  nombre: string;
  cargo: string;
  foto: string;
  bio: string;
  cita: string;
  citaRef?: string;
};

export const LIDERES: Lider[] = [
  {
    nombre: "Pastor Obispo Juan Acosta García",
    cargo: "Fundador y Presidente",
    foto: cloudinaryUrl("Obispo-Juan-Acosta-2"),
    bio: "Desde su niñez en Lota, Dios lo apartó para el servicio. Tras siete años de formación ministerial, en 2007 fundó el Ministerio Evangélico de Liberación El Espíritu Santo. Su vida es testimonio de obediencia, fe y amor por las almas.",
    cita: "Porque la obra no es del hombre, sino de Dios.",
  },
  {
    nombre: "Pastora Gloria Morí Cavieres",
    cargo: "Co-fundadora y Vicepresidenta",
    foto: cloudinaryUrl("Pastora-Gloria-Mori-2"),
    bio: "Junto a su esposo acompañó el llamado desde el primer día y co-fundó el ministerio. Hoy pastorea la obra y lidera el Grupo Dorcas, sirviendo a las mujeres y a la comunidad con amor y entrega.",
    // ✏️ EJEMPLO — reemplaza por el versículo o frase que represente a la
    //    Pastora Gloria (y agrega "citaRef" si es una cita bíblica).
    cita: "Escribe aquí un versículo o frase que represente a la Pastora.",
  },
];

/* ===============================================================
   INICIO — "¿Qué creemos?" (resumen de fe para el Home)
   =============================================================== */

export const CREENCIAS: Pilar[] = [
  {
    icon: "check",
    titulo: "La Biblia",
    texto:
      "Es la Palabra inspirada de Dios, nuestra guía y autoridad para la vida y la fe.",
  },
  {
    icon: "heart",
    titulo: "Jesucristo",
    texto:
      "Su muerte y resurrección son nuestra salvación. Es por gracia, mediante la fe en Él.",
  },
  {
    icon: "flame",
    titulo: "El Espíritu Santo",
    texto:
      "Nos transforma, libera y consuela, guiando cada día a la familia de la fe.",
  },
];
