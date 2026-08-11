"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Card,
  Field,
  Input,
  Textarea,
  Button,
  Alerta,
  EstadoVacio,
  ModuleHeader,
} from "./ui";
import { SparkIcon, CloseIcon, TrashIcon, IdCardIcon } from "@/app/components/icons";
import { getDb } from "./db";
import type { Rol } from "./types";
import {
  crearConsolidacion,
  actualizarContacto,
  cambiarEstado,
  asignarResponsable,
  agregarNota,
  eliminarConsolidacion,
  convertirEnMiembro,
  type EstadoConsolidacion,
  type TipoNota,
} from "./consolidacion-actions";
import {
  enRiesgo,
  metricasSalud,
  type ItemMetrica,
  type MetricasSalud,
} from "./consolidacion-metricas";
import {
  PLANTILLAS_WA,
  MINISTERIO,
  normalizarTelefono,
  construirWaLink,
  renderPlantilla,
} from "./wa";

type ConsRow = {
  id: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  estado: EstadoConsolidacion;
  responsable_id: string | null;
  origen: "asistencia" | "manual" | "web";
  asistencia_id: string | null;
  miembro_id: string | null;
  bautizado: boolean;
  fecha_bautismo: string | null;
  fecha_recepcion: string | null;
  creado_at: string | null;
  actualizado_at: string | null;
};

type Servidor = { id: string; nombre: string; correo: string | null; rol: string };
type Nota = {
  id: string;
  consolidacion_id: string;
  autor_id: string | null;
  tipo: TipoNota;
  nota: string;
  creado_at: string | null;
};

const COLS =
  "id, nombre, telefono, email, direccion, estado, responsable_id, origen, asistencia_id, miembro_id, bautizado, fecha_bautismo, fecha_recepcion, creado_at, actualizado_at";
const NOTA_COLS = "id, consolidacion_id, autor_id, tipo, nota, creado_at";

type EtapaMeta = {
  estado: EstadoConsolidacion;
  label: string;
  col: string; // color de columna/acento
  badge: string;
};

