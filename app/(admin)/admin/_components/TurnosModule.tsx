"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
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
  CalendarIcon,
  CloseIcon,
  DownloadIcon,
  ChevronLeft,
  ChevronRight,
} from "@/app/components/icons";
import { getDb } from "./db";
import { esc, exportarPdf } from "@/src/utils/exportPdf";
import { crearTurno, actualizarTurno, eliminarTurno } from "./turnos-actions";

type Equipo = { id: string; nombre: string };
type Persona = { id: string; nombre: string };
type Turno = {
  id: string;
  fecha: string;
  equipo_id: string;
  miembro_id: string;
  rol_en_equipo: string;
  notas: string;
};

type TurnoDB = {
  id: string;
  fecha: string;
  equipo_id: string;
  miembro_id: string | null;
  rol_en_equipo: string | null;
  notas: string | null;
};

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

const VACIO = {
  fecha: "",
  equipo_id: "",
  miembro_id: "",
  rol_en_equipo: "",
  notas: "",
};

/* ---------- helpers de fechas ---------- */

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}
function hoyYmd() {
  return ymd(new Date());
}
/** Lunes de la semana de `iso`. */
function lunesDe(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  const dow = d.getDay();
  d.setDate(d.getDate() + (dow === 0 ? -6 : 1 - dow));
  return d;
}
/** Los 7 días (Lun→Dom) de la semana de `iso`. */
function semanaDe(iso: string): string[] {
  const l = lunesDe(iso);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(l);
    d.setDate(l.getDate() + i);
    return ymd(d);
  });
}
function sumarDias(iso: string, n: number) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  return ymd(d);
}
function sumarMeses(iso: string, n: number) {
  const d = new Date(`${iso}T00:00:00`);
  d.setMonth(d.getMonth() + n);
  return ymd(d);
}
function diaNum(iso: string) {
  return Number(iso.slice(8, 10));
}
function rangoSemanaTxt(dias: string[]) {
  const a = new Date(`${dias[0]}T00:00:00`);
  const b = new Date(`${dias[6]}T00:00:00`);
  const m1 = MESES[a.getMonth()];
  const m2 = MESES[b.getMonth()];
  const y = b.getFullYear();
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return m1 === m2
    ? `${diaNum(dias[0])} al ${diaNum(dias[6])} de ${cap(m2)}, ${y}`
    : `${diaNum(dias[0])} de ${cap(m1)} al ${diaNum(dias[6])} de ${cap(m2)}, ${y}`;
}
/** Grilla del mes (6 semanas × 7 días, inicio en Lunes). */
function mesGrid(iso: string): string[][] {
  const base = new Date(`${iso}T00:00:00`);
  const primero = ymd(new Date(base.getFullYear(), base.getMonth(), 1));
  const inicio = lunesDe(primero);
  const semanas: string[][] = [];
  const cur = new Date(inicio);
  for (let w = 0; w < 6; w++) {
    const row: string[] = [];
    for (let i = 0; i < 7; i++) {
      row.push(ymd(cur));
      cur.setDate(cur.getDate() + 1);
    }
    semanas.push(row);
  }
  return semanas;
}
/** CSS específico de la planilla de turnos (el esqueleto lo aporta exportPdf). */
const CSS_TURNOS_PDF = `
  table{width:100%;border-collapse:collapse;margin-top:20px;font-size:11px;table-layout:fixed}
  th,td{border:1px solid #dbe3ef;padding:7px 8px;vertical-align:top}
  thead th{background:#1e3a8a;color:#fff;text-align:center;font-size:10px;text-transform:uppercase}
  th.eq{background:#eef4ff;color:#1e3a8a;text-align:left;font-weight:800;width:120px}
  .p{font-weight:600;padding:1px 0}
  .r{color:#64748b;font-weight:400}
`;

