/**
 * Motor de comunicaciones por WhatsApp vía enlaces `wa.me` (gratuito, sin la
 * API de pago de Meta). Lógica pura y testeable: saneo de teléfonos, armado del
 * enlace y renderizado de plantillas con variables. No depende de React ni de
 * Supabase.
 */

/** Código de país por defecto (Chile) cuando el número no lo trae. */
export const CC_DEFAULT = "56";

/** Nombre del ministerio para la variable {ministerio} de las plantillas. */
export const MINISTERIO = "Centro Cristiano Mieles";

export type PlantillaWa = { id: string; nombre: string; texto: string };

/** Catálogo base de plantillas (variables: {nombre}, {fecha}, {ministerio}). */
export const PLANTILLAS_WA: PlantillaWa[] = [
  {
    id: "bienvenida",
    nombre: "Bienvenida",
    texto:
      "¡Hola {nombre}! 🙌 Fue una bendición tenerte con nosotros en {ministerio}. " +
      "Queremos darte la bienvenida a la familia. ¿Te gustaría que conversemos y oremos por ti esta semana?",
  },
  {
    id: "seguimiento",
    nombre: "Seguimiento",
    texto:
      "Hola {nombre}, ¿cómo estás? 😊 Te saludamos con cariño desde {ministerio}. " +
      "Queremos saber cómo va tu semana y recordarte que estamos orando por ti. ¡Esperamos verte pronto!",
  },
  {
    id: "invitacion_celula",
    nombre: "Invitación a célula",
    texto:
      "Hola {nombre} 🙏 Te queremos invitar a nuestra reunión de célula esta semana: " +
      "un espacio cercano para compartir, orar y crecer juntos. ¿Te gustaría acompañarnos? — {ministerio}",
  },
  {
    id: "invitacion_culto",
    nombre: "Invitación al culto",
    texto:
      "Hola {nombre} ✨ Te esperamos este fin de semana en {ministerio}. " +
      "Será un tiempo especial de adoración y palabra. ¡Nos encantará verte!",
  },
  {
    id: "cumpleanos",
    nombre: "Cumpleaños",
    texto:
      "¡Feliz cumpleaños {nombre}! 🎉🎂 Que el Señor te llene de vida, salud y bendición " +
      "en este nuevo año. Te abrazamos con cariño desde {ministerio}.",
  },
];

/**
 * Sanea un teléfono a formato internacional solo-dígitos apto para `wa.me`.
 * - Respeta el código de país si viene con `+` o si ya empieza por `ccDefault`.
 * - Si no, antepone `ccDefault` (Chile por defecto), quitando un 0 troncal.
 * Devuelve `null` si el resultado no parece un número válido.
 */
export function normalizarTelefono(
  raw: string | null | undefined,
  ccDefault: string = CC_DEFAULT,
): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  const hasPlus = trimmed.startsWith("+");
  let n = trimmed.replace(/\D/g, "");
  if (!n) return null;

  if (hasPlus) {
    // Ya viene en formato internacional (código de país incluido).
  } else if (n.startsWith(ccDefault) && n.length >= ccDefault.length + 9) {
    // Ya trae el código de país (p. ej. 56 9 XXXX XXXX).
  } else {
    n = n.replace(/^0+/, ""); // quita 0 troncal
    if (!n) return null;
    n = ccDefault + n;
  }

  // Sanidad: un E.164 razonable tiene entre 10 y 15 dígitos.
  if (n.length < 10 || n.length > 15) return null;
  return n;
}

/**
 * Construye el enlace `https://wa.me/<num>?text=<mensaje>` con el mensaje
 * codificado. Devuelve `null` si el teléfono no es válido.
 */
export function construirWaLink(
  telefono: string | null,
  mensaje: string,
): string | null {
  if (!telefono) return null;
  const base = `https://wa.me/${telefono}`;
  const texto = (mensaje ?? "").trim();
  return texto ? `${base}?text=${encodeURIComponent(texto)}` : base;
}

/**
 * Renderiza una plantilla reemplazando `{clave}` por su valor. Las variables
 * sin valor se dejan tal cual (para no perder el marcador por error).
 */
export function renderPlantilla(
  texto: string,
  vars: Record<string, string | null | undefined>,
): string {
  return texto.replace(/\{(\w+)\}/g, (m, clave: string) => {
    const v = vars[clave];
    return v === undefined || v === null || v === "" ? m : v;
  });
}
