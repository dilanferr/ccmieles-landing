"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Card,
  Field,
  Input,
  Textarea,
  Select,
  Button,
  Alerta,
  EstadoVacio,
  ModuleHeader,
} from "./ui";
import {
  UserCheckIcon,
  PencilIcon,
  TrashIcon,
  CloseIcon,
  CheckIcon,
  ChevronLeft,
  SearchIcon,
  DownloadIcon,
} from "@/app/components/icons";
import { getDb } from "./db";
import { esc, exportarPdf } from "@/src/utils/exportPdf";
import {
  crearSesionCulto,
  actualizarSesionCulto,
  cerrarSesionCulto,
  eliminarSesionCulto,
  registrarCheckIn,
  registrarCheckOut,
  type SesionInput,
  type SesionRow,
  type TipoSesion,
} from "./asistencia-actions";
import { consolidarDesdeAsistencia } from "./consolidacion-actions";

type Sesion = SesionRow;
type Asistencia = {
  id: string;
  evento_culto_id: string;
  miembro_id: string | null;
  visitante_nombre: string | null;
  tipo_asistente: "miembro" | "visitante";
  registrado_at: string;
};

const SES_COLS = "id, nombre, tipo, fecha, hora, descripcion, cerrada_at, creado_at";
const ASIS_COLS =
  "id, evento_culto_id, miembro_id, visitante_nombre, tipo_asistente, registrado_at";

const fmtFecha = (s: string | null) => {
  if (!s) return "—";
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
};
function hoyISO() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const S_VACIO = {
  nombre: "",
  tipo: "culto",
  fecha: "",
  hora: "",
  descripcion: "",
};

/** CSS del reporte de asistencia (el esqueleto lo aporta exportPdf). */
const CSS_ASISTENCIA_PDF = `
  .tot{margin-top:22px;font-size:14px;color:#334155}
  table{width:100%;border-collapse:collapse;margin-top:14px;font-size:12px}
  thead th{background:#1e3a8a;color:#fff;text-align:left;padding:9px 12px;font-size:10px;text-transform:uppercase;letter-spacing:.04em}
  tbody td{padding:8px 12px;border-bottom:1px solid #e9eef5}
  tbody tr:nth-child(even){background:#f8fafc}
  .n{width:36px;color:#94a3b8;text-align:right}
  .tag{display:inline-block;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:700}
  .tag.mi{background:#eff6ff;color:#1d4ed8}.tag.vi{background:#ecfdf5;color:#059669}
`;

