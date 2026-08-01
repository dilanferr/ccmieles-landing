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
import { MegaphoneIcon, TrashIcon, PencilIcon } from "@/app/components/icons";
import {
  crearNoticia,
  actualizarNoticia,
  eliminarNoticia,
} from "./noticias-actions";
import ImageUploader from "./ImageUploader";

type Noticia = {
  id: string | number;
  titulo: string;
  autor: string | null;
  tipo: string | null;
  contenido: string | null;
  imagen_url: string | null;
};

const TIPOS = [
  { v: "noticia", l: "Noticia / Blog" },
  { v: "aviso", l: "Aviso clasificado" },
  { v: "testimonio", l: "Testimonio" },
];

const VACIO = {
  titulo: "",
  autor: "",
  tipo: "noticia",
  imagen_url: "",
  contenido: "",
};

export default function NoticiasModule() {
  const supabase = getDb();
  const [lista, setLista] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(VACIO);
  const [editId, setEditId] = useState<Noticia["id"] | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const set = (k: keyof typeof VACIO) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function cargar() {
    setLoading(true);
    const { data, error } = await supabase
      .from("noticias")
      .select("*")
      .order("id", { ascending: false });
    if (!error && data) setLista(data as Noticia[]);
    setLoading(false);
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.titulo.trim() || !form.contenido.trim()) {
      setMsg({ ok: false, text: "El título y el contenido son obligatorios." });
      return;
    }
    setSaving(true);
    setMsg(null);
    const input = {
      titulo: form.titulo,
      autor: form.autor,
      tipo: form.tipo,
      imagen_url: form.imagen_url,
      contenido: form.contenido,
    };
    const res = editId
      ? await actualizarNoticia(editId, input)
      : await crearNoticia(input);
    setSaving(false);
    if (!res.ok) {
      setMsg({
        ok: false,
        text:
          res.error ??
          (editId
            ? "No se pudo actualizar la publicación."
            : "No se pudo crear la publicación."),
      });
      return;
    }
    setMsg({
      ok: true,
      text: editId
        ? "Publicación actualizada y web actualizada."
        : "Publicación creada correctamente.",
    });
    setForm(VACIO);
    setEditId(null);
    cargar();
  }

  /** Carga una publicación en el formulario para editarla. */
  function editar(n: Noticia) {
    setEditId(n.id);
    setForm({
      titulo: n.titulo ?? "",
      autor: n.autor ?? "",
      tipo: n.tipo ?? "noticia",
      imagen_url: n.imagen_url ?? "",
      contenido: n.contenido ?? "",
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

  async function eliminar(id: Noticia["id"]) {
    if (!confirm("¿Eliminar esta publicación de forma permanente?")) return;
    const res = await eliminarNoticia(id);
    if (!res.ok) {
      setMsg({ ok: false, text: res.error ?? "No se pudo eliminar." });
      return;
    }
    setLista((l) => l.filter((n) => n.id !== id));
    if (editId === id) cancelarEdicion();
    setMsg({ ok: true, text: "Publicación eliminada y web actualizada." });
  }

  return (
    <div>
      <ModuleHeader
        icon={<MegaphoneIcon className="h-6 w-6" />}
        titulo="Noticias / Blog"
        descripcion="Crea, revisa y elimina las publicaciones del sitio."
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
        {/* Formulario */}
        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {editId ? "Editar publicación" : "Nueva publicación"}
            </h2>
            {editId && (
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                Editando
              </span>
            )}
          </div>
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <Field label="Título">
              <Input
                value={form.titulo}
                onChange={set("titulo")}
                placeholder="Ej: Gran campaña de evangelización"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Autor">
                <Input
                  value={form.autor}
                  onChange={set("autor")}
                  placeholder="Nombre del autor"
                />
              </Field>
              <Field label="Tipo">
                <Select value={form.tipo} onChange={set("tipo")}>
                  {TIPOS.map((t) => (
                    <option key={t.v} value={t.v}>
                      {t.l}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <ImageUploader
              label="Imagen (opcional)"
              hint="Se sube a la carpeta Mieles/noticias y se optimiza"
              folder="Mieles/noticias"
              value={form.imagen_url}
              onChange={(url) => setForm((f) => ({ ...f, imagen_url: url }))}
            />
            <Field label="Contenido">
              <Textarea
                value={form.contenido}
                onChange={set("contenido")}
                placeholder="Escribe el contenido de la publicación..."
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
                {editId ? "Guardar cambios" : "Publicar"}
              </Button>
            </div>
          </form>
        </Card>

        {/* Lista */}
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Publicaciones</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {lista.length}
            </span>
          </div>

          <div className="mt-5">
            {loading ? (
              <EstadoVacio loading>Cargando publicaciones…</EstadoVacio>
            ) : lista.length === 0 ? (
              <EstadoVacio>Aún no hay publicaciones.</EstadoVacio>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {lista.map((n) => (
                  <li
                    key={n.id}
                    className={`flex items-start justify-between gap-4 rounded-xl px-2 py-3 transition-colors ${
                      editId === n.id ? "bg-blue-50/60 dark:bg-blue-950/30" : ""
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-blue-700">
                          {n.tipo ?? "—"}
                        </span>
                        <p className="truncate font-semibold text-slate-900 dark:text-white">
                          {n.titulo}
                        </p>
                      </div>
                      {n.autor && (
                        <p className="mt-0.5 text-xs text-slate-400">
                          por {n.autor}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => editar(n)}
                        aria-label="Editar"
                        className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                      >
                        <PencilIcon className="h-4.5 w-4.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => eliminar(n.id)}
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
