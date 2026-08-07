"use client";

import { useEffect, useState, type FormEvent } from "react";
import { getDb } from "./db";
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
  MapPinIcon,
  TrashIcon,
  PencilIcon,
} from "@/app/components/icons";
import {
  crearEvento,
  actualizarEvento,
  eliminarEvento,
} from "./eventos-actions";
import ImageUploader from "./ImageUploader";

type Evento = {
  id: string | number;
  nombre: string;
  descripcion: string | null;
  fecha_evento: string | null;
  hora_inicio: string | null;
  lugar: string | null;
  mapa_url?: string | null;
  categoria?: string | null;
  ministerio?: string | null;
  predicador?: string | null;
  imagen_url?: string | null;
  destacado?: boolean | null;
};

const CATEGORIAS: [string, string][] = [
  ["culto", "Culto"],
  ["administrativo", "Administrativo"],
  ["conferencia", "Conferencia"],
  ["evangelizacion", "Evangelización"],
  ["dorcas", "Dorcas"],
  ["jovenes", "Jóvenes"],
  ["escuela-dominical", "Escuela Dominical"],
  ["coro", "Coro"],
  ["vigilia", "Vigilia"],
  ["campana", "Campaña"],
  ["especial", "Especial"],
];

const VACIO = {
  nombre: "",
  descripcion: "",
  fecha_evento: "",
  hora_inicio: "",
  lugar: "",
  mapa_url: "",
  categoria: "culto",
  ministerio: "",
  predicador: "",
  imagen_url: "",
  destacado: false,
};

