import type { Metadata } from "next";
import PageHeader from "@/app/components/PageHeader";
import { CalendarIcon } from "@/app/components/icons";
import { EVENTOS } from "@/app/data/iglesia";
import { decodeEventoDescripcion } from "@/app/data/contenido";
import { createPublicClient } from "@/src/utils/supabase-public";

export const metadata: Metadata = {
  title: "Eventos",
  description:
    "Aniversario Mieles, campañas de evangelización y actividades del Centro Cristiano Mieles.",
};

export const revalidate = 30;

type EventoView = {
  id: string;
  nombre: string;
  descripcion: string;
  fecha: string;
  hora: string;
  lugar: string;
  afiche: string | null;
  destacado: boolean;
};

type EventoRow = {
  id: string | number;
  nombre: string | null;
  descripcion: string | null;
  fecha_evento: string | null;
  hora_inicio: string | null;
  lugar: string | null;
};

function partesFecha(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return { dia: "--", mes: "", completa: iso };
  return {
    dia: d.toLocaleDateString("es-CL", { day: "2-digit" }),
    mes: d
      .toLocaleDateString("es-CL", { month: "short" })
      .replace(".", "")
      .toUpperCase(),
    completa: d.toLocaleDateString("es-CL", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  };
}

async function cargarEventos(): Promise<EventoView[]> {
  const fallback: EventoView[] = EVENTOS.map((e) => ({
    id: e.id,
    nombre: e.nombre,
    descripcion: e.descripcion,
    fecha: e.fecha,
    hora: e.hora,
    lugar: e.lugar,
    afiche: null,
    destacado: Boolean(e.destacado),
  }));

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("eventos")
      .select("id, nombre, descripcion, fecha_evento, hora_inicio, lugar")
      .order("fecha_evento", { ascending: true });

    if (error || !data || data.length === 0) return fallback;

    return (data as EventoRow[]).map((r) => {
      const { descripcion, afiche } = decodeEventoDescripcion(r.descripcion ?? "");
      const nombre = r.nombre ?? "Evento";
      return {
        id: String(r.id),
        nombre,
        descripcion,
        fecha: r.fecha_evento ?? "",
        hora: r.hora_inicio ?? "",
        lugar: r.lugar ?? "",
        afiche,
        destacado: /aniversario/i.test(nombre),
      };
    });
  } catch {
    return fallback;
  }
}

function EventoCard({ evento }: { evento: EventoView }) {
  const f = partesFecha(evento.fecha);
  return (
    <article className="group flex gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-600/10">
      {evento.afiche ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={evento.afiche}
          alt={evento.nombre}
          className="h-20 w-20 shrink-0 rounded-2xl object-cover ring-1 ring-slate-200"
        />
      ) : (
        <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-linear-to-br from-blue-700 to-sky-500 text-white">
          <span className="text-2xl font-bold leading-none">{f.dia}</span>
          <span className="text-xs font-semibold tracking-wide">{f.mes}</span>
        </div>
      )}
      <div className="min-w-0">
        <h3 className="text-lg font-bold text-slate-900">{evento.nombre}</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          {evento.descripcion}
        </p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <CalendarIcon className="h-4 w-4 text-sky-500" />
            {f.completa}
          </span>
          {evento.hora && <span>· {evento.hora}</span>}
          {evento.lugar && <span>· {evento.lugar}</span>}
        </div>
      </div>
    </article>
  );
}

export default async function EventosPage() {
  const eventos = await cargarEventos();
  const destacado = eventos.find((e) => e.destacado);
  const otros = eventos.filter((e) => e !== destacado);

  return (
    <>
      <PageHeader
        eyebrow="Agenda"
        titulo="Eventos y Actividades"
        descripcion="Acompáñanos en cada celebración. Hay un lugar preparado para ti y tu familia en la casa de Dios."
      />

      {/* ============ EVENTO DESTACADO ============ */}
      {destacado && (
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-blue-900 via-blue-800 to-sky-600 p-8 text-white shadow-2xl sm:p-12">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-sky-400/20 blur-3xl"
              />
              <div className="relative grid items-center gap-8 lg:grid-cols-[auto_1fr]">
                {destacado.afiche ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={destacado.afiche}
                    alt={destacado.nombre}
                    className="h-40 w-40 rounded-3xl object-cover ring-1 ring-white/20"
                  />
                ) : (
                  <div className="flex h-32 w-32 flex-col items-center justify-center rounded-3xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20">
                    <span className="text-5xl font-bold leading-none">
                      {partesFecha(destacado.fecha).dia}
                    </span>
                    <span className="mt-1 text-sm font-semibold uppercase tracking-wide text-sky-100">
                      {partesFecha(destacado.fecha).mes}
                    </span>
                  </div>
                )}
                <div>
                  <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-sky-100">
                    Evento destacado
                  </span>
                  <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                    {destacado.nombre}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sky-50/90">
                    {destacado.descripcion}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-sm font-medium text-sky-100">
                    {destacado.hora && <span>🕖 {destacado.hora}</span>}
                    {destacado.lugar && <span>📍 {destacado.lugar}</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============ PRÓXIMOS EVENTOS ============ */}
      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Próximas actividades
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Campañas de evangelización, vigilias y encuentros que se vienen.
            </p>
          </div>

          {otros.length > 0 ? (
            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              {otros.map((evento) => (
                <EventoCard key={evento.id} evento={evento} />
              ))}
            </div>
          ) : (
            <p className="mt-12 text-center text-slate-500">
              Pronto anunciaremos nuevas actividades. ¡Mantente atento!
            </p>
          )}
        </div>
      </section>
    </>
  );
}
