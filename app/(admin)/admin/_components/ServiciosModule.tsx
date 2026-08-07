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
  Select,
  Button,
  Alerta,
  EstadoVacio,
  ModuleHeader,
} from "./ui";
import {
  CalendarIcon,
  TrashIcon,
  CloseIcon,
  PencilIcon,
  DownloadIcon,
} from "@/app/components/icons";
import { getDb } from "./db";
import { esc, exportarPdf } from "@/src/utils/exportPdf";
import {
  crearServicio,
  actualizarServicio,
  eliminarServicio,
} from "./servicios-actions";

/** Una fila de la matriz de servicios semanales (fecha/hora/encargado vacíos = null). */
type Servicio = {
  id: string;
  dia: string;
  fecha: string;
  hora: string;
  actividad: string;
  encargado: string;
};

const DIAS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
] as const;

/** Color del "pill" del día para leer la matriz de un vistazo. */
const DIA_COLOR: Record<string, string> = {
  Domingo: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  Lunes: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  Martes: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  Miércoles: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  Jueves: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  Viernes:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  Sábado:
    "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
};

const VACIO = { dia: "Domingo", fecha: "", hora: "", actividad: "", encargado: "" };

function fmtFecha(iso: string) {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Normaliza una fila de Supabase (con nulls) a la forma que usa la UI. */
type FilaDB = {
  id: string;
  dia: string;
  fecha: string | null;
  hora: string | null;
  actividad: string;
  encargado: string | null;
};
function desdeDB(r: FilaDB): Servicio {
  return {
    id: String(r.id),
    dia: r.dia,
    fecha: r.fecha ?? "",
    hora: r.hora ?? "",
    actividad: r.actividad,
    encargado: r.encargado ?? "",
  };
}

/* ================= Exportación de la pauta (ventana de impresión) ================= */

/** Escapa texto para insertarlo de forma segura en el HTML de impresión. */
const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const dd = (n: number) => String(n).padStart(2, "0");

/** Rango de la semana actual (Lunes → Domingo), ej: "Semana del Lunes 03 al Domingo 09 de Agosto, 2026". */
function rangoSemana(): string {
  const hoy = new Date();
  const dow = hoy.getDay(); // 0 Dom … 6 Sáb
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() + (dow === 0 ? -6 : 1 - dow));
  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);

  const d1 = dd(lunes.getDate());
  const d2 = dd(domingo.getDate());
  const m1 = MESES[lunes.getMonth()];
  const m2 = MESES[domingo.getMonth()];
  const anio = domingo.getFullYear();

  return m1 === m2
    ? `Semana del Lunes ${d1} al Domingo ${d2} de ${cap(m2)}, ${anio}`
    : `Semana del Lunes ${d1} de ${cap(m1)} al Domingo ${d2} de ${cap(m2)}, ${anio}`;
}

/** CSS específico de la pauta (el esqueleto lo aporta exportPdf). */
const CSS_SERVICIOS_PDF = `
  table{width:100%;border-collapse:collapse;margin-top:26px;font-size:13px}
  thead th{background:#1e3a8a;color:#fff;text-align:left;padding:11px 14px;font-size:11px;text-transform:uppercase;letter-spacing:.05em}
  thead th:first-child{border-radius:8px 0 0 0}
  thead th:last-child{border-radius:0 8px 0 0}
  tbody td{padding:12px 14px;border-bottom:1px solid #e2e8f0}
  tbody tr:nth-child(even){background:#f8fafc}
  .pill{display:inline-block;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700;background:#eff6ff;color:#1d4ed8}
  .act{font-weight:700}
`;

