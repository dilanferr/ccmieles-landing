/**
 * Contenido institucional del Centro Cristiano Mieles.
 * Centralizado aquí para editar textos, personas y datos sin tocar la UI.
 *
 * Paleta institucional: Azul (dominante) · Celeste/Sky (acentos) · Blanco.
 */

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
    "Ministerio Evangélico de Liberación del Espíritu Santo. Personalidad Jurídica N° 01488 del 30 de agosto de 2007.",
  aniversario: "29 de agosto",
  desarrollador: "Hermano Dilan Ferreira",
  // Encargada del ministerio de Oración y Petición (intercesión).
  encargadaOracion: "Hermana Madelein Vargas",
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
  { label: "Visita a Hogares", href: "/departamento-visitas" },
  { label: "Oración y Petición", href: "/oracion-peticion" },
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
  "Sostenemos cultos de adoración, enseñanza de la Palabra y oración familiar durante la semana.",
  "Desarrollamos la obra de evangelización para alcanzar a los necesitados con el amor de Jesucristo.",
];

export type Horario = { dia: string; actividad: string; hora: string };

export const HORARIOS: Horario[] = [
  { dia: "Miércoles", actividad: "Culto Familiar", hora: "20:00 hrs" },
  { dia: "Viernes", actividad: "Culto de Enseñanza", hora: "20:00 hrs" },
  { dia: "Sábado", actividad: "Predicación en la vía pública", hora: "16:00 hrs" },
  { dia: "Sábado", actividad: "Culto Femenino (Dorcas)", hora: "16:00 hrs" },
  { dia: "Sábado", actividad: "Escuela de Música", hora: "18:00 – 19:30 hrs" },
  { dia: "Sábado", actividad: "Ensayo de Coro", hora: "20:00 – 21:30 hrs" },
  { dia: "Domingo", actividad: "Predicación en la vía pública", hora: "10:30 – 11:15 hrs" },
  { dia: "Domingo", actividad: "Culto de Adoración", hora: "11:30 – 14:00 hrs" },
];

/* ===============================================================
   GRUPOS Y MINISTERIOS — detalle por slug
   =============================================================== */

export type Persona = { nombre: string; cargo: string; foto?: string };

export type Grupo = {
  slug: string;
  titulo: string;
  tituloCorto: string;
  emoji: string;
  lema: string;
  descripcion: string;
  enDropdown: boolean;
  personas: Persona[];
  // Opcionales (Escuela de Música): horario de clases y avances de los alumnos.
  horarioTexto?: string;
  avances?: { titulo: string; nota: string }[];
};

