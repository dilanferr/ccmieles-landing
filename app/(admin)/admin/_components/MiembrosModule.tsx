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
  IdCardIcon,
  PencilIcon,
  TrashIcon,
  CloseIcon,
  DownloadIcon,
  SearchIcon,
} from "@/app/components/icons";
import { getDb } from "./db";
import { esc, exportarPdf } from "@/src/utils/exportPdf";
import FirmaCanvas from "./FirmaCanvas";
import {
  crearMiembro,
  actualizarMiembro,
  eliminarMiembro,
} from "./miembros-actions";

type Miembro = {
  id: string;
  nombre_completo: string;
  rut: string;
  telefono: string;
  correo: string;
  direccion: string;
  fecha_nacimiento: string;
  salud: string;
  tipo_sangre: string;
  contacto_emergencia_nombre: string;
  contacto_emergencia_telefono: string;
  firma: string;
};

type FilaDB = {
  id: string;
  nombre_completo: string;
  rut: string | null;
  telefono: string | null;
  correo: string | null;
  direccion: string | null;
  fecha_nacimiento: string | null;
  salud: string | null;
  tipo_sangre: string | null;
  contacto_emergencia_nombre: string | null;
  contacto_emergencia_telefono: string | null;
  firma: string | null;
};

const COLS =
  "id, nombre_completo, rut, telefono, correo, direccion, fecha_nacimiento, salud, tipo_sangre, contacto_emergencia_nombre, contacto_emergencia_telefono, firma, creado_at";

const TIPOS_SANGRE = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const VACIO = {
  nombre_completo: "",
  rut: "",
  telefono: "",
  correo: "",
  direccion: "",
  fecha_nacimiento: "",
  salud: "",
  tipo_sangre: "",
  contacto_emergencia_nombre: "",
  contacto_emergencia_telefono: "",
  firma: "",
};

function desdeDB(r: FilaDB): Miembro {
  return {
    id: String(r.id),
    nombre_completo: r.nombre_completo,
    rut: r.rut ?? "",
    telefono: r.telefono ?? "",
    correo: r.correo ?? "",
    direccion: r.direccion ?? "",
    fecha_nacimiento: r.fecha_nacimiento ?? "",
    salud: r.salud ?? "",
    tipo_sangre: r.tipo_sangre ?? "",
    contacto_emergencia_nombre: r.contacto_emergencia_nombre ?? "",
    contacto_emergencia_telefono: r.contacto_emergencia_telefono ?? "",
    firma: r.firma ?? "",
  };
}

/* ---------- helpers ---------- */

function soloDigitos(t: string) {
  return (t || "").replace(/\D/g, "");
}
/** Enlace de WhatsApp (asume Chile: antepone 56 si falta). */
function waLink(tel: string) {
  let d = soloDigitos(tel);
  if (!d) return "";
  if (!d.startsWith("56")) d = "56" + d;
  return `https://wa.me/${d}`;
}
function fmtFecha(iso: string) {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
function edad(iso: string): number | null {
  if (!iso) return null;
  const b = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(b.getTime())) return null;
  const n = new Date();
  let a = n.getFullYear() - b.getFullYear();
  const m = n.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && n.getDate() < b.getDate())) a--;
  return a >= 0 && a < 130 ? a : null;
}
/** CSS específico de la ficha (el esqueleto lo aporta exportPdf). */
const CSS_MIEMBROS_PDF = `
  h2{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#1e3a8a;margin:24px 0 8px;border-bottom:1px solid #e2e8f0;padding-bottom:5px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:6px 28px}
  .row{padding:6px 0;border-bottom:1px dashed #eef2f7}
  .lbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#94a3b8}
  .val{font-size:14px;font-weight:600;margin-top:1px}
  .firma{max-height:120px;border:1px solid #e2e8f0;border-radius:10px;padding:6px;background:#fff}
  .firmaBox{margin-top:8px}
`;

