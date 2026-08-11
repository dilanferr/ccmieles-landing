"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, Alerta, EstadoVacio, ModuleHeader } from "./ui";
import { HeartIcon } from "@/app/components/icons";
import { getDb } from "./db";
import {
  calcularOcasion,
  enRango,
  etiquetaProximo,
  type Rango,
  type Ocasion,
} from "./cuidado-pastoral";
import {
  PLANTILLAS_WA,
  MINISTERIO,
  normalizarTelefono,
  construirWaLink,
  renderPlantilla,
} from "./wa";

type MiembroCuidado = {
  id: string;
  nombre_completo: string;
  telefono: string | null;
  fecha_nacimiento: string | null;
  fecha_bautismo: string | null;
};

type Tipo = "cumple" | "bautismo";

const COLS = "id, nombre_completo, telefono, fecha_nacimiento, fecha_bautismo";

const RANGOS: { id: Rango; label: string }[] = [
  { id: "hoy", label: "Hoy" },
  { id: "semana", label: "Esta semana" },
  { id: "mes", label: "Este mes" },
];

const primerNombre = (n: string) => n.trim().split(/\s+/)[0] || n;

export default function CuidadoModule() {
  const [items, setItems] = useState<MiembroCuidado[]>([]);
  const [loading, setLoading] = useState(true);
  const [ahoraMs, setAhoraMs] = useState(0);
  const [tipo, setTipo] = useState<Tipo>("cumple");
  const [rango, setRango] = useState<Rango>("semana");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    let vivo = true;
    (async () => {
      const { data } = await getDb()
        .from("miembros_iglesia")
        .select(COLS)
        .is("eliminado_at", null)
        .order("nombre_completo", { ascending: true });
      if (!vivo) return;
      setItems((data as MiembroCuidado[] | null) ?? []);
      setAhoraMs(Date.now());
      setLoading(false);
    })();
    return () => {
      vivo = false;
    };
  }, []);

  const fechaDe = (m: MiembroCuidado) =>
    tipo === "cumple" ? m.fecha_nacimiento : m.fecha_bautismo;

  // Personas con ocasión válida para el tipo activo (con su cálculo).
  const conOcasion = useMemo(() => {
    if (!ahoraMs) return [] as { m: MiembroCuidado; oc: Ocasion }[];
    const out: { m: MiembroCuidado; oc: Ocasion }[] = [];
    for (const m of items) {
      const oc = calcularOcasion(fechaDe(m), ahoraMs);
      if (oc) out.push({ m, oc });
    }
    return out.sort((a, b) => a.oc.dias - b.oc.dias);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, tipo, ahoraMs]);

  const lista = useMemo(
    () => conOcasion.filter((x) => enRango(x.oc, rango)),
    [conOcasion, rango],
  );

  const conteos = useMemo(() => {
    const c = { hoy: 0, semana: 0, mes: 0 };
    for (const x of conOcasion) {
      if (enRango(x.oc, "hoy")) c.hoy++;
      if (enRango(x.oc, "semana")) c.semana++;
      if (enRango(x.oc, "mes")) c.mes++;
    }
    return c;
  }, [conOcasion]);

  function felicitar(m: MiembroCuidado) {
    const tel = normalizarTelefono(m.telefono);
    const tplId = tipo === "cumple" ? "cumpleanos" : "aniversario_bautismo";
    const tpl = PLANTILLAS_WA.find((p) => p.id === tplId) ?? PLANTILLAS_WA[0];
    const mensaje = renderPlantilla(tpl.texto, {
      nombre: primerNombre(m.nombre_completo),
      ministerio: MINISTERIO,
    });
    const link = construirWaLink(tel, mensaje);
    if (!link) {
      setMsg({ ok: false, text: `${m.nombre_completo} no tiene un teléfono válido.` });
      return;
    }
    window.open(link, "_blank", "noopener,noreferrer");
  }

  const esCumple = tipo === "cumple";
  const sufijo = esCumple ? "años" : "años de bautizado/a";

  return (
    <div>
      <ModuleHeader
        icon={<HeartIcon className="h-6 w-6" />}
        titulo="Cuidado Pastoral"
        descripcion="Cumpleaños y aniversarios de bautismo de la congregación, para no dejar pasar ninguno."
        accion={
          <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
            {(
              [
                ["cumple", "🎂 Cumpleaños"],
                ["bautismo", "🕊️ Bautismos"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTipo(id)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  tipo === id
                    ? "bg-blue-700 text-white"
                    : "text-slate-500 hover:text-blue-700 dark:text-slate-400"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        }
      />

      {msg && (
        <div className="mb-5">
          <Alerta ok={msg.ok}>{msg.text}</Alerta>
        </div>
      )}

      {/* Filtros de rango con contador */}
      <div className="mb-5 flex flex-wrap gap-2">
        {RANGOS.map((r) => {
          const n = conteos[r.id];
          const activo = rango === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setRango(r.id)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                activo
                  ? "border-blue-600 bg-blue-700 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {r.label}
              <span
                className={`rounded-full px-1.5 text-xs ${
                  activo
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300"
                }`}
              >
                {n}
              </span>
            </button>
          );
        })}
      </div>

      <Card className="p-0 sm:p-0">
        {loading ? (
          <div className="p-6">
            <EstadoVacio loading>Cargando cuidado pastoral…</EstadoVacio>
          </div>
        ) : lista.length === 0 ? (
          <div className="p-6">
            <EstadoVacio>
              {esCumple
                ? "No hay cumpleaños en este rango."
                : "No hay aniversarios de bautismo en este rango."}
              {" "}
              {tipo === "bautismo" &&
                "Recuerda registrar la fecha de bautismo en las fichas."}
            </EstadoVacio>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {lista.map(({ m, oc }) => {
              const hoy = oc.dias === 0;
              const telOk = !!normalizarTelefono(m.telefono);
              return (
                <li
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {m.nombre_completo}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {esCumple ? "🎂" : "🕊️"} Cumple {oc.anios} {sufijo}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        hoy
                          ? "bg-pink-100 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {etiquetaProximo(oc.dias)}
                    </span>
                    <button
                      type="button"
                      onClick={() => felicitar(m)}
                      disabled={!telOk}
                      title={telOk ? "Felicitar por WhatsApp" : "Sin teléfono válido"}
                      className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                      💬 Felicitar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