/** Extrae "lat,lng" de una URL de Google Maps (o de un texto "lat,lng"). */
function coordsDe(url: string): string | null {
  if (!url) return null;
  const patrones = [
    /@(-?\d+\.\d+),(-?\d+\.\d+)/, // .../@-33.36,-70.72,17z
    /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/, // ?q=-33.36,-70.72
    /[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/, // ?ll=-33.36,-70.72
    /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, // !3d-33.36!4d-70.72
    /^\s*(-?\d+\.\d+),\s*(-?\d+\.\d+)\s*$/, // "lat,lng" pegado directo
  ];
  for (const re of patrones) {
    const m = url.match(re);
    if (m) return `${m[1]},${m[2]}`;
  }
  return null;
}

/**
 * URL embebible para el iframe de previsualización a partir de la dirección
 * escrita. Si el texto son coordenadas ("lat,lng") las usa como pin exacto;
 * si no, hace una búsqueda de la dirección. Vacío → null (estado vacío).
 */
function embedSrc(direccion: string): string | null {
  const q = coordsDe(direccion.trim()) || direccion.trim();
  if (!q) return null;
  return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
}

/** Genera un slug legible: "vigilia-de-oracion-2026-08-29". */
function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function formatoFecha(iso: string | null) {
  if (!iso) return "Sin fecha";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("es-CL", {
    weekday: "short",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function EventosModule() {
  const supabase = getDb();
  const [lista, setLista] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(VACIO);
  const [editId, setEditId] = useState<Evento["id"] | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Vista previa del mapa (con debounce para no recargar el iframe en cada tecla).
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    const id = setTimeout(() => setPreview(embedSrc(form.lugar)), 500);
    return () => clearTimeout(id);
  }, [form.lugar]);

  const set = (k: keyof typeof VACIO) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function cargar() {
    setLoading(true);
    const { data, error } = await supabase
      .from("eventos")
      .select("*")
      .order("fecha_evento", { ascending: false });
    if (!error && data) setLista(data as Evento[]);
    setLoading(false);
  }

  useEffect(() => {
    let vivo = true;
    (async () => {
      const { data, error } = await supabase
        .from("eventos")
        .select("*")
        .order("fecha_evento", { ascending: false });
      if (!vivo) return;
      if (!error && data) setLista(data as Evento[]);
      setLoading(false);
    })();
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.nombre.trim() || !form.fecha_evento) {
      setMsg({ ok: false, text: "El nombre y la fecha son obligatorios." });
      return;
    }
    setSaving(true);
    setMsg(null);
    const slug = `${slugify(form.nombre)}-${form.fecha_evento}`;
    // La escritura pasa por una Server Action: respeta RLS y revalida la web.
    const input = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      fecha_evento: form.fecha_evento,
      hora_inicio: form.hora_inicio,
      lugar: form.lugar,
      mapa_url: form.mapa_url,
      categoria: form.categoria,
      ministerio: form.ministerio,
      predicador: form.predicador,
      imagen_url: form.imagen_url,
      destacado: form.destacado,
      slug,
    };
    const res = editId
      ? await actualizarEvento(editId, input)
      : await crearEvento(input);
    setSaving(false);
    if (!res.ok) {
      setMsg({
        ok: false,
        text:
          res.error ??
          (editId
            ? "No se pudo actualizar el evento."
            : "No se pudo crear el evento."),
      });
      return;
    }
    setMsg({
      ok: true,
      text: editId
        ? "Evento actualizado y web actualizada."
        : "Evento creado y publicado en la web.",
    });
    setForm(VACIO);
    setEditId(null);
    cargar();
  }

  /** Carga un evento en el formulario para editarlo. */
  function editar(ev: Evento) {
    setEditId(ev.id);
    setForm({
      nombre: ev.nombre ?? "",
      descripcion: ev.descripcion ?? "",
      fecha_evento: ev.fecha_evento ?? "",
      hora_inicio: ev.hora_inicio ? ev.hora_inicio.slice(0, 5) : "",
      lugar: ev.lugar ?? "",
      mapa_url: ev.mapa_url ?? "",
      categoria: ev.categoria ?? "culto",
      ministerio: ev.ministerio ?? "",
      predicador: ev.predicador ?? "",
      imagen_url: ev.imagen_url ?? "",
      destacado: Boolean(ev.destacado),
    });
    setMsg(null);
    // Lleva la vista al formulario (útil en móvil, donde va arriba).
    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /** Cancela la edición y limpia el formulario. */
  function cancelarEdicion() {
    setEditId(null);
    setForm(VACIO);
    setMsg(null);
  }

  async function eliminar(id: Evento["id"]) {
    if (!confirm("¿Eliminar este evento?")) return;
    // Borrado en la base de datos + revalidación de la web pública.
    const res = await eliminarEvento(id);
    if (!res.ok) {
      setMsg({ ok: false, text: res.error ?? "No se pudo eliminar el evento." });
      return;
    }
    setLista((l) => l.filter((ev) => ev.id !== id));
    if (editId === id) cancelarEdicion();
    setMsg({ ok: true, text: "Evento eliminado y web actualizada." });
  }

  return (
    <div>
      <ModuleHeader
        icon={<CalendarIcon className="h-6 w-6" />}
        titulo="Eventos y Cultos"
        descripcion="Gestiona el calendario de actividades de la iglesia."
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
        {/* Formulario */}
        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {editId ? "Editar evento" : "Nuevo evento"}
            </h2>
            {editId && (
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                Editando
              </span>
            )}
          </div>
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <Field label="Nombre del evento">
              <Input
                value={form.nombre}
                onChange={set("nombre")}
                placeholder="Ej: Vigilia de oración"
              />
            </Field>
            <Field label="Descripción">
              <Textarea
                value={form.descripcion}
                onChange={set("descripcion")}
                placeholder="Detalles del evento..."
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Fecha">
                <Input
                  type="date"
                  value={form.fecha_evento}
                  onChange={set("fecha_evento")}
                />
              </Field>
              <Field label="Hora de inicio">
                <Input
                  type="time"
                  value={form.hora_inicio}
                  onChange={set("hora_inicio")}
                />
              </Field>
            </div>
            <Field
              label="Lugar / Dirección"
              hint="Se usa para el botón «Cómo llegar» y la vista previa del mapa"
            >
              <Input
                value={form.lugar}
                onChange={set("lugar")}
                placeholder="Ej: Av. Principal 1234, Quilicura"
              />
            </Field>

            {/* Previsualización en vivo del mapa */}
            <div>
              <p className="mb-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Vista previa de la ubicación
              </p>
              {preview ? (
                <iframe
                  key={preview}
                  title="Vista previa de la ubicación del evento"
                  src={preview}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-56 w-full rounded-xl border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-4 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400">
                  <MapPinIcon className="h-6 w-6 text-slate-400" />
                  Escribe una dirección o pega un enlace para ver el mapa aquí.
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Categoría">
                <Select value={form.categoria} onChange={set("categoria")}>
                  {CATEGORIAS.map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Ministerio organizador">
                <Input
                  value={form.ministerio}
                  onChange={set("ministerio")}
                  placeholder="Ej: Cuerpo Ministerial"
                />
              </Field>
            </div>

            <Field label="Predicador / invitado" hint="Opcional">
              <Input
                value={form.predicador}
                onChange={set("predicador")}
                placeholder="Ej: Obispo Juan Acosta"
              />
            </Field>

            <ImageUploader
              label="Afiche del evento"
              hint="Opcional · se sube a la carpeta Mieles/eventos y se optimiza"
              folder="Mieles/eventos"
              value={form.imagen_url}
              onChange={(url) => setForm((f) => ({ ...f, imagen_url: url }))}
            />

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <input
                type="checkbox"
                checked={form.destacado}
                onChange={(e) =>
                  setForm((f) => ({ ...f, destacado: e.target.checked }))
                }
                className="h-4 w-4 accent-blue-600"
              />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Evento destacado (aparece en el Hero)
              </span>
            </label>

            {msg && <Alerta ok={msg.ok}>{msg.text}</Alerta>}

            <div className="flex justify-end gap-3">
              {editId && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={cancelarEdicion}
                  disabled={saving}
                >
                  Cancelar
                </Button>
              )}
              <Button type="submit" loading={saving}>
                {editId ? "Guardar cambios" : "Crear evento"}
              </Button>
            </div>
          </form>
        </Card>

        {/* Lista */}
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Eventos</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {lista.length}
            </span>
          </div>

          <div className="mt-5">
            {loading ? (
              <EstadoVacio loading>Cargando eventos…</EstadoVacio>
            ) : lista.length === 0 ? (
              <EstadoVacio>Aún no hay eventos.</EstadoVacio>
            ) : (
              <ul className="space-y-3">
                {lista.map((ev) => (
                  <li
                    key={ev.id}
                    className={`flex items-start justify-between gap-4 rounded-2xl border p-4 transition-colors ${
                      editId === ev.id
                        ? "border-blue-300 bg-blue-50/60 dark:border-blue-800 dark:bg-blue-950/30"
                        : "border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white">{ev.nombre}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-blue-700">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        {formatoFecha(ev.fecha_evento)}
                        {ev.hora_inicio && ` · ${ev.hora_inicio.slice(0, 5)} hrs`}
                      </p>
                      {ev.lugar && (
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                          <MapPinIcon className="h-3.5 w-3.5" />
                          {ev.lugar}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => editar(ev)}
                        aria-label="Editar"
                        className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                      >
                        <PencilIcon className="h-4.5 w-4.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => eliminar(ev.id)}
                        aria-label="Eliminar"
                        className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <TrashIcon className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
