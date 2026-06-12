"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/src/utils/supabase-server";
import { encodeTestimonio, encodeEventoDescripcion } from "@/app/data/contenido";

export type FormState = { ok: boolean; message: string } | null;

/** Tablas que el panel puede gestionar (lista blanca de seguridad). */
const TABLAS_PERMITIDAS = ["noticias", "eventos"] as const;
type Tabla = (typeof TABLAS_PERMITIDAS)[number];

/** Verifica que exista una sesión válida antes de mutar datos. */
async function requireSession() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("no-session");
  return supabase;
}

function texto(fd: FormData, key: string) {
  return String(fd.get(key) ?? "").trim();
}

/* ============================================================
   AVISOS CLASIFICADOS
   ============================================================ */
export async function createAviso(
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  try {
    const supabase = await requireSession();

    const titulo = texto(fd, "titulo");
    const oficio = texto(fd, "oficio");
    const descripcion = texto(fd, "descripcion");
    const autor = texto(fd, "autor");

    if (!titulo || !oficio || !descripcion || !autor) {
      return { ok: false, message: "Completa todos los campos del aviso." };
    }

    // Tabla 'noticias': el oficio viaja en imagen_url, la descripción en contenido.
    const { error } = await supabase.from("noticias").insert({
      titulo,
      autor,
      tipo: "aviso",
      imagen_url: oficio,
      contenido: descripcion,
    });
    if (error) throw error;

    revalidatePath("/comunidad");
    revalidatePath("/dashboard");
    return { ok: true, message: "Aviso publicado correctamente." };
  } catch (err) {
    return { ok: false, message: errorMsg(err) };
  }
}

/* ============================================================
   TESTIMONIOS
   ============================================================ */
export async function createTestimonio(
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  try {
    const supabase = await requireSession();

    const titulo = texto(fd, "titulo");
    const descripcion = texto(fd, "descripcion");
    const youtubeId = texto(fd, "youtube_id");

    // "Nombre de los bendecidos" admite varios separados por coma o salto de línea.
    const bendecidos = texto(fd, "bendecidos")
      .split(/[\n,]+/)
      .map((b) => b.trim())
      .filter(Boolean);

    if (!titulo || !descripcion || !youtubeId) {
      return {
        ok: false,
        message: "Título, descripción e ID de YouTube son obligatorios.",
      };
    }

    // Tabla 'noticias': el ID de YouTube viaja en imagen_url y los bendecidos
    // se concatenan dentro de contenido junto a la descripción.
    const { error } = await supabase.from("noticias").insert({
      titulo,
      tipo: "testimonio",
      imagen_url: youtubeId,
      contenido: encodeTestimonio(descripcion, bendecidos),
    });
    if (error) throw error;

    revalidatePath("/testimonios");
    revalidatePath("/dashboard");
    return { ok: true, message: "Testimonio publicado correctamente." };
  } catch (err) {
    return { ok: false, message: errorMsg(err) };
  }
}

/* ============================================================
   EVENTOS
   ============================================================ */
export async function createEvento(
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  try {
    const supabase = await requireSession();

    const titulo = texto(fd, "titulo");
    const fecha = texto(fd, "fecha");
    const hora = texto(fd, "hora");
    const descripcion = texto(fd, "descripcion");
    const lugar = texto(fd, "lugar");
    const afiche = texto(fd, "imagen_url");

    if (!titulo || !fecha || !descripcion) {
      return {
        ok: false,
        message: "Título, fecha y descripción son obligatorios.",
      };
    }

    // Tabla 'eventos': columnas reales. El afiche se embebe en la descripción
    // porque la tabla no tiene columna de imagen.
    const { error } = await supabase.from("eventos").insert({
      nombre: titulo,
      fecha_evento: fecha,
      hora_inicio: hora || null,
      lugar: lugar || null,
      descripcion: encodeEventoDescripcion(descripcion, afiche),
    });
    if (error) throw error;

    revalidatePath("/eventos");
    revalidatePath("/dashboard");
    return { ok: true, message: "Evento publicado correctamente." };
  } catch (err) {
    return { ok: false, message: errorMsg(err) };
  }
}

/* ============================================================
   ELIMINAR (genérico, con lista blanca)
   ============================================================ */
export async function eliminarRegistro(fd: FormData): Promise<void> {
  const supabase = await requireSession();
  const tabla = String(fd.get("tabla") ?? "") as Tabla;
  const id = String(fd.get("id") ?? "");

  if (!TABLAS_PERMITIDAS.includes(tabla) || !id) return;

  await supabase.from(tabla).delete().eq("id", id);

  revalidatePath("/dashboard");
  if (tabla === "eventos") {
    revalidatePath("/eventos");
  } else {
    // 'noticias' alimenta tanto avisos (/comunidad) como testimonios (/testimonios).
    revalidatePath("/comunidad");
    revalidatePath("/testimonios");
  }
}

/* ============================================================
   PETICIONES DE ORACIÓN — marcar como atendida / pendiente
   ============================================================ */
export async function actualizarPeticion(fd: FormData): Promise<void> {
  const supabase = await requireSession();
  const id = String(fd.get("id") ?? "");
  const leido = String(fd.get("leido") ?? "") === "true";
  if (!id) return;

  await supabase.from("peticiones_oracion").update({ leido }).eq("id", id);
  revalidatePath("/dashboard");
}

/* ============================================================
   CERRAR SESIÓN
   ============================================================ */
export async function cerrarSesion(): Promise<void> {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/login");
}

function errorMsg(err: unknown) {
  if (err instanceof Error && err.message === "no-session") {
    return "Tu sesión expiró. Vuelve a iniciar sesión.";
  }
  return err instanceof Error
    ? err.message
    : "Ocurrió un error. Inténtalo nuevamente.";
}
