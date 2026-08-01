import type { Metadata } from "next";
import EventosCliente from "./EventosCliente";
import { getEventos } from "@/src/utils/publico";
import { getSettings } from "@/src/utils/settings";

export const metadata: Metadata = {
  title: {
    absolute:
      "Próximos Cultos y Eventos Cristianos en Quilicura | CC Mieles",
  },
  description:
    "Revisa la cartelera de próximos cultos, campañas, vigilias y eventos cristianos del Centro Cristiano Mieles en Quilicura. Conoce los horarios de nuestras reuniones y acompáñanos con tu familia.",
  alternates: { canonical: "/eventos" },
};

export const revalidate = 30;

export default async function EventosPage() {
  const [eventos, s] = await Promise.all([getEventos(), getSettings()]);
  return <EventosCliente eventos={eventos} mapsUrl={s.mapsUrl} />;
}
