import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MinistryPage from "@/app/components/ministry/MinistryPage";
import { GRUPOS, getGrupo } from "@/app/data/iglesia";

type Params = { grupo: string };

export const revalidate = 60;

// Plantilla de respaldo para grupos SIN página dedicada. Hoy todos los grupos
// tienen su propia página premium, así que este conjunto los excluye a todos;
// la ruta queda como respaldo por si en el futuro se agrega un grupo nuevo.
const CON_PAGINA_PROPIA = new Set([
  "cuerpo-ministerial",
  "evangelizacion",
  "comunicacion-digital",
  "coro-juventud",
  "escuela-musica",
  "escuela-dominical",
  "ministerio-femenino",
]);

export function generateStaticParams(): Params[] {
  return GRUPOS.filter((g) => !CON_PAGINA_PROPIA.has(g.slug)).map((g) => ({
    grupo: g.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { grupo } = await params;
  const data = getGrupo(grupo);
  if (!data) return { title: "Grupo no encontrado" };
  return {
    title: data.titulo,
    description: data.descripcion,
  };
}

export default async function GrupoPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { grupo } = await params;
  const data = getGrupo(grupo);
  if (!data) notFound();

  // Toda la estructura del ministerio vive en la plantilla única.
  return <MinistryPage data={data} />;
}