const ETAPAS: EtapaMeta[] = [
  {
    estado: "recibido",
    label: "Recibido",
    col: "border-t-sky-400",
    badge: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  },
  {
    estado: "contactado",
    label: "Contactado",
    col: "border-t-indigo-400",
    badge: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
  },
  {
    estado: "en_proceso",
    label: "En Proceso / Célula",
    col: "border-t-amber-400",
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  },
  {
    estado: "integrado",
    label: "Integrado / Bautizado",
    col: "border-t-emerald-400",
    badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
];
const NO_CONTINUA: EtapaMeta = {
  estado: "no_continua",
  label: "No continúa",
  col: "border-t-slate-300",
  badge: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};
const TODAS_ETAPAS = [...ETAPAS, NO_CONTINUA];
const META = (e: EstadoConsolidacion) =>
  TODAS_ETAPAS.find((x) => x.estado === e) ?? NO_CONTINUA;

const TIPO_NOTA_META: Record<TipoNota, { label: string; cls: string }> = {
  llamada: {
    label: "Llamada",
    cls: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  },
  visita: {
    label: "Visita",
    cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  oracion: {
    label: "Oración",
    cls: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
  },
  general: {
    label: "General",
    cls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  },
};
const TIPOS_NOTA: TipoNota[] = ["general", "llamada", "visita", "oracion"];

const BAR_BG: Record<EstadoConsolidacion, string> = {
  recibido: "bg-sky-400",
  contactado: "bg-indigo-400",
  en_proceso: "bg-amber-400",
  integrado: "bg-emerald-400",
  no_continua: "bg-slate-300",
};

const SEL =
  "w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-2.5 pr-7 text-xs font-semibold text-slate-700 outline-none transition-colors focus:border-blue-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200";

function diasDesde(fecha: string | null): number | null {
  if (!fecha) return null;
  const d = new Date(`${fecha}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86_400_000));
}
function etiquetaDias(n: number | null): string {
  if (n === null) return "";
  if (n === 0) return "hoy";
  if (n === 1) return "hace 1 día";
  return `hace ${n} días`;
}
function fechaLegible(ms: number): string {
  if (!ms) return "";
  return new Date(ms).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
function fmtFechaHora(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ConsolidacionModule({ rol }: { rol: Rol }) {
  const puedeConvertir = rol === "admin" || rol === "pastor";

  const [items, setItems] = useState<ConsRow[]>([]);
  const [servidores, setServidores] = useState<Servidor[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [verDescartados, setVerDescartados] = useState(false);
  const [procesando, setProcesando] = useState<Set<string>>(new Set());

  // Drawer de detalle
  const [selId, setSelId] = useState<string | null>(null);
  const [notas, setNotas] = useState<Nota[]>([]);
  const [notasLoading, setNotasLoading] = useState(false);
  const [form, setForm] = useState({ nombre: "", telefono: "", email: "", direccion: "" });
  const [respSel, setRespSel] = useState("");
  const [notaTipo, setNotaTipo] = useState<TipoNota>("general");
  const [notaTexto, setNotaTexto] = useState("");
  const [waPlantilla, setWaPlantilla] = useState(PLANTILLAS_WA[0].id);

  // Modal de alta manual
  const [nuevoOpen, setNuevoOpen] = useState(false);
  const [nuevo, setNuevo] = useState({ nombre: "", telefono: "", email: "", direccion: "" });
  const [guardandoNuevo, setGuardandoNuevo] = useState(false);

  // Vista (tablero / métricas), filtro de atención y última nota por persona.
  const [vista, setVista] = useState<"tablero" | "metricas">("tablero");
  const [soloRiesgo, setSoloRiesgo] = useState(false);
  const [ultimaNota, setUltimaNota] = useState<Map<string, string>>(new Map());
  const [ahoraMs, setAhoraMs] = useState(0); // reloj capturado al cargar (evita impureza en render)

  const sel = useMemo(() => items.find((i) => i.id === selId) ?? null, [items, selId]);

  useEffect(() => {
    let vivo = true;
    (async () => {
      const supabase = getDb();
      const [{ data: cons }, { data: serv }, { data: notas }] = await Promise.all([
        supabase
          .from("consolidacion")
          .select(COLS)
          .is("eliminado_at", null)
          .order("fecha_recepcion", { ascending: true }),
        supabase.rpc("fn_servidores"),
        supabase
          .from("consolidacion_notas")
          .select("consolidacion_id, creado_at")
          .order("creado_at", { ascending: false }),
      ]);
      if (!vivo) return;
      setItems((cons as ConsRow[] | null) ?? []);
      setServidores((serv as Servidor[] | null) ?? []);
      // Resumen: primera fila por id = nota más reciente (viene ordenado desc).
      const m = new Map<string, string>();
      for (const n of (notas as { consolidacion_id: string; creado_at: string }[] | null) ?? []) {
        if (!m.has(n.consolidacion_id)) m.set(n.consolidacion_id, n.creado_at);
      }
      setUltimaNota(m);
      setAhoraMs(Date.now());
      setLoading(false);
    })();
    return () => {
      vivo = false;
    };
  }, []);

  const servMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of servidores) m.set(s.id, s.nombre);
    return m;
  }, [servidores]);

  // IDs "en riesgo / estancado" (recibido/contactado > 7 días sin actividad).
  const riesgoSet = useMemo(() => {
    const s = new Set<string>();
    if (!ahoraMs) return s;
    for (const i of items) {
      if (enRiesgo(i as ItemMetrica, ultimaNota.get(i.id) ?? null, ahoraMs)) s.add(i.id);
    }
    return s;
  }, [items, ultimaNota, ahoraMs]);

  const porEstado = useMemo(() => {
    const m = new Map<EstadoConsolidacion, ConsRow[]>();
    for (const e of TODAS_ETAPAS) m.set(e.estado, []);
    const fuente = soloRiesgo ? items.filter((i) => riesgoSet.has(i.id)) : items;
    for (const i of fuente) m.get(i.estado)?.push(i);
    return m;
  }, [items, soloRiesgo, riesgoSet]);

  const metricas = useMemo(() => metricasSalud(items as ItemMetrica[]), [items]);

  const kpis = useMemo(() => {
    const activos = items.filter(
      (i) => i.estado !== "integrado" && i.estado !== "no_continua",
    );
    const integrados = items.filter((i) => i.estado === "integrado").length;
    const base = items.filter((i) => i.estado !== "no_continua").length;
    const tasa = base ? Math.round((integrados / base) * 100) : 0;
    const sinAsignar = activos.filter((i) => !i.responsable_id).length;
    return {
      activos: activos.length,
      integrados,
      tasa,
      sinAsignar,
      riesgo: riesgoSet.size,
    };
  }, [items, riesgoSet]);

  const columnas = verDescartados ? TODAS_ETAPAS : ETAPAS;

  function marcar(id: string, on: boolean) {
    setProcesando((s) => {
      const n = new Set(s);
      if (on) n.add(id);
      else n.delete(id);
      return n;
    });
  }
  const upsert = (row: ConsRow) =>
    setItems((l) => l.map((x) => (x.id === row.id ? row : x)));

  async function abrir(id: string) {
    const item = items.find((i) => i.id === id);
    if (item) {
      setForm({
        nombre: item.nombre,
        telefono: item.telefono ?? "",
        email: item.email ?? "",
        direccion: item.direccion ?? "",
      });
      setRespSel(item.responsable_id ?? "");
    }
    setNotaTipo("general");
    setNotaTexto("");
    setSelId(id);
    setNotas([]);
    setNotasLoading(true);
    const { data } = await getDb()
      .from("consolidacion_notas")
      .select(NOTA_COLS)
      .eq("consolidacion_id", id)
      .order("creado_at", { ascending: false });
    setNotas((data as Nota[] | null) ?? []);
    setNotasLoading(false);
  }

  async function cambiarEtapa(item: ConsRow, nuevo: EstadoConsolidacion) {
    if (item.estado === nuevo) return;
    marcar(item.id, true);
    setMsg(null);
    const res = await cambiarEstado(item.id, nuevo);
    if (res.ok && res.data) upsert(res.data as ConsRow);
    else setMsg({ ok: false, text: res.error ?? "No se pudo cambiar la etapa." });
    marcar(item.id, false);
  }

  async function guardarContacto() {
    if (!sel) return;
    marcar(sel.id, true);
    const res = await actualizarContacto(sel.id, form);
    if (res.ok && res.data) {
      upsert(res.data as ConsRow);
      setMsg({ ok: true, text: "Contacto actualizado." });
    } else setMsg({ ok: false, text: res.error ?? "No se pudo guardar." });
    marcar(sel.id, false);
  }

  async function cambiarResp(v: string) {
    if (!sel) return;
    setRespSel(v);
    const res = await asignarResponsable(sel.id, v || null);
    if (res.ok && res.data) upsert(res.data as ConsRow);
    else setMsg({ ok: false, text: res.error ?? "No se pudo asignar el responsable." });
  }

  async function enviarNota(e: FormEvent) {
    e.preventDefault();
    if (!sel) return;
    const texto = notaTexto.trim();
    if (!texto) return;
    const res = await agregarNota(sel.id, notaTipo, texto);
    if (res.ok && res.data) {
      setNotas((n) => [res.data as Nota, ...n]);
      setNotaTexto("");
      setNotaTipo("general");
    } else setMsg({ ok: false, text: res.error ?? "No se pudo agregar la nota." });
  }

  // Mensaje de la plantilla activa, renderizado con los datos de la persona.
  const waMensaje = sel
    ? renderPlantilla(
        (PLANTILLAS_WA.find((p) => p.id === waPlantilla) ?? PLANTILLAS_WA[0]).texto,
        { nombre: sel.nombre, ministerio: MINISTERIO, fecha: fechaLegible(ahoraMs) },
      )
    : "";
  const waTelefono = sel ? normalizarTelefono(sel.telefono) : null;

  function contactarWhatsApp() {
    if (!sel) return;
    const link = construirWaLink(waTelefono, waMensaje);
    if (!link) {
      setMsg({ ok: false, text: "Esta persona no tiene un teléfono válido para WhatsApp." });
      return;
    }
    const plantilla = PLANTILLAS_WA.find((p) => p.id === waPlantilla) ?? PLANTILLAS_WA[0];
    window.open(link, "_blank", "noopener,noreferrer");
    // Registra el contacto como nota append-only en el historial.
    const idActual = sel.id;
    void agregarNota(
      idActual,
      "general",
      `📱 Contacto por WhatsApp iniciado · plantilla "${plantilla.nombre}"`,
    ).then((res) => {
      if (res.ok && res.data && selId === idActual) {
        setNotas((n) => [res.data as Nota, ...n]);
      }
    });
  }

  async function convertir() {
    if (!sel) return;
    if (
      !confirm(
        `¿Convertir a "${sel.nombre}" en miembro? Se creará su ficha en el Registro Pastoral y quedará como Integrado.`,
      )
    )
      return;
    marcar(sel.id, true);
    setMsg(null);
    const res = await convertirEnMiembro(sel.id);
    if (res.ok && res.data) {
      setItems((l) =>
        l.map((x) =>
          x.id === sel.id
            ? { ...x, estado: "integrado", miembro_id: res.data!.miembroId }
            : x,
        ),
      );
      setMsg({ ok: true, text: `${sel.nombre} ahora tiene ficha de miembro. 🎉` });
    } else setMsg({ ok: false, text: res.error ?? "No se pudo convertir." });
    marcar(sel.id, false);
  }

  async function eliminar(item: ConsRow) {
    if (!confirm(`¿Enviar "${item.nombre}" a la papelera?`)) return;
    const res = await eliminarConsolidacion(item.id);
    if (res.ok) {
      setItems((l) => l.filter((x) => x.id !== item.id));
      if (selId === item.id) setSelId(null);
      setMsg({ ok: true, text: "Enviado a la papelera." });
    } else setMsg({ ok: false, text: res.error ?? "No se pudo eliminar." });
  }

  async function crearNuevo(e: FormEvent) {
    e.preventDefault();
    const nombre = nuevo.nombre.trim();
    if (!nombre) return;
    setGuardandoNuevo(true);
    const res = await crearConsolidacion(nuevo);
    if (res.ok && res.data) {
      setItems((l) => [...l, res.data as ConsRow]);
      setNuevo({ nombre: "", telefono: "", email: "", direccion: "" });
      setNuevoOpen(false);
      setMsg({ ok: true, text: "Persona agregada al pipeline." });
    } else setMsg({ ok: false, text: res.error ?? "No se pudo crear." });
    setGuardandoNuevo(false);
  }

  return (
    <div>
      <ModuleHeader
        icon={<SparkIcon className="h-6 w-6" />}
        titulo="Consolidación de Visitantes"
        descripcion="Acompaña a cada visitante en su recorrido: de recibido a integrado a la familia."
        accion={
          <>
            <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
              {(["tablero", "metricas"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVista(v)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                    vista === v
                      ? "bg-blue-700 text-white"
                      : "text-slate-500 hover:text-blue-700 dark:text-slate-400"
                  }`}
                >
                  {v === "tablero" ? "Tablero" : "Métricas"}
                </button>
              ))}
            </div>
            <Button type="button" onClick={() => setNuevoOpen(true)}>
              + Nueva persona
            </Button>
          </>
        }
      />

      {msg && (
        <div className="mb-5">
          <Alerta ok={msg.ok}>{msg.text}</Alerta>
        </div>
      )}

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "En seguimiento", valor: kpis.activos, alerta: false },
          { label: "Requiere atención", valor: kpis.riesgo, alerta: kpis.riesgo > 0 },
          { label: "Integrados", valor: kpis.integrados, alerta: false },
          { label: "Tasa de conversión", valor: `${kpis.tasa}%`, alerta: false },
          { label: "Sin responsable", valor: kpis.sinAsignar, alerta: false },
        ].map((k) => (
          <Card key={k.label} className="p-5">
            <p
              className={`text-3xl font-bold tracking-tight ${
                k.alerta ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-white"
              }`}
            >
              {k.valor}
            </p>
            <p className="mt-0.5 text-sm font-medium text-slate-500 dark:text-slate-400">
              {k.label}
            </p>
          </Card>
        ))}
      </div>

      {loading ? (
        <div className="mt-6">
          <EstadoVacio loading>Cargando pipeline…</EstadoVacio>
        </div>
      ) : items.length === 0 ? (
        <div className="mt-6">
          <EstadoVacio>
            Aún no hay personas en consolidación. Agrega una o envía visitantes
            desde el check-in de Asistencia.
          </EstadoVacio>
        </div>
      ) : vista === "metricas" ? (
        <PanelMetricas metricas={metricas} servMap={servMap} />
      ) : (
        <>
          {/* Filtros del tablero */}
          <div className="mb-4 mt-6 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSoloRiesgo((v) => !v)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                soloRiesgo
                  ? "border-red-500 bg-red-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:text-red-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              Requiere atención
              <span
                className={`rounded-full px-1.5 text-xs ${
                  soloRiesgo ? "bg-white/20" : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300"
                }`}
              >
                {kpis.riesgo}
              </span>
            </button>
            <label className="ml-1 inline-flex cursor-pointer items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <input
                type="checkbox"
                checked={verDescartados}
                onChange={(e) => setVerDescartados(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              Ver descartados
            </label>
          </div>

          {/* Tablero Kanban */}
          <div className="flex flex-col gap-4 lg:flex-row lg:overflow-x-auto lg:pb-2">
            {columnas.map((etapa) => {
              const cards = porEstado.get(etapa.estado) ?? [];
              return (
                <div
                  key={etapa.estado}
                  className={`flex flex-col rounded-2xl border border-t-4 border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-900/40 lg:w-72 lg:shrink-0 ${etapa.col}`}
                >
                  <div className="mb-3 flex items-center justify-between px-1">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      {etapa.label}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${etapa.badge}`}
                    >
                      {cards.length}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {cards.length === 0 ? (
                      <p className="px-1 py-6 text-center text-xs text-slate-400">
                        {soloRiesgo ? "Sin casos en riesgo" : "Sin personas"}
                      </p>
                    ) : (
                      cards.map((c) => (
                        <ConsCard
                          key={c.id}
                          c={c}
                          responsable={c.responsable_id ? servMap.get(c.responsable_id) : undefined}
                          busy={procesando.has(c.id)}
                          riesgo={riesgoSet.has(c.id)}
                          onOpen={() => abrir(c.id)}
                          onEstado={(nuevo) => cambiarEtapa(c, nuevo)}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Drawer de detalle pastoral */}
      {sel && (
        <div className="fixed inset-0 z-50 flex">
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => setSelId(null)}
            className="flex-1 bg-slate-900/40 backdrop-blur-sm"
          />
          <div className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${META(sel.estado).badge}`}
                >
                  {META(sel.estado).label}
                </span>
                <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {sel.nombre}
                </h2>
                <p className="text-xs text-slate-400">
                  {sel.origen === "asistencia"
                    ? "Vino del check-in"
                    : sel.origen === "web"
                      ? "Vino de la web"
                      : "Alta manual"}{" "}
                  · {etiquetaDias(diasDesde(sel.fecha_recepcion))}
                  {sel.miembro_id ? " · ✔ Ya es miembro" : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelId(null)}
                aria-label="Cerrar"
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Cambio de etapa */}
            <label className="mb-4 block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Etapa del pipeline
              </span>
              <select
                value={sel.estado}
                onChange={(e) =>
                  cambiarEtapa(sel, e.target.value as EstadoConsolidacion)
                }
                className={SEL.replace("text-xs", "text-sm")}
              >
                {TODAS_ETAPAS.map((et) => (
                  <option key={et.estado} value={et.estado}>
                    {et.label}
                  </option>
                ))}
              </select>
            </label>

            {/* Datos de contacto */}
            <div className="grid gap-3">
              <Field label="Nombre">
                <Input
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Teléfono">
                  <Input
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  />
                </Field>
                <Field label="Email">
                  <Input
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="Dirección">
                <Input
                  value={form.direccion}
                  onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                />
              </Field>
              <Field label="Responsable">
                <select
                  value={respSel}
                  onChange={(e) => cambiarResp(e.target.value)}
                  className={SEL.replace("text-xs", "text-sm")}
                >
                  <option value="">— Sin asignar —</option>
                  {servidores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre}
                      {s.rol ? ` · ${s.rol}` : ""}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={guardarContacto}
                  loading={procesando.has(sel.id)}
                >
                  Guardar contacto
                </Button>
                {puedeConvertir && !sel.miembro_id && (
                  <Button type="button" variant="ghost" onClick={convertir}>
                    <IdCardIcon className="h-4 w-4" />
                    Convertir en miembro
                  </Button>
                )}
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => eliminar(sel)}
                  className="ml-auto"
                >
                  <TrashIcon className="h-4 w-4" />
                  Eliminar
                </Button>
              </div>
            </div>

            {/* Contactar por WhatsApp (wa.me) */}
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-emerald-800 dark:text-emerald-300">
                💬 Contactar por WhatsApp
              </h3>
              <select
                value={waPlantilla}
                onChange={(e) => setWaPlantilla(e.target.value)}
                className={SEL.replace("text-xs", "text-sm")}
              >
                {PLANTILLAS_WA.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
              <p className="mt-2 whitespace-pre-wrap rounded-xl bg-white/70 p-3 text-xs text-slate-600 dark:bg-slate-900/40 dark:text-slate-300">
                {waMensaje}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={contactarWhatsApp}
                  disabled={!waTelefono}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:-translate-y-0.5 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  Abrir WhatsApp
                </button>
                {!waTelefono && (
                  <span className="text-xs text-amber-600 dark:text-amber-400">
                    Sin teléfono válido — agrégalo arriba.
                  </span>
                )}
              </div>
              <p className="mt-2 text-[11px] text-emerald-700/70 dark:text-emerald-400/60">
                Se abrirá el chat con el mensaje prellenado y se registrará una
                nota automática en el historial.
              </p>
            </div>

            {/* Timeline de notas pastorales */}
            <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800">
              <h3 className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-200">
                Historial pastoral
              </h3>
              <form onSubmit={enviarNota} className="mb-4 grid gap-2">
                <div className="flex gap-2">
                  <select
                    value={notaTipo}
                    onChange={(e) => setNotaTipo(e.target.value as TipoNota)}
                    className={`${SEL} max-w-[130px]`}
                  >
                    {TIPOS_NOTA.map((tp) => (
                      <option key={tp} value={tp}>
                        {TIPO_NOTA_META[tp].label}
                      </option>
                    ))}
                  </select>
                  <Button type="submit" className="px-4 py-2 text-xs">
                    Agregar nota
                  </Button>
                </div>
                <Textarea
                  value={notaTexto}
                  onChange={(e) => setNotaTexto(e.target.value)}
                  placeholder="¿Qué pasó en este contacto? (llamada, visita, oración…)"
                  className="min-h-20"
                />
              </form>

              {notasLoading ? (
                <EstadoVacio loading>Cargando historial…</EstadoVacio>
              ) : notas.length === 0 ? (
                <p className="py-4 text-center text-xs text-slate-400">
                  Sin notas todavía. Registra el primer contacto. 🌱
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {notas.map((n) => (
                    <li
                      key={n.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/40"
                    >
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${TIPO_NOTA_META[n.tipo].cls}`}
                        >
                          {TIPO_NOTA_META[n.tipo].label}
                        </span>
                        <span className="text-xs text-slate-400">
                          {fmtFechaHora(n.creado_at)}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">
                        {n.nota}
                      </p>
                      {n.autor_id && servMap.get(n.autor_id) && (
                        <p className="mt-1 text-xs text-slate-400">
                          — {servMap.get(n.autor_id)}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de alta manual */}
      {nuevoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => setNuevoOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <Card className="relative z-10 w-full max-w-md">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Nueva persona en consolidación
              </h2>
              <button
                type="button"
                onClick={() => setNuevoOpen(false)}
                aria-label="Cerrar"
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={crearNuevo} className="grid gap-3">
              <Field label="Nombre">
                <Input
                  autoFocus
                  value={nuevo.nombre}
                  onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
                  placeholder="Nombre y apellido"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Teléfono">
                  <Input
                    value={nuevo.telefono}
                    onChange={(e) => setNuevo({ ...nuevo, telefono: e.target.value })}
                  />
                </Field>
                <Field label="Email">
                  <Input
                    value={nuevo.email}
                    onChange={(e) => setNuevo({ ...nuevo, email: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="Dirección">
                <Input
                  value={nuevo.direccion}
                  onChange={(e) => setNuevo({ ...nuevo, direccion: e.target.value })}
                />
              </Field>
              <div className="mt-1 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setNuevoOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" loading={guardandoNuevo}>
                  Agregar al pipeline
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

function ConsCard({
  c,
  responsable,
  busy,
  riesgo,
  onOpen,
  onEstado,
}: {
  c: ConsRow;
  responsable?: string;
  busy: boolean;
  riesgo: boolean;
  onOpen: () => void;
  onEstado: (nuevo: EstadoConsolidacion) => void;
}) {
  const dias = etiquetaDias(diasDesde(c.fecha_recepcion));
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className={`cursor-pointer rounded-xl border bg-white p-3 text-left shadow-sm transition-shadow hover:shadow-md dark:bg-slate-800 ${
        riesgo
          ? "border-red-300 ring-1 ring-red-200 dark:border-red-900/60 dark:ring-red-900/40"
          : "border-slate-200 dark:border-slate-700"
      } ${busy ? "opacity-60" : ""}`}
    >
      {riesgo && (
        <span className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600 dark:bg-red-950/40 dark:text-red-400">
          ⚠ En riesgo
        </span>
      )}
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-slate-900 dark:text-white">{c.nombre}</p>
        {c.miembro_id && (
          <span className="shrink-0 text-xs text-emerald-600" title="Ya es miembro">
            ✔
          </span>
        )}
      </div>
      {(c.telefono || c.email) && (
        <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
          {c.telefono || c.email}
        </p>
      )}
      <div className="mt-2 flex items-center justify-between gap-2 text-xs">
        <span
          className={`truncate ${responsable ? "text-slate-500 dark:text-slate-400" : "text-amber-600 dark:text-amber-400"}`}
        >
          {responsable ? `👤 ${responsable}` : "Sin asignar"}
        </span>
        {dias && <span className="shrink-0 text-slate-400">{dias}</span>}
      </div>
      {/* Cambio rápido de etapa (no abre el drawer) */}
      <select
        value={c.estado}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => onEstado(e.target.value as EstadoConsolidacion)}
        className={`mt-2 ${SEL}`}
      >
        {TODAS_ETAPAS.map((et) => (
          <option key={et.estado} value={et.estado}>
            {et.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function PanelMetricas({
  metricas,
  servMap,
}: {
  metricas: MetricasSalud;
  servMap: Map<string, string>;
}) {
  const { embudo, conversion, integrados, totalPipeline, tiempoPromedioDias, carga } =
    metricas;
  const maxEmbudo = Math.max(1, ...ETAPAS.map((e) => embudo[e.estado]));
  const maxCarga = Math.max(1, ...carga.map((c) => c.activos));

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      {/* Embudo de conversión */}
      <Card>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Embudo de conversión
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          De <b>{totalPipeline}</b> en pipeline, <b>{integrados}</b> integrados ·{" "}
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            {conversion}% de conversión
          </span>
        </p>
        <div className="mt-4 flex flex-col gap-3">
          {ETAPAS.map((e) => {
            const n = embudo[e.estado];
            return (
              <div key={e.estado}>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <span>{e.label}</span>
                  <span>{n}</span>
                </div>
                <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`h-full rounded-full ${BAR_BG[e.estado]}`}
                    style={{ width: `${Math.round((n / maxEmbudo) * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Tiempo promedio de integración */}
      <Card>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Tiempo promedio de integración
        </h3>
        <p className="mt-4 text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          {tiempoPromedioDias === null ? "—" : `${tiempoPromedioDias} días`}
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Aprox. desde la recepción hasta marcar <b>Integrado</b>
          {tiempoPromedioDias === null ? " (aún no hay integrados)." : "."}
        </p>
      </Card>

      {/* Carga por responsable */}
      <Card className="lg:col-span-2">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Carga por responsable
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Visitantes activos asignados (excluye integrados y descartados).
        </p>
        {carga.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">Sin personas activas.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2.5">
            {carga.map((c) => {
              const nombre = c.responsable_id
                ? (servMap.get(c.responsable_id) ?? "Responsable")
                : "Sin asignar";
              const sinAsignar = !c.responsable_id;
              return (
                <li key={c.responsable_id ?? "none"} className="flex items-center gap-3">
                  <span
                    className={`w-32 shrink-0 truncate text-sm sm:w-44 ${
                      sinAsignar
                        ? "font-semibold text-amber-600 dark:text-amber-400"
                        : "text-slate-700 dark:text-slate-200"
                    }`}
                    title={nombre}
                  >
                    {nombre}
                  </span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full ${sinAsignar ? "bg-amber-400" : "bg-blue-500"}`}
                      style={{ width: `${Math.round((c.activos / maxCarga) * 100)}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm font-bold text-slate-900 dark:text-white">
                    {c.activos}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
