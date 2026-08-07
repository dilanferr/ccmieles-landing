"use client";

import { useEffect, useState, type FormEvent } from "react";
import { getDb } from "./db";
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
import { UsersIcon, TrashIcon, PencilIcon } from "@/app/components/icons";
import {
  crearClasificado,
  actualizarClasificado,
  eliminarClasificado,
} from "./clasificados-actions";

type Clasificado = {
  id: string | number;
  categoria: string;
  titulo: string;
  descripcion: string;
  autor: string;
  creado_at?: string | null;
};

const VACIO = {
  categoria: "",
  titulo: "",
  descripcion: "",
  autor: "",
};

export default function ClasificadosModule() {
  const supabase = getDb();
  const [lista, setLista] = useState<Clasificado[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(VACIO);
  const [editId, setEditId] = useState<Clasificado["id"] | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const set = (k: keyof typeof VACIO) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function cargar() {
    setLoading(true);
    const { data, error } = await supabase
      .from("clasificados")
      .select("*")
      .order("creado_at", { ascending: false });
    if (!error && data) setLista(data as Clasificado[]);
    setLoading(false);
  }

  useEffect(() => {
    let vivo = true;
    (async () => {
      const { data, error } = await supabase
        .from("clasificados")
        .select("*")
        .order("creado_at", { ascending: false });
      if (!vivo) return;
      if (!error && data) setLista(data as Clasificado[]);
      setLoading(false);
    })();
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (
      !form.categoria.trim() ||
      !form.titulo.trim() ||
      !form.descripcion.trim() ||
      !form.autor.trim()
    ) {
      setMsg({ ok: false, text: "Todos los campos son obligatorios." });
      return;
    }
    setSaving(true);
    setMsg(null);
    const res = editId
      ? await actualizarClasificado(editId, form)
      : await crearClasificado(form);
    setSaving(false);
    if (!res.ok) {
      setMsg({
        ok: false,
        text:
          res.error ??
          (editId ? "No se pudo actualizar el aviso." : "No se pudo crear el aviso."),
      });
      return;
    }
    setMsg({
      ok: true,
      text: editId
        ? "Aviso actualizado y diario mural actualizado."
        : "Aviso publicado en el diario mural.",
    });
    setForm(VACIO);
    setEditId(null);
    cargar();
  }

  /** Carga un aviso en el formulario para editarlo. */
  function editar(c: Clasificado) {
    setEditId(c.id);
    setForm({
      categoria: c.categoria ?? "",
      titulo: c.titulo ?? "",
      descripcion: c.descripcion ?? "",
      autor: c.autor ?? "",
    });
    setMsg(null);
    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /** Cancela la edición y limpia el formulario. */
  function cancelarEdicion() {
    setEditId(null);
    setForm(VACIO);
    setMsg(null);
  }

  async function eliminar(id: Clasificado["id"]) {
    if (!confirm("¿Eliminar este aviso?")) return;
    const res = await eliminarClasificado(id);
    if (!res.ok) {
      setMsg({ ok: false, text: res.error ?? "No se pudo eliminar el aviso." });
      return;
    }
    setLista((l) => l.filter((c) => c.id !== id));
    if (editId === id) cancelarEdicion();
    setMsg({ ok: true, text: "Aviso eliminado y diario mural actualizado." });
  }

  return (
    <div>
      <ModuleHeader
        icon={<UsersIcon className="h-6 w-6" />}
        titulo="Comunidad · Diario Mural"
        descripcion="Publica los avisos clasificados de servicios y oficios de los hermanos."
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
        {/* Formulario */}
        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {editId ? "Editar aviso" : "Nuevo aviso"}
            </h2>
            {editId && (
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                Editando
              </span>
            )}
          </div>
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <Field label="Categoría / Oficio">
              <Input
                value={form.categoria}
                onChange={set("categoria")}
                placeholder="Ej: Gasfitería, Electricidad, Costura…"
              />
            </Field>
            <Field label="Título del servicio">
              <Input
                value={form.titulo}
                onChange={set("titulo")}
                placeholder="Ej: Reparaciones e instalaciones a domicilio"
              />
            </Field>
            <Field label="Descripción">
              <Textarea
                value={form.descripcion}
                onChange={set("descripcion")}
                placeholder="Detalles del servicio que se ofrece…"
              />
            </Field>
            <Field label="Nombre del hermano">
              <Input
                value={form.autor}
                onChange={set("autor")}
                placeholder="Ej: Hno. Juan Pérez"
              />
            </Field>

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
                {editId ? "Guardar cambios" : "Publicar aviso"}
              </Button>
            </div>
          </form>
        </Card>

        {/* Lista */}
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Avisos activos
            </h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {lista.length}
            </span>
          </div>

          <div className="mt-5">
            {loading ? (
              <EstadoVacio loading>Cargando avisos…</EstadoVacio>
            ) : lista.length === 0 ? (
              <EstadoVacio>Aún no hay avisos publicados.</EstadoVacio>
            ) : (
              <ul className="space-y-3">
                {lista.map((c) => (
                  <li
                    key={c.id}
                    className={`flex items-start justify-between gap-4 rounded-2xl border p-4 transition-colors ${
                      editId === c.id
                        ? "border-blue-300 bg-blue-50/60 dark:border-blue-800 dark:bg-blue-950/30"
                        : "border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="inline-block rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-slate-800 dark:text-blue-300">
                        {c.categoria}
                      </span>
                      <p className="mt-1.5 font-semibold text-slate-900 dark:text-white">
                        {c.titulo}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                        {c.descripcion}
                      </p>
                      <p className="mt-1.5 text-xs font-medium text-slate-400">
                        {c.autor}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => editar(c)}
                        aria-label="Editar"
                        className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                      >
                        <PencilIcon className="h-4.5 w-4.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => eliminar(c.id)}
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