export default function TurnosModule() {
  const supabase = getDb();
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [directorio, setDirectorio] = useState<Persona[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);

  const [vista, setVista] = useState<"semana" | "mes">("semana");
  const [ancla, setAncla] = useState(hoyYmd());

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(VACIO);
  const [editId, setEditId] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const set = (k: keyof typeof VACIO) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const cerrar = useCallback(() => {
    setModal(false);
    setEditId(null);
  }, []);

  useEffect(() => {
    let activo = true;
    (async () => {
      const [eq, dir, tr] = await Promise.all([
        supabase.from("equipos").select("id, nombre").order("orden"),
        supabase.rpc("directorio_miembros"),
        supabase
          .from("turnos_servidores")
          .select("id, fecha, equipo_id, miembro_id, rol_en_equipo, notas"),
      ]);
      if (!activo) return;
      if (eq.data) setEquipos(eq.data as Equipo[]);
      if (dir.data) setDirectorio(dir.data as Persona[]);
      if (tr.data)
        setTurnos(
          (tr.data as TurnoDB[]).map((t) => ({
            id: t.id,
            fecha: t.fecha,
            equipo_id: t.equipo_id,
            miembro_id: t.miembro_id ?? "",
            rol_en_equipo: t.rol_en_equipo ?? "",
            notas: t.notas ?? "",
          })),
        );
      setLoading(false);
    })();
    return () => {
      activo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [modal, cerrar]);

  const nombreMiembro = useCallback(
    (id: string) => directorio.find((p) => p.id === id)?.nombre ?? "—",
    [directorio],
  );
  const dias = useMemo(() => semanaDe(ancla), [ancla]);

  // Índice rápido: turnos por "fecha|equipo".
  const porCelda = useMemo(() => {
    const map = new Map<string, Turno[]>();
    for (const t of turnos) {
      const k = `${t.fecha}|${t.equipo_id}`;
      const arr = map.get(k) ?? [];
      arr.push(t);
      map.set(k, arr);
    }
    return map;
  }, [turnos]);
  const enCelda = (fecha: string, equipoId: string) =>
    porCelda.get(`${fecha}|${equipoId}`) ?? [];

  const porDia = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of turnos) map.set(t.fecha, (map.get(t.fecha) ?? 0) + 1);
    return map;
  }, [turnos]);

  function abrir(fecha?: string, equipoId?: string) {
    setForm({
      ...VACIO,
      fecha: fecha ?? hoyYmd(),
      equipo_id: equipoId ?? equipos[0]?.id ?? "",
    });
    setEditId(null);
    setMsg(null);
    setModal(true);
  }

  function editar(t: Turno) {
    setForm({
      fecha: t.fecha,
      equipo_id: t.equipo_id,
      miembro_id: t.miembro_id,
      rol_en_equipo: t.rol_en_equipo,
      notas: t.notas,
    });
    setEditId(t.id);
    setMsg(null);
    setModal(true);
  }

  async function guardar(e: FormEvent) {
    e.preventDefault();
    if (!form.equipo_id || !form.miembro_id || !form.fecha) {
      setMsg({ ok: false, text: "Fecha, equipo y servidor son obligatorios." });
      return;
    }
    setGuardando(true);
    const input = {
      fecha: form.fecha,
      equipo_id: form.equipo_id,
      miembro_id: form.miembro_id,
      rol_en_equipo: form.rol_en_equipo || null,
      notas: form.notas || null,
    };
    const res = editId
      ? await actualizarTurno(editId, input)
      : await crearTurno(input);
    setGuardando(false);
    if (!res.ok || !res.data) {
      setMsg({ ok: false, text: res.error ?? "No se pudo guardar el turno." });
      return;
    }
    const fila: Turno = {
      id: res.data.id,
      fecha: res.data.fecha,
      equipo_id: res.data.equipo_id,
      miembro_id: res.data.miembro_id ?? "",
      rol_en_equipo: res.data.rol_en_equipo ?? "",
      notas: res.data.notas ?? "",
    };
    setTurnos((l) =>
      editId ? l.map((t) => (t.id === editId ? fila : t)) : [...l, fila],
    );
    setModal(false);
    setEditId(null);
    setMsg({ ok: true, text: editId ? "Turno actualizado." : "Turno asignado." });
  }

  async function quitar(t: Turno) {
    if (!confirm("¿Quitar este servidor del turno?")) return;
    const res = await eliminarTurno(t.id);
    if (!res.ok) {
      setMsg({ ok: false, text: res.error ?? "No se pudo eliminar." });
      return;
    }
    setTurnos((l) => l.filter((x) => x.id !== t.id));
    if (editId === t.id) cerrar();
  }

  function exportar() {
    const headDias = dias
      .map((d, i) => `<th>${DIAS[i]} ${diaNum(d)}</th>`)
      .join("");
    const rows = equipos
      .map((eq) => {
        const celdas = dias
          .map((d) => {
            const items = enCelda(d, eq.id)
              .map(
                (t) =>
                  `<div class="p">${esc(nombreMiembro(t.miembro_id))}${
                    t.rol_en_equipo
                      ? ` <span class="r">· ${esc(t.rol_en_equipo)}</span>`
                      : ""
                  }</div>`,
              )
              .join("");
            return `<td>${items || "<span class='muted'>—</span>"}</td>`;
          })
          .join("");
        return `<tr><th class="eq">${esc(eq.nombre)}</th>${celdas}</tr>`;
      })
      .join("");
    const cuerpo = `<table>
      <thead><tr><th class="eq">Equipo</th>${headDias}</tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
    const ok = exportarPdf({
      titulo: "Planilla de Turnos",
      encabezado: "Planilla de Turnos y Servidores",
      subtitulo: `Semana del ${rangoSemanaTxt(dias)}`,
      cuerpo,
      estilos: CSS_TURNOS_PDF,
      orientacion: "horizontal",
      ancho: 1400,
      margenMm: 10,
    });
    if (!ok) {
      setMsg({
        ok: false,
        text: "Permite las ventanas emergentes para exportar la planilla.",
      });
    }
  }

  const semanas = useMemo(() => mesGrid(ancla), [ancla]);
  const mesActual = new Date(`${ancla}T00:00:00`).getMonth();
  const tituloMes = `${MESES[mesActual].charAt(0).toUpperCase()}${MESES[mesActual].slice(1)} ${ancla.slice(0, 4)}`;

  return (
    <div>
      <ModuleHeader
        icon={<CalendarIcon className="h-6 w-6" />}
        titulo="Turnos y Servidores"
        descripcion="Coordina los equipos de servicio semana a semana."
        accion={
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={exportar}
              disabled={loading || equipos.length === 0}
            >
              <DownloadIcon className="h-4 w-4" />
              Exportar planilla
            </Button>
            <Button type="button" onClick={() => abrir()}>
              + Nuevo turno
            </Button>
          </div>
        }
      />

      {/* Controles: vista + navegación */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
          {(["semana", "mes"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVista(v)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-colors ${
                vista === v
                  ? "bg-blue-600 text-white"
                  : "text-slate-500 hover:text-blue-700 dark:text-slate-400"
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setAncla((a) => (vista === "semana" ? sumarDias(a, -7) : sumarMeses(a, -1)))
            }
            aria-label="Anterior"
            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-52 text-center text-sm font-bold text-slate-700 dark:text-slate-200">
            {vista === "semana" ? `Semana del ${rangoSemanaTxt(dias)}` : tituloMes}
          </span>
          <button
            type="button"
            onClick={() =>
              setAncla((a) => (vista === "semana" ? sumarDias(a, 7) : sumarMeses(a, 1)))
            }
            aria-label="Siguiente"
            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setAncla(hoyYmd())}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Hoy
          </button>
        </div>
      </div>

      {loading ? (
        <Card>
          <EstadoVacio loading>Cargando turnos…</EstadoVacio>
        </Card>
      ) : equipos.length === 0 ? (
        <Card>
          <EstadoVacio>
            No hay equipos. Créalos con el script SQL (Alabanza, Sonido…).
          </EstadoVacio>
        </Card>
      ) : vista === "semana" ? (
        /* ===== Matriz semanal (equipos × días) ===== */
        <Card className="p-0 sm:p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="sticky left-0 bg-white px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                    Equipo
                  </th>
                  {dias.map((d, i) => (
                    <th
                      key={d}
                      className={`px-3 py-3 text-center text-xs font-bold ${
                        d === hoyYmd()
                          ? "text-blue-700 dark:text-blue-300"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      <div className="uppercase tracking-wider">{DIAS[i]}</div>
                      <div className="text-sm">{diaNum(d)}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {equipos.map((eq) => (
                  <tr
                    key={eq.id}
                    className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                  >
                    <th className="sticky left-0 bg-white px-4 py-3 text-left align-top text-sm font-bold text-slate-800 dark:bg-slate-900 dark:text-slate-200">
                      {eq.nombre}
                    </th>
                    {dias.map((d) => {
                      const items = enCelda(d, eq.id);
                      return (
                        <td
                          key={d}
                          className="border-l border-slate-100 px-2 py-2 align-top dark:border-slate-800"
                        >
                          <div className="space-y-1">
                            {items.map((t) => (
                              <div
                                key={t.id}
                                className="group flex items-center justify-between gap-1 rounded-lg bg-blue-50 px-2 py-1 text-xs dark:bg-blue-950/40"
                              >
                                <button
                                  type="button"
                                  onClick={() => editar(t)}
                                  className="min-w-0 flex-1 truncate text-left font-semibold text-blue-800 dark:text-blue-200"
                                  title={`${nombreMiembro(t.miembro_id)}${t.rol_en_equipo ? " · " + t.rol_en_equipo : ""}`}
                                >
                                  {nombreMiembro(t.miembro_id)}
                                  {t.rol_en_equipo && (
                                    <span className="font-normal text-blue-500/80">
                                      {" "}
                                      · {t.rol_en_equipo}
                                    </span>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => quitar(t)}
                                  aria-label="Quitar"
                                  className="shrink-0 text-blue-400 opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100"
                                >
                                  <CloseIcon className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => abrir(d, eq.id)}
                              className="w-full rounded-lg border border-dashed border-slate-200 py-1 text-xs font-semibold text-slate-400 transition-colors hover:border-blue-300 hover:text-blue-600 dark:border-slate-700"
                            >
                              + Asignar
                            </button>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* ===== Vista mensual (resumen por día) ===== */
        <Card>
          <div className="grid grid-cols-7 gap-1 text-center">
            {DIAS.map((d) => (
              <div
                key={d}
                className="pb-2 text-xs font-bold uppercase tracking-wider text-slate-400"
              >
                {d}
              </div>
            ))}
            {semanas.flat().map((d) => {
              const delMes = new Date(`${d}T00:00:00`).getMonth() === mesActual;
              const n = porDia.get(d) ?? 0;
              const esHoy = d === hoyYmd();
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setAncla(d);
                    setVista("semana");
                  }}
                  className={`flex min-h-16 flex-col items-center justify-start rounded-xl border p-2 text-sm transition-colors ${
                    delMes
                      ? "border-slate-200 hover:border-blue-300 hover:bg-blue-50/60 dark:border-slate-700 dark:hover:bg-slate-800"
                      : "border-transparent text-slate-300 dark:text-slate-600"
                  } ${esHoy ? "ring-2 ring-blue-400" : ""}`}
                >
                  <span
                    className={`font-semibold ${delMes ? "text-slate-700 dark:text-slate-200" : ""}`}
                  >
                    {diaNum(d)}
                  </span>
                  {n > 0 && delMes && (
                    <span className="mt-1 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                      {n} {n === 1 ? "turno" : "turnos"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-center text-xs text-slate-400">
            Haz clic en un día para ver y editar sus turnos en la vista semanal.
          </p>
        </Card>
      )}

      {msg && (
        <div className="mt-4">
          <Alerta ok={msg.ok}>{msg.text}</Alerta>
        </div>
      )}

      {/* Modal crear / editar turno */}
      {modal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Turno"
          className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={cerrar}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:p-7"
            onClick={(ev) => ev.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editId ? "Editar turno" : "Asignar servidor"}
              </h2>
              <button
                type="button"
                onClick={cerrar}
                aria-label="Cerrar"
                className="grid h-9 w-9 place-items-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={guardar} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Fecha">
                  <Input type="date" value={form.fecha} onChange={set("fecha")} />
                </Field>
                <Field label="Equipo">
                  <Select value={form.equipo_id} onChange={set("equipo_id")}>
                    <option value="">— Selecciona —</option>
                    {equipos.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.nombre}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <Field label="Servidor">
                <Select value={form.miembro_id} onChange={set("miembro_id")}>
                  <option value="">— Selecciona un miembro —</option>
                  {directorio.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Rol en el equipo" hint="Opcional · ej: Voz, Cámara, Recepción">
                <Input
                  value={form.rol_en_equipo}
                  onChange={set("rol_en_equipo")}
                  placeholder="Ej: Guitarra / Sonido / Bienvenida"
                />
              </Field>

              <Field label="Notas" hint="Opcional">
                <Textarea
                  value={form.notas}
                  onChange={set("notas")}
                  placeholder="Indicaciones para el turno…"
                />
              </Field>

              {directorio.length === 0 && (
                <Alerta ok={false}>
                  No hay miembros en el directorio. Registra fichas de miembros
                  primero para poder asignarlos.
                </Alerta>
              )}

              {msg && !msg.ok && <Alerta ok={false}>{msg.text}</Alerta>}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={cerrar}
                  disabled={guardando}
                >
                  Cancelar
                </Button>
                <Button type="submit" loading={guardando}>
                  {editId ? "Guardar cambios" : "Asignar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