export default function AsistenciaModule() {
  const supabase = getDb();
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [directorio, setDirectorio] = useState<{ id: string; nombre: string }[]>(
    [],
  );
  const [conteos, setConteos] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Modal de sesión (crear/editar)
  const [abierto, setAbierto] = useState(false);
  const [form, setForm] = useState(S_VACIO);
  const [editId, setEditId] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  // Vista de check-in
  const [activa, setActiva] = useState<Sesion | null>(null);
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [cargandoAsis, setCargandoAsis] = useState(false);
  const [buscar, setBuscar] = useState("");
  const [visitante, setVisitante] = useState("");
  const [procesando, setProcesando] = useState<Set<string>>(new Set());
  const [consolidando, setConsolidando] = useState<Set<string>>(new Set());
  const [checkMsg, setCheckMsg] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  useEffect(() => {
    let vivo = true;
    (async () => {
      const [sesRes, dirRes, cntRes] = await Promise.all([
        supabase
          .from("eventos_cultos")
          .select(SES_COLS)
          .is("eliminado_at", null)
          .order("fecha", { ascending: false }),
        supabase.rpc("directorio_miembros"),
        supabase.from("asistencias").select("evento_culto_id").is("eliminado_at", null),
      ]);
      if (!vivo) return;
      setSesiones((sesRes.data as Sesion[]) ?? []);
      setDirectorio((dirRes.data as { id: string; nombre: string }[]) ?? []);
      const map: Record<string, number> = {};
      ((cntRes.data as { evento_culto_id: string }[]) ?? []).forEach((r) => {
        map[r.evento_culto_id] = (map[r.evento_culto_id] ?? 0) + 1;
      });
      setConteos(map);
      setLoading(false);
    })();
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (k: keyof typeof S_VACIO) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  // ---- Sesiones ----
  function abrirNueva() {
    setEditId(null);
    setForm({ ...S_VACIO, fecha: hoyISO() });
    setMsg(null);
    setAbierto(true);
  }
  function editarSesion(s: Sesion) {
    setEditId(s.id);
    setForm({
      nombre: s.nombre,
      tipo: s.tipo,
      fecha: s.fecha,
      hora: s.hora ?? "",
      descripcion: s.descripcion ?? "",
    });
    setMsg(null);
    setAbierto(true);
  }

  async function guardarSesion(e: FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setMsg(null);
    const input: SesionInput = {
      nombre: form.nombre,
      tipo: form.tipo as TipoSesion,
      fecha: form.fecha || hoyISO(),
      hora: form.hora || null,
      descripcion: form.descripcion || null,
    };
    const res = editId
      ? await actualizarSesionCulto(editId, input)
      : await crearSesionCulto(input);
    setGuardando(false);
    if (!res.ok || !res.data) {
      setMsg({ ok: false, text: res.error ?? "No se pudo guardar la sesión." });
      return;
    }
    const fila = res.data;
    setSesiones((l) =>
      editId ? l.map((s) => (s.id === editId ? fila : s)) : [fila, ...l],
    );
    setMsg({ ok: true, text: editId ? "Sesión actualizada." : "Sesión creada." });
    setAbierto(false);
    setEditId(null);
  }

  async function alternarCierre(s: Sesion) {
    const cerrar = !s.cerrada_at;
    const res = await cerrarSesionCulto(s.id, cerrar);
    if (!res.ok || !res.data) {
      setMsg({ ok: false, text: res.error ?? "No se pudo cambiar el estado." });
      return;
    }
    setSesiones((l) => l.map((x) => (x.id === s.id ? res.data! : x)));
    if (activa?.id === s.id) setActiva(res.data);
  }

  async function eliminarSesion(s: Sesion) {
    if (!confirm(`¿Eliminar la sesión "${s.nombre}"?`)) return;
    const res = await eliminarSesionCulto(s.id);
    if (!res.ok) {
      setMsg({ ok: false, text: res.error ?? "No se pudo eliminar." });
      return;
    }
    setSesiones((l) => l.filter((x) => x.id !== s.id));
    setMsg({ ok: true, text: "Sesión eliminada." });
  }

  // ---- Check-in ----
  async function tomarAsistencia(s: Sesion) {
    setActiva(s);
    setBuscar("");
    setVisitante("");
    setCheckMsg(null);
    setCargandoAsis(true);
    setAsistencias([]);
    const { data } = await supabase
      .from("asistencias")
      .select(ASIS_COLS)
      .eq("evento_culto_id", s.id)
      .is("eliminado_at", null);
    setAsistencias((data as Asistencia[]) ?? []);
    setCargandoAsis(false);
  }

  function volver() {
    if (activa) {
      setConteos((c) => ({ ...c, [activa.id]: asistencias.length }));
    }
    setActiva(null);
  }

  const asisPorMiembro = useMemo(() => {
    const m = new Map<string, Asistencia>();
    for (const a of asistencias) {
      if (a.tipo_asistente === "miembro" && a.miembro_id) m.set(a.miembro_id, a);
    }
    return m;
  }, [asistencias]);

  const visitantes = useMemo(
    () => asistencias.filter((a) => a.tipo_asistente === "visitante"),
    [asistencias],
  );

  const miembrosFiltrados = useMemo(() => {
    const q = buscar.trim().toLowerCase();
    if (!q) return directorio;
    return directorio.filter((m) => m.nombre.toLowerCase().includes(q));
  }, [directorio, buscar]);

  const cerrada = !!activa?.cerrada_at;

  async function toggleMiembro(m: { id: string; nombre: string }) {
    if (!activa || cerrada || procesando.has(m.id)) return;
    setProcesando((s) => new Set(s).add(m.id));
    setCheckMsg(null);
    const existente = asisPorMiembro.get(m.id);
    if (existente) {
      setAsistencias((a) => a.filter((x) => x.id !== existente.id));
      const res = await registrarCheckOut(existente.id);
      if (!res.ok) {
        setAsistencias((a) => [...a, existente]);
        setCheckMsg({ ok: false, text: res.error ?? "No se pudo quitar." });
      }
    } else {
      const res = await registrarCheckIn({
        evento_culto_id: activa.id,
        miembro_id: m.id,
      });
      if (res.ok && res.data) {
        setAsistencias((a) => [...a, res.data as Asistencia]);
      } else {
        setCheckMsg({ ok: false, text: res.error ?? "No se pudo registrar." });
      }
    }
    setProcesando((s) => {
      const n = new Set(s);
      n.delete(m.id);
      return n;
    });
  }

  async function agregarVisitante(e: FormEvent) {
    e.preventDefault();
    if (!activa || cerrada) return;
    const nombre = visitante.trim();
    if (!nombre) return;
    setCheckMsg(null);
    const res = await registrarCheckIn({
      evento_culto_id: activa.id,
      visitante_nombre: nombre,
    });
    if (res.ok && res.data) {
      setAsistencias((a) => [...a, res.data as Asistencia]);
      setVisitante("");
    } else {
      setCheckMsg({ ok: false, text: res.error ?? "No se pudo agregar el visitante." });
    }
  }

  async function quitarVisitante(a: Asistencia) {
    if (cerrada) return;
    setAsistencias((list) => list.filter((x) => x.id !== a.id));
    const res = await registrarCheckOut(a.id);
    if (!res.ok) {
      setAsistencias((list) => [...list, a]);
      setCheckMsg({ ok: false, text: res.error ?? "No se pudo quitar." });
    }
  }

  async function consolidar(a: Asistencia) {
    setConsolidando((s) => new Set(s).add(a.id));
    const res = await consolidarDesdeAsistencia(a.id);
    setCheckMsg(
      res.ok
        ? { ok: true, text: `${a.visitante_nombre ?? "Visitante"} pasó a Consolidación.` }
        : { ok: false, text: res.error ?? "No se pudo enviar a Consolidación." },
    );
    setConsolidando((s) => {
      const n = new Set(s);
      n.delete(a.id);
      return n;
    });
  }

  function exportar() {
    if (!activa) return;
    const nombreMiembro = new Map(directorio.map((d) => [d.id, d.nombre]));
    const filas = asistencias
      .map((a) => ({
        nombre:
          a.tipo_asistente === "miembro"
            ? a.miembro_id
              ? (nombreMiembro.get(a.miembro_id) ?? "—")
              : "—"
            : (a.visitante_nombre ?? "—"),
        tipo: a.tipo_asistente === "miembro" ? "Miembro" : "Visitante",
      }))
      .sort((x, y) => x.nombre.localeCompare(y.nombre, "es"));
    const rows = filas
      .map(
        (f, i) =>
          `<tr><td class="n">${i + 1}</td><td>${esc(f.nombre)}</td><td><span class="tag ${f.tipo === "Miembro" ? "mi" : "vi"}">${f.tipo}</span></td></tr>`,
      )
      .join("");
    const miembros = asistencias.filter(
      (a) => a.tipo_asistente === "miembro",
    ).length;
    const vis = asistencias.length - miembros;
    const cuerpo = `<div class="tot">Total presentes: <b>${asistencias.length}</b> · Miembros: ${miembros} · Visitantes: ${vis}</div>
    <table>
      <thead><tr><th class="n">#</th><th>Nombre</th><th>Tipo</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="3" style="text-align:center;padding:20px;color:#94a3b8">Sin asistentes registrados.</td></tr>'}</tbody>
    </table>`;
    const ok = exportarPdf({
      titulo: "Asistencia",
      encabezado: `Asistencia · ${activa.nombre}`,
      subtitulo: `${activa.tipo === "culto" ? "Culto" : "Evento"} · ${fmtFecha(activa.fecha)}${activa.hora ? ` · ${activa.hora}` : ""}`,
      cuerpo,
      estilos: CSS_ASISTENCIA_PDF,
      ancho: 720,
      margenMm: 14,
    });
    if (!ok) {
      setCheckMsg({
        ok: false,
        text: "Permite las ventanas emergentes para exportar el reporte.",
      });
    }
  }

  // ================= Vista de CHECK-IN =================
  if (activa) {
    const totalMiembros = directorio.length || 1;
    const miembrosPresentes = asisPorMiembro.size;
    const pct = Math.round((miembrosPresentes / totalMiembros) * 100);
    return (
      <div>
        <button
          type="button"
          onClick={volver}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver a las sesiones
        </button>

        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {activa.nombre}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              {activa.tipo === "culto" ? "Culto" : "Evento"} ·{" "}
              {fmtFecha(activa.fecha)}
              {activa.hora ? ` · ${activa.hora}` : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={exportar}>
              <DownloadIcon className="h-4 w-4" />
              Exportar
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => alternarCierre(activa)}
            >
              {cerrada ? "Reabrir sesión" : "Cerrar sesión"}
            </Button>
          </div>
        </div>

        {/* Contador en vivo + progreso */}
        <Card className="mb-5">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                {asistencias.length}
              </p>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                presentes · {miembrosPresentes} miembros · {visitantes.length}{" "}
                visitantes
              </p>
            </div>
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              {pct}% de miembros
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-linear-to-r from-blue-600 to-emerald-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </Card>

        {cerrada && (
          <div className="mb-5">
            <Alerta ok={false}>
              Esta sesión está cerrada. Reábrela para modificar la asistencia.
            </Alerta>
          </div>
        )}

        {/* Buscador instantáneo */}
        <div className="relative mb-4">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            placeholder="Buscar miembro por nombre…"
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        {/* Lista de miembros (un toque) */}
        {cargandoAsis ? (
          <EstadoVacio loading>Cargando asistencia…</EstadoVacio>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {miembrosFiltrados.map((m) => {
              const presente = asisPorMiembro.has(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  disabled={cerrada || procesando.has(m.id)}
                  onClick={() => toggleMiembro(m)}
                  className={`flex items-center justify-between gap-2 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors disabled:opacity-60 ${
                    presente
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                      : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  }`}
                >
                  <span className="truncate">{m.nombre}</span>
                  {presente ? (
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-500 text-white">
                      <CheckIcon className="h-4 w-4" />
                    </span>
                  ) : (
                    <span className="shrink-0 text-lg text-slate-300">+</span>
                  )}
                </button>
              );
            })}
            {miembrosFiltrados.length === 0 && (
              <p className="col-span-full py-6 text-center text-sm text-slate-400">
                Ningún miembro coincide con “{buscar}”.
              </p>
            )}
          </div>
        )}

        {/* Visitantes */}
        <Card className="mt-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Visitantes
          </h3>
          {!cerrada && (
            <form onSubmit={agregarVisitante} className="mt-3 flex gap-2">
              <input
                value={visitante}
                onChange={(e) => setVisitante(e.target.value)}
                placeholder="Nombre del visitante…"
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <Button type="submit">Agregar</Button>
            </form>
          )}
          {visitantes.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">
              Aún no hay visitantes registrados.
            </p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {visitantes.map((v) => (
                <span
                  key={v.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                >
                  {v.visitante_nombre}
                  <button
                    type="button"
                    onClick={() => consolidar(v)}
                    disabled={consolidando.has(v.id)}
                    title="Enviar a Consolidación"
                    className="font-semibold text-emerald-600 hover:text-emerald-700 disabled:opacity-50 dark:text-emerald-400"
                  >
                    → Consolidar
                  </button>
                  {!cerrada && (
                    <button
                      type="button"
                      onClick={() => quitarVisitante(v)}
                      aria-label="Quitar"
                      className="text-blue-400 hover:text-blue-700"
                    >
                      <CloseIcon className="h-3.5 w-3.5" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          )}
        </Card>

        {checkMsg && (
          <div className="mt-4">
            <Alerta ok={checkMsg.ok}>{checkMsg.text}</Alerta>
          </div>
        )}
      </div>
    );
  }

  // ================= Vista de LISTA =================
  return (
    <div>
      <ModuleHeader
        icon={<UserCheckIcon className="h-6 w-6" />}
        titulo="Asistencia y Check-in"
        descripcion="Registro ágil de asistencia de miembros y visitantes en cultos y eventos."
      />

      <div className="mb-5 flex items-center justify-between">
        <span className="text-sm text-slate-400">
          {sesiones.length} {sesiones.length === 1 ? "sesión" : "sesiones"}
        </span>
        <Button type="button" onClick={abrirNueva}>
          + Nueva sesión
        </Button>
      </div>

      {loading ? (
        <EstadoVacio loading>Cargando sesiones…</EstadoVacio>
      ) : sesiones.length === 0 ? (
        <EstadoVacio>
          Aún no hay cultos ni eventos. Crea el primero para tomar asistencia.
        </EstadoVacio>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sesiones.map((s) => {
            const cerr = !!s.cerrada_at;
            return (
              <Card key={s.id} className="flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-900 dark:text-white">
                      {s.nombre}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {s.tipo === "culto" ? "Culto" : "Evento"} · {fmtFecha(s.fecha)}
                      {s.hora ? ` · ${s.hora}` : ""}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                      cerr
                        ? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                    }`}
                  >
                    {cerr ? "Cerrado" : "Abierto"}
                  </span>
                </div>

                <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {conteos[s.id] ?? 0}
                </p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  presentes
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={() => tomarAsistencia(s)}
                    className="flex-1 px-3 py-2 text-xs"
                  >
                    Tomar asistencia
                  </Button>
                  <button
                    type="button"
                    onClick={() => alternarCierre(s)}
                    title={cerr ? "Reabrir" : "Cerrar"}
                    className="inline-grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {cerr ? "↺" : "✓"}
                  </button>
                  <button
                    type="button"
                    onClick={() => editarSesion(s)}
                    aria-label="Editar"
                    className="inline-grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                  >
                    <PencilIcon className="h-4.5 w-4.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => eliminarSesion(s)}
                    aria-label="Eliminar"
                    className="inline-grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <TrashIcon className="h-4.5 w-4.5" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {msg && (
        <div className="mt-4">
          <Alerta ok={msg.ok}>{msg.text}</Alerta>
        </div>
      )}

      {/* Modal crear / editar sesión */}
      {abierto && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm sm:p-8">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editId ? "Editar sesión" : "Nueva sesión"}
              </h2>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                aria-label="Cerrar"
                className="grid h-9 w-9 place-items-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={guardarSesion} className="space-y-5">
              <Field label="Nombre">
                <Input
                  value={form.nombre}
                  onChange={set("nombre")}
                  placeholder="Ej: Culto Familiar Dominical"
                  required
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Tipo">
                  <Select value={form.tipo} onChange={set("tipo")}>
                    <option value="culto">Culto</option>
                    <option value="evento">Evento</option>
                  </Select>
                </Field>
                <Field label="Fecha">
                  <Input type="date" value={form.fecha} onChange={set("fecha")} />
                </Field>
                <Field label="Hora" hint="Opcional">
                  <Input
                    value={form.hora}
                    onChange={set("hora")}
                    placeholder="Ej: 11:30 hrs"
                  />
                </Field>
              </div>
              <Field label="Descripción" hint="Opcional">
                <Textarea
                  value={form.descripcion}
                  onChange={set("descripcion")}
                  placeholder="Observaciones de la sesión…"
                />
              </Field>

              {msg && !msg.ok && <Alerta ok={false}>{msg.text}</Alerta>}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setAbierto(false)}
                  disabled={guardando}
                >
                  Cancelar
                </Button>
                <Button type="submit" loading={guardando}>
                  {editId ? "Guardar cambios" : "Crear sesión"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
