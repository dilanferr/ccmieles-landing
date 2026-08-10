"use client";

import { useEffect, useState, type FormEvent } from "react";
import { getDb } from "./db";
import { revalidarSitio } from "./config-actions";
import { Card, Field, Input, Textarea, Button, Alerta, ModuleHeader, Spinner } from "./ui";
import { SearchIcon } from "@/app/components/icons";

const DEFAULTS = {
  title: "CCMieles — Centro Cristiano Mieles",
  description:
    "Centro Cristiano Mieles — una iglesia para toda la familia. Fundada el 30 de agosto de 2007. Conoce nuestros ministerios, eventos, diario mural y envía tu petición de oración.",
  keywords: "",
};

export default function SeoModule() {
  const supabase = getDb();
  const [form, setForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sinTabla, setSinTabla] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const set = (k: keyof typeof DEFAULTS) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("seo_title, seo_description, seo_keywords")
        .eq("id", 1)
        .maybeSingle();
      if (error) setSinTabla(true);
      else if (data)
        setForm({
          title: data.seo_title ?? DEFAULTS.title,
          description: data.seo_description ?? DEFAULTS.description,
          keywords: data.seo_keywords ?? DEFAULTS.keywords,
        });
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const { error } = await supabase.from("site_settings").upsert({
      id: 1,
      seo_title: form.title,
      seo_description: form.description,
      seo_keywords: form.keywords || null,
    });
    if (error) {
      setSaving(false);
      setSinTabla(true);
      setMsg({ ok: false, text: error.message });
      return;
    }
    await revalidarSitio(); // refresca los metadatos en todo el sitio
    setSaving(false);
    setMsg({ ok: true, text: "SEO guardado y sitio actualizado." });
  }

  if (loading) {
    return (
      <div>
        <ModuleHeader
          icon={<SearchIcon className="h-6 w-6" />}
          titulo="SEO"
          descripcion="Metadatos globales que leen Google y los buscadores."
        />
        <div className="flex justify-center py-14">
          <Spinner className="h-6 w-6 text-blue-500" />
        </div>
      </div>
    );
  }

  const desLen = form.description.length;
  const desColor =
    desLen > 160 ? "text-red-500" : desLen > 120 ? "text-emerald-600" : "text-slate-400";

  return (
    <form onSubmit={handleSubmit}>
      <ModuleHeader
        icon={<SearchIcon className="h-6 w-6" />}
        titulo="SEO"
        descripcion="Metadatos globales que leen Google y los motores de IA."
        accion={
          <Button type="submit" loading={saving}>
            Guardar SEO
          </Button>
        }
      />

      {sinTabla && (
        <div className="mb-6">
          <Alerta ok={false}>
            La tabla <code>site_settings</code> aún no tiene los campos SEO. Corre
            el SQL indicado abajo para poder guardar.
          </Alerta>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Formulario */}
        <Card>
          <div className="space-y-4">
            <Field label="Meta Title" hint="Título de la pestaña y del resultado en Google">
              <Input value={form.title} onChange={set("title")} />
            </Field>
            <Field
              label="Meta Description"
              hint="Ideal: 150–160 caracteres, clara e invitadora"
            >
              <Textarea
                value={form.description}
                onChange={set("description")}
                className="min-h-28"
              />
              <span className={`mt-1 block text-xs font-medium ${desColor}`}>
                {desLen}/160 caracteres
              </span>
            </Field>
            <Field label="Keywords" hint="Palabras clave separadas por comas">
              <Input
                value={form.keywords}
                onChange={set("keywords")}
                placeholder="iglesia evangélica en Quilicura, cultos cristianos, ..."
              />
            </Field>
          </div>
        </Card>

        {/* Vista previa Google */}
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            Vista previa en Google
          </p>
          <Card>
            <div className="flex items-center gap-2.5">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-100 text-[11px] font-black text-blue-700 dark:bg-slate-800 dark:text-blue-300">
                M
              </span>
              <div className="leading-tight">
                <p className="text-sm text-slate-700 dark:text-slate-200">
                  Centro Cristiano Mieles
                </p>
                <p className="text-xs text-[#006621] dark:text-emerald-500">
                  https://ccmieles.cl
                </p>
              </div>
            </div>
            <h3 className="mt-3 truncate text-xl leading-snug text-[#1a0dab] dark:text-blue-400">
              {form.title || "Título del sitio"}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {form.description || "Descripción que verán en los resultados de búsqueda…"}
            </p>

            {form.keywords && (
              <div className="mt-4 flex flex-wrap gap-1.5 border-t border-slate-100 pt-4 dark:border-slate-800">
                {form.keywords
                  .split(",")
                  .map((k) => k.trim())
                  .filter(Boolean)
                  .slice(0, 8)
                  .map((k) => (
                    <span
                      key={k}
                      className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-slate-800 dark:text-blue-300"
                    >
                      {k}
                    </span>
                  ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {msg && (
        <div className="mt-6">
          <Alerta ok={msg.ok}>{msg.text}</Alerta>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Button type="submit" loading={saving}>
          Guardar SEO
        </Button>
      </div>
    </form>
  );
}