export const GRUPOS: Grupo[] = [
  {
    slug: "cuerpo-ministerial",
    titulo: "Cuerpo Ministerial",
    tituloCorto: "Cuerpo Ministerial",
    emoji: "🏛️",
    lema: "El liderazgo que pastorea la visión de la iglesia.",
    descripcion:
      "El cuerpo ministerial dirige espiritual y administrativamente la obra, velando por la sana doctrina y el cuidado del rebaño del Señor.",
    enDropdown: true,
    personas: [
      { nombre: "Obispo Juan Acosta G.", cargo: "Presidente" },
      { nombre: "Pastora Paola Acosta M.", cargo: "Secretaria" },
      { nombre: "Diaconisa Daisy Acosta", cargo: "Tesorera" },
      { nombre: "Pastor Luis Torres", cargo: "Primer Director (Ayudante)" },
      { nombre: "Diaconisa Marta Meza", cargo: "Segunda Directora" },
    ],
  },
  {
    slug: "ministerio-femenino",
    titulo: "Grupo Dorcas",
    tituloCorto: "Grupo Dorcas",
    emoji: "👗",
    lema: "Mujeres al servicio de Dios y de la comunidad.",
    descripcion:
      "Inspiradas en el ejemplo de Dorcas, las hermanas sirven con amor a la iglesia y a los más necesitados a través de obras de misericordia.",
    enDropdown: true,
    personas: [
      { nombre: "Pastora Gloria Mori C.", cargo: "Presidenta" },
      { nombre: "Hermana Verónica Jerez", cargo: "Secretaría" },
      { nombre: "Hermana Nancy Fernández", cargo: "Tesorera" },
    ],
  },
  {
    slug: "coro-juventud",
    titulo: "Grupo Coro y Juventud",
    tituloCorto: "Coro y Juventud",
    emoji: "🎶",
    lema: "Alabanza, adoración y nuevas generaciones.",
    descripcion:
      "El ministerio de coro y juventud guía la adoración congregacional y forma a los jóvenes en el servicio y el amor por la música consagrada.",
    enDropdown: true,
    personas: [
      { nombre: "Diacono Gabriel Acosta M.", cargo: "Ministro de Alabanza" },
      { nombre: "Hermana Gloria Carrillo", cargo: "Secretaria" },
      { nombre: "Hermana Lissette Torres", cargo: "Tesorera" },
      { nombre: "Hermano Miguel Wirth", cargo: "Encargado de Música" },
    ],
  },
  {
    slug: "escuela-musica",
    titulo: "Escuela de Música",
    tituloCorto: "Escuela de Música",
    emoji: "🎹",
    lema: "Formación musical para servir con excelencia.",
    descripcion:
      "La escuela de música prepara a niños y jóvenes en el dominio de los instrumentos para servir en la casa de Dios. Clases los sábados de 18:00 a 19:30 hrs.",
    enDropdown: true,
    personas: [
      { nombre: "Hermano Jordan Zamorano", cargo: "Profesor" },
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
    emoji: "📢",
    lema: "Llevando el evangelio a cada hogar.",
    descripcion:
      "El ministerio de evangelización lleva el mensaje de salvación a las calles y los hogares, alcanzando a los perdidos con el amor de Cristo.",
    enDropdown: true,
    personas: [
      { nombre: "Hermano Evangelista Luis Huenupil", cargo: "Encargado" },
      { nombre: "Hermana Valeria Jiménez", cargo: "Encargada" },
    ],
  },
  {
    slug: "comunicacion-digital",
    titulo: "Departamento de Comunicación Digital",
    tituloCorto: "Comunicación Digital",
    emoji: "💻",
    lema: "La presencia de la iglesia en el mundo digital.",
    descripcion:
      "Administra la plataforma web, las redes sociales y la difusión digital del ministerio, llevando la Palabra más allá de las paredes del templo.",
    enDropdown: false,
    personas: [
      { nombre: "Pastor Luis Torres", cargo: "Director" },
      { nombre: "Pastora Paola Acosta", cargo: "Directora" },
      { nombre: "Hermano Dilan Ferreira", cargo: "Desarrollador" },
      { nombre: "Hermano Bryan Cerda", cargo: "Ayudante" },
      { nombre: "Diacono Gabriel Acosta", cargo: "Redes Sociales" },
    ],
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
  { titulo: "Renuévame", autor: "Marcos Witt", tono: "G" },
  { titulo: "Sublime Gracia", autor: "Tradicional", tono: "D" },
  { titulo: "Cuán Grande es Él", autor: "Tradicional", tono: "C" },
  { titulo: "Al que está sentado en el trono", autor: "Coalo Zamorano", tono: "A" },
  { titulo: "Tu Fidelidad", autor: "Marcos Witt", tono: "E" },
  { titulo: "Digno es el Cordero", autor: "Congregacional", tono: "G" },
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
  titulo: string;
  subtitulo: string;
  gradiente: string;
  // Public ID de Cloudinary (solo el nombre, sin carpeta ni extensión).
  // Si se deja vacío, el slide muestra únicamente el degradado.
  publicId?: string;
};

// NOTA: estas imágenes son temporales (fotos ya subidas a Cloudinary).
// Cuando subas las definitivas a "Mieles/inicio", reemplaza cada publicId
// por su Public ID de entrega, igual que en la galería de Nosotros.
export const SLIDES: Slide[] = [
  {
    titulo: "Un lugar de restauración, fe y comunión familiar",
    subtitulo: "Un espacio para encontrarse con Dios, restaurar tu vida y compartir en la comunión de la fe.",
    gradiente: "from-blue-950 via-blue-800 to-transparent",
    publicId: "iglesia",
  },
  {
    titulo: "Donde el Espíritu Santo trae libertad",
    subtitulo: "Creemos en el poder transformador del Espíritu Santo que trae verdadera libertad, paz y sanidad.",
    gradiente: "from-blue-950 via-blue-900 to-transparent",
    publicId: "coro",
  },
  {
    titulo: "Una familia que adora a Cristo",
    subtitulo: "Aquí hay un lugar preparado para ti. Te invitamos a caminar juntos y crecer en el amor de Cristo.",
    gradiente: "from-blue-950 via-blue-800 to-transparent",
    publicId: "iglesia1",
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
   CLOUDINARY — helpers de imágenes
   =============================================================== */

const CLOUDINARY_CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

/**
 * Construye la URL optimizada de una imagen de Cloudinary.
 *
 * IMPORTANTE — esta cuenta usa "carpetas dinámicas": la carpeta
 * (Mieles/nosotros) es solo la ubicación en la Media Library, pero el
 * Public ID de ENTREGA es únicamente el nombre del archivo, SIN carpeta
 * y SIN extensión. Cloudinary entrega el mejor formato gracias a f_auto.
 *
 *   ✅ correcto:   cloudinaryUrl("2_c8lbyh")
 *   ❌ incorrecto: cloudinaryUrl("Mieles/nosotros/2_c8lbyh.jpg")  → 404
 *
 * Para obtener el Public ID: en la Media Library, abre la imagen y copia
 * el campo "Public ID" (lo que va después de la carpeta).
 *
 * El parámetro `carpeta` queda disponible por si en el futuro subes assets
 * en "modo carpeta fija" (donde el Public ID sí incluye la ruta). Por
 * defecto va vacío, porque esta cuenta entrega los IDs planos.
 *
 * @param publicId ej: "2_c8lbyh"
 * @param carpeta  opcional, ej: "Mieles/logo" (déjalo vacío para esta cuenta)
 */
export function cloudinaryUrl(publicId: string, carpeta = ""): string {
  if (!CLOUDINARY_CLOUD) return "";
  const ruta = carpeta ? `${carpeta}/${publicId}` : publicId;
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/upload/f_auto,q_auto/${ruta}`;
}

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
  { publicId: "2_c8lbyh", alt: "Congregación reunida en adoración", span: "big" },
  { publicId: "4_rqen7e", alt: "Momento de alabanza", span: "normal" },
  { publicId: "1_jtxxdw", alt: "Comunión entre hermanos", span: "tall" },
  { publicId: "3_wf9xuc", alt: "Predicación de la Palabra", span: "wide" },
  { publicId: "5_phewsr", alt: "Bautismos en agua", span: "normal" },
  { publicId: "6_kc63v9", alt: "Ministerio de niños", span: "normal" },
  { publicId: "7_pqrscg", alt: "Jóvenes sirviendo", span: "tall" },
  { publicId: "8_sa1wel", alt: "Celebración de aniversario", span: "wide" },
  { publicId: "9_l0hkzl", alt: "Oración por los enfermos", span: "normal" },
  { publicId: "10_hd2utt", alt: "Vida en comunidad", span: "normal" },
  { publicId: "11_psmx3x", alt: "Vida en comunidad", span: "normal" },
  { publicId: "12_ktrbeg", alt: "Vida en comunidad", span: "normal" },
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
    imagenes: [], // ← pega aquí los Public IDs de las fotos de 2015
    gradiente: "from-blue-900 via-blue-700 to-blue-500",
  },
  {
    anio: "2022",
    titulo: "Nuevos Ministerios",
    descripcion:
      "Florecen la Escuela de Música, el Coro y el Departamento de Comunicación Digital, llevando la Palabra más allá del templo.",
    imagenes: [], // ← pega aquí los Public IDs de las fotos de 2022
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