export default function MiembrosModule() {
  const supabase = getDb();
  const [lista, setLista] = useState<Miembro[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
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
      const { data, error } = await supabase
        .from("miembros_iglesia")
        .select(COLS)
        .is("eliminado_at", null)
        .order("nombre_completo", { ascending: true });
      if (!activo) return;
      if (!error && data) setLista((data as FilaDB[]).map(desdeDB));
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

  const filtradas = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return lista;
    return lista.filter(
      (m) =>
        m.nombre_completo.toLowerCase().includes(t) ||
        m.rut.toLowerCase().includes(t),
    );
  }, [lista, q]);

  function abrir() {
    setForm(VACIO);
    setEditId(null);
    setMsg(null);
    setModal(true);
  }

  function editar(m: Miembro) {
    const { id, ...resto } = m;
    void id;
    setForm(resto);
    setEditId(m.id);
    setMsg(null);
    setModal(true);
  }

  async function guardar(e: FormEvent) {
    e.preventDefault();
    if (!form.nombre_completo.trim()) {
      setMsg({ ok: false, text: "El nombre completo es obligatorio." });
      return;
    }
    setGuardando(true);
    const input = {
      nombre_completo: form.nombre_completo,
      rut: form.rut || null,
      telefono: form.telefono || null,
      correo: form.correo || null,
      direccion: form.direccion || null,
      fecha_nacimiento: form.fecha_nacimiento || null,
      salud: form.salud || null,
      tipo_sangre: form.tipo_sangre || null,
      contacto_emergencia_nombre: form.contacto_emergencia_nombre || null,
      contacto_emergencia_telefono: form.contacto_emergencia_telefono || null,
      firma: form.firma || null,
    };
    const res = editId
      ? await actualizarMiembro(editId, input)
      : await crearMiembro(input);
    setGuardando(false);
    if (!res.ok || !res.data) {
      setMsg({
        ok: false,
        text:
          res.error ??
          (editId ? "No se pudo actualizar la ficha." : "No se pudo crear la ficha."),
      });
      return;
    }
    const fila = desdeDB(res.data as FilaDB);
    setLista((l) =>
      editId ? l.map((m) => (m.id === editId ? fila : m)) : [...l, fila],
    );
    setModal(false);
    setEditId(null);
    setMsg({
      ok: true,
      text: editId ? "Ficha actualizada." : "Ficha creada correctamente.",
    });
  }

  async function quitar(m: Miembro) {
    if (
      !confirm(`¿Eliminar la ficha de ${m.nombre_completo}? Esta acción no se puede deshacer.`)
    )
      return;
    const res = await eliminarMiembro(m.id);
    if (!res.ok) {
      setMsg({ ok: false, text: res.error ?? "No se pudo eliminar la ficha." });
      return;
    }
    setLista((l) => l.filter((x) => x.id !== m.id));
    if (editId === m.id) cerrar();
    setMsg({ ok: true, text: "Ficha eliminada." });
  }

  function exportar(m: Miembro) {
    const e = edad(m.fecha_nacimiento);
    const nac = m.fecha_nacimiento
      ? `${fmtFecha(m.fecha_nacimiento)}${e != null ? ` · ${e} años` : ""}`
      : "—";
    const row = (label: string, val: string) =>
      `<div class="row"><div class="lbl">${esc(label)}</div><div class="val">${
        val ? esc(val) : "<span class='muted'>—</span>"
      }</div></div>`;
    const firma = m.firma?.startsWith("data:image")
      ? `<img class="firma" src="${m.firma}" alt="Firma" />`
      : `<div class="muted" style="padding:24px 0">Sin firma registrada</div>`;
    const cuerpo = `<h2>Datos personales y de contacto</h2>
    <div class="grid">
      ${row("Nombre completo", m.nombre_completo)}
      ${row("RUT", m.rut)}
      ${row("Teléfono", m.telefono)}
      ${row("Correo electrónico", m.correo)}
      ${row("Fecha de nacimiento / Edad", nac)}
      ${row("Dirección", m.direccion)}
    </div>
    <h2>Ficha médica y de emergencia</h2>
    <div class="grid">
      ${row("Tipo de sangre", m.tipo_sangre)}
      ${row("Contacto de emergencia", m.contacto_emergencia_nombre)}
      ${row("Teléfono de emergencia", m.contacto_emergencia_telefono)}
    </div>
    ${row("Observaciones de salud (alergias, condiciones, medicamentos)", m.salud)}
    <h2>Conformidad</h2>
    <p style="font-size:12px;color:#475569;line-height:1.5">
      El firmante declara que los datos entregados son verídicos y autoriza su
      registro para fines pastorales y de contacto de la iglesia.
    </p>
    <div class="firmaBox">${firma}</div>`;
    const ok = exportarPdf({
      titulo: `Ficha · ${m.nombre_completo}`,
      encabezado: "Ficha de Miembro",
      subtitulo: "Registro Pastoral · Documento confidencial",
      cuerpo,
      estilos: CSS_MIEMBROS_PDF,
      ancho: 780,
      margenMm: 14,
    });
    if (!ok) {
      setMsg({
        ok: false,
        text: "Permite las ventanas emergentes para exportar la ficha.",
      });
    }
  }

  return (
    <div>
      <ModuleHeader
        icon={<IdCardIcon className="h-6 w-6" />}
        titulo="Fichas de Miembros"
        descripcion="Registro pastoral confidencial: datos personales, médicos y firma."
        accion={
          <Button type="button" onClick={abrir}>
            + Nueva ficha
          </Button>
        }
      />

      {/* Buscador */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-64 flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre o RUT…"
            className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          {filtradas.length}{" "}
          {filtradas.length === 1 ? "ficha" : "fichas"}
        </span>
      </div>

      <Card className="p-0 sm:p-0">
        {loading ? (
          <div className="p-6">
            <EstadoVacio loading>Cargando fichas…</EstadoVacio>
          </div>
        ) : filtradas.length === 0 ? (
          <div className="p-6">
            <EstadoVacio>
              {q
                ? "No hay fichas que coincidan con la búsqueda."
                : "Aún no hay fichas registradas. Crea la primera."}
            </EstadoVacio>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="px-5 py-3">Nombre</th>
                  <th className="px-5 py-3">RUT</th>
                  <th className="px-5 py-3">Teléfono</th>
                  <th className="px-5 py-3">Edad</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map((m) => {
                  const e = edad(m.fecha_nacimiento);
                  const wa = waLink(m.telefono);
                  return (
                    <tr
                      key={m.id}
                      className={`border-b border-slate-100 transition-colors last:border-0 dark:border-slate-800 ${
                        editId === m.id
                          ? "bg-blue-50/70 dark:bg-blue-950/30"
                          : "hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {m.nombre_completo}
                        </p>
                        {m.tipo_sangre && (
                          <span className="mt-0.5 inline-block rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-600 dark:bg-red-950/40 dark:text-red-300">
                            {m.tipo_sangre}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                        {m.rut || "—"}
                      </td>
                      <td className="px-5 py-4">
                        {m.telefono ? (
                          <a
                            href={wa}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                            title="Abrir WhatsApp"
                          >
                            {m.telefono}
                          </a>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                        {e != null ? `${e} años` : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => editar(m)}
                            aria-label={`Ver / editar ficha de ${m.nombre_completo}`}
                            className="inline-grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                          >
                            <PencilIcon className="h-4.5 w-4.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => exportar(m)}
                            aria-label={`Exportar ficha de ${m.nombre_completo}`}
                            className="inline-grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                          >
                            <DownloadIcon className="h-4.5 w-4.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => quitar(m)}
                            aria-label={`Eliminar ficha de ${m.nombre_completo}`}
                            className="inline-grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          >
                            <TrashIcon className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      {/* Modal: crear / editar ficha */}
      {modal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Ficha de miembro"
          className="fixed inset-0 z-50 grid place-items-start justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm sm:place-items-center"
          onClick={cerrar}
        >
          <div
            className="my-4 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:p-7"
            onClick={(ev) => ev.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editId ? "Ver / editar ficha" : "Nueva ficha de miembro"}
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

            <form onSubmit={guardar} className="mt-5 space-y-6">
              {/* Datos personales */}
              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                  Datos personales y de contacto
                </p>
                <Field label="Nombre completo">
                  <Input
                    value={form.nombre_completo}
                    onChange={set("nombre_completo")}
                    placeholder="Ej: Juan Pérez González"
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="RUT">
                    <Input
                      value={form.rut}
                      onChange={set("rut")}
                      placeholder="12.345.678-9"
                    />
                  </Field>
                  <Field label="Fecha de nacimiento">
                    <Input
                      type="date"
                      value={form.fecha_nacimiento}
                      onChange={set("fecha_nacimiento")}
                    />
                  </Field>
                  <Field label="Teléfono" hint="Se enlaza a WhatsApp">
                    <Input
                      value={form.telefono}
                      onChange={set("telefono")}
                      placeholder="9 1234 5678"
                    />
                  </Field>
                  <Field label="Correo electrónico">
                    <Input
                      type="email"
                      value={form.correo}
                      onChange={set("correo")}
                      placeholder="correo@ejemplo.cl"
                    />
                  </Field>
                </div>
                <Field label="Dirección">
                  <Input
                    value={form.direccion}
                    onChange={set("direccion")}
                    placeholder="Calle, número, comuna"
                  />
                </Field>
              </div>

              {/* Ficha médica */}
              <div className="space-y-4 border-t border-slate-100 pt-5 dark:border-slate-800">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                  Ficha médica y de emergencia
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Tipo de sangre">
                    <Select value={form.tipo_sangre} onChange={set("tipo_sangre")}>
                      <option value="">— Selecciona —</option>
                      {TIPOS_SANGRE.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <div />
                  <Field label="Contacto de emergencia (nombre)">
                    <Input
                      value={form.contacto_emergencia_nombre}
                      onChange={set("contacto_emergencia_nombre")}
                      placeholder="Ej: María Pérez (hermana)"
                    />
                  </Field>
                  <Field label="Teléfono de emergencia">
                    <Input
                      value={form.contacto_emergencia_telefono}
                      onChange={set("contacto_emergencia_telefono")}
                      placeholder="9 8765 4321"
                    />
                  </Field>
                </div>
                <Field
                  label="Observaciones de salud"
                  hint="Alergias, condiciones crónicas, medicamentos…"
                >
                  <Textarea
                    value={form.salud}
                    onChange={set("salud")}
                    placeholder="Ej: Alérgico a la penicilina. Hipertensión controlada."
                  />
                </Field>
              </div>

              {/* Firma */}
              <div className="space-y-3 border-t border-slate-100 pt-5 dark:border-slate-800">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                  Firma de conformidad
                </p>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  Al firmar, el hermano confirma que los datos ingresados son
                  verídicos y autoriza su registro para fines pastorales.
                </p>
                <FirmaCanvas
                  value={form.firma}
                  onChange={(url) => setForm((f) => ({ ...f, firma: url }))}
                />
              </div>

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
                  {editId ? "Guardar cambios" : "Crear ficha"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