export default function ServiciosModule() {
  const supabase = getDb();
  const [filas, setFilas] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Carga inicial desde Supabase (los setState ocurren tras el await → sin
  // "setState síncrono en efecto"; RLS deja leer solo al admin autenticado).
  useEffect(() => {
    let activo = true;
    (async () => {
      const { data, error } = await supabase
        .from("servicios_semanales")
        .select("id, dia, fecha, hora, actividad, encargado")
        .order("creado_at", { ascending: true });
      if (!activo) return;
      if (!error && data) setFilas((data as FilaDB[]).map(desdeDB));
      setLoading(false);
    })();
    return () => {
      activo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Orden de lectura tipo "matriz semanal": por día (Dom→Sáb) y luego por hora.
  const ordenadas = useMemo(
    () =>
      [...filas].sort((a, b) => {
        const d =
          DIAS.indexOf(a.dia as (typeof DIAS)[number]) -
          DIAS.indexOf(b.dia as (typeof DIAS)[number]);
        return d !== 0 ? d : a.hora.localeCompare(b.hora);
      }),
    [filas],
  );

  // Cierra el modal con Escape y bloquea el scroll de fondo.
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

  /** Abre el modal en blanco para crear. */
  function abrir() {
    setForm(VACIO);
    setEditId(null);
    setMsg(null);
    setModal(true);
  }

  /** Abre el modal precargado con una fila para editar. */
  function editar(s: Servicio) {
    setForm({
      dia: s.dia,
      fecha: s.fecha,
      hora: s.hora,
      actividad: s.actividad,
      encargado: s.encargado,
    });
    setEditId(s.id);
    setMsg(null);
    setModal(true);
  }

  async function guardar(e: FormEvent) {
    e.preventDefault();
    if (!form.actividad.trim()) {
      setMsg({ ok: false, text: "La actividad / servicio es obligatoria." });
      return;
    }
    setGuardando(true);
    const input = {
      dia: form.dia,
      fecha: form.fecha || null,
      hora: form.hora || null,
      actividad: form.actividad,
      encargado: form.encargado || null,
    };
    const res = editId
      ? await actualizarServicio(editId, input)
      : await crearServicio(input);
    setGuardando(false);
    if (!res.ok || !res.data) {
      setMsg({
        ok: false,
        text:
          res.error ??
          (editId
            ? "No se pudo actualizar el servicio."
            : "No se pudo agregar el servicio."),
      });
      return;
    }
    const fila = desdeDB(res.data as FilaDB);
    setFilas((f) =>
      editId ? f.map((s) => (s.id === editId ? fila : s)) : [...f, fila],
    );
    setModal(false);
    setMsg({
      ok: true,
      text: editId
        ? "Servicio actualizado en la matriz."
        : "Servicio agregado a la matriz.",
    });
    setEditId(null);
  }

  async function quitar(id: string) {
    if (!confirm("¿Quitar este servicio de la matriz?")) return;
    const res = await eliminarServicio(id);
    if (!res.ok) {
      setMsg({ ok: false, text: res.error ?? "No se pudo eliminar el servicio." });
      return;
    }
    setFilas((f) => f.filter((s) => s.id !== id));
    if (editId === id) cerrar();
    setMsg({ ok: true, text: "Servicio eliminado de la matriz." });
  }

  /** Abre una ventana con la pauta lista para imprimir o guardar como PDF. */
  function exportarPauta() {
    const filaMuted = '<span style="color:#94a3b8">—</span>';
    const rows = ordenadas
      .map((s) => {
        const fecha = s.fecha ? esc(fmtFecha(s.fecha)) : filaMuted;
        const hora = s.hora ? esc(s.hora) : filaMuted;
        const enc = s.encargado
          ? esc(s.encargado)
          : '<span style="color:#94a3b8">Sin asignar</span>';
        return `<tr>
          <td><span class="pill">${esc(s.dia)}</span></td>
          <td>${fecha}</td>
          <td>${hora}</td>
          <td class="act">${esc(s.actividad)}</td>
          <td>${enc}</td>
        </tr>`;
      })
      .join("");
    const cuerpo = `<table>
      <thead><tr>
        <th>Día</th><th>Fecha</th><th>Hora</th><th>Actividad / Servicio</th><th>Encargado</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
    const ok = exportarPdf({
      titulo: "Pauta de Servicios",
      encabezado: "Pauta de Servicios de la Semana",
      subtitulo: rangoSemana(),
      cuerpo,
      estilos: CSS_SERVICIOS_PDF,
      ancho: 820,
      margenMm: 14,
    });
    if (!ok) {
      setMsg({
        ok: false,
        text: "Permite las ventanas emergentes para exportar la pauta.",
      });
    }
  }

  return (
    <div>
      <ModuleHeader
        icon={<CalendarIcon className="h-6 w-6" />}
        titulo="Servicios de la Semana"
        descripcion="Coordina las actividades de la iglesia en una matriz compartida."
        accion={
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={exportarPauta}
              disabled={loading || ordenadas.length === 0}
            >
              <DownloadIcon className="h-4 w-4" />
              Exportar Pauta
            </Button>
            <Button type="button" onClick={abrir}>
              + Agregar Día / Servicio
            </Button>
          </div>
        }
      />

      <Card className="p-0 sm:p-0">
        {loading ? (
          <div className="p-6">
            <EstadoVacio loading>Cargando servicios…</EstadoVacio>
          </div>
        ) : ordenadas.length === 0 ? (
          <div className="p-6">
            <EstadoVacio>
              Aún no hay servicios en la matriz. Agrega el primero.
            </EstadoVacio>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="px-5 py-3">Día</th>
                  <th className="px-5 py-3">Fecha</th>
                  <th className="px-5 py-3">Hora</th>
                  <th className="px-5 py-3">Actividad / Servicio</th>
                  <th className="px-5 py-3">Encargado</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ordenadas.map((s) => (
                  <tr
                    key={s.id}
                    className={`border-b border-slate-100 transition-colors last:border-0 dark:border-slate-800 ${
                      editId === s.id
                        ? "bg-blue-50/70 dark:bg-blue-950/30"
                        : "hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                          DIA_COLOR[s.dia] ?? "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {s.dia}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                      {fmtFecha(s.fecha)}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-700 dark:text-slate-300">
                      {s.hora || "—"}
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">
                      {s.actividad}
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {s.encargado || (
                        <span className="text-slate-400">Sin asignar</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => editar(s)}
                          aria-label={`Editar ${s.actividad}`}
                          className="inline-grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                        >
                          <PencilIcon className="h-4.5 w-4.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => quitar(s.id)}
                          aria-label={`Quitar ${s.actividad}`}
                          className="inline-grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <TrashIcon className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {msg && (
        <div className="mt-4">
          <Alerta ok={msg.ok}>{msg.text}</Alerta>
        </div>
      )}

      {!loading && (
        <p className="mt-4 text-xs text-slate-400">
          {ordenadas.length}{" "}
          {ordenadas.length === 1 ? "servicio" : "servicios"} en la matriz
          semanal.
        </p>
      )}

      {/* Modal: agregar día / servicio */}
      {modal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Agregar día o servicio"
          className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={cerrar}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editId ? "Editar servicio" : "Agregar Día / Servicio"}
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
                <Field label="Día">
                  <Select value={form.dia} onChange={set("dia")}>
                    {DIAS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Fecha" hint="Opcional">
                  <Input
                    type="date"
                    value={form.fecha}
                    onChange={set("fecha")}
                  />
                </Field>
              </div>

              <Field label="Hora" hint="Opcional">
                <Input type="time" value={form.hora} onChange={set("hora")} />
              </Field>

              <Field label="Actividad / Servicio">
                <Input
                  value={form.actividad}
                  onChange={set("actividad")}
                  placeholder="Ej: Culto Dominical, Ensayo de Alabanza"
                />
              </Field>

              <Field label="Usuario / Equipo a cargo" hint="Opcional">
                <Input
                  value={form.encargado}
                  onChange={set("encargado")}
                  placeholder="Ej: Diác. Gabriel Acosta / Equipo de Alabanza"
                />
              </Field>

              {msg && !msg.ok && <Alerta ok={false}>{msg.text}</Alerta>}

              <div className="flex justify-end gap-3 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={cerrar}
                  disabled={guardando}
                >
                  Cancelar
                </Button>
                <Button type="submit" loading={guardando}>
                  {editId ? "Guardar cambios" : "Agregar a la matriz"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
