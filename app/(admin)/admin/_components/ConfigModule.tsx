"use client";

import { useEffect, useState, type FormEvent } from "react";
import { getDb } from "./db";
import { Card, Field, Input, Button, Alerta, ModuleHeader, Spinner } from "./ui";
import {
  CogIcon,
  MailIcon,
  MapPinIcon,
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
  TiktokIcon,
} from "@/app/components/icons";
import { IGLESIA } from "@/app/data/iglesia";

type Form = {
  nombre: string;
  nombreCorto: string;
  ministerio: string;
  correo: string;
  telefono: string;
  whatsapp: string;
  direccion: string;
  mapsUrl: string;
  facebook: string;
  instagram: string;
  youtube: string;
  tiktok: string;
};

// Estado del formulario con los valores actuales del sitio como respaldo.
const DEFAULTS: Form = {
  nombre: IGLESIA.nombre,
  nombreCorto: IGLESIA.nombreCorto,
  ministerio: IGLESIA.ministerio,
  correo: IGLESIA.correo,
  telefono: "",
  whatsapp: "",
  direccion: IGLESIA.direccion,
  mapsUrl: IGLESIA.mapsUrl,
  facebook: IGLESIA.redes.facebook,
  instagram: IGLESIA.redes.instagram,
  youtube: IGLESIA.redes.youtube,
  tiktok: IGLESIA.redes.tiktok,
};

// Mapeo entre el formulario (camelCase) y las columnas de la tabla (snake_case).
function aDb(f: Form) {
  return {
    id: 1,
    nombre: f.nombre,
    nombre_corto: f.nombreCorto,
    ministerio: f.ministerio,
    correo: f.correo,
    telefono: f.telefono || null,
    whatsapp: f.whatsapp || null,
    direccion: f.direccion,
    maps_url: f.mapsUrl,
    facebook: f.facebook,
    instagram: f.instagram,
    youtube: f.youtube,
    tiktok: f.tiktok,
  };
}
function deDb(r: Record<string, string | null>): Form {
  return {
    nombre: r.nombre ?? DEFAULTS.nombre,
    nombreCorto: r.nombre_corto ?? DEFAULTS.nombreCorto,
    ministerio: r.ministerio ?? DEFAULTS.ministerio,
    correo: r.correo ?? DEFAULTS.correo,
    telefono: r.telefono ?? "",
    whatsapp: r.whatsapp ?? "",
    direccion: r.direccion ?? DEFAULTS.direccion,
    mapsUrl: r.maps_url ?? DEFAULTS.mapsUrl,
    facebook: r.facebook ?? DEFAULTS.facebook,
    instagram: r.instagram ?? DEFAULTS.instagram,
    youtube: r.youtube ?? DEFAULTS.youtube,
    tiktok: r.tiktok ?? DEFAULTS.tiktok,
  };
}

export default function ConfigModule() {
  const supabase = getDb();
  const [form, setForm] = useState<Form>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sinTabla, setSinTabla] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const set = (k: keyof Form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();
      if (error) setSinTabla(true);
      else if (data) setForm(deDb(data));
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const { error } = await supabase.from("site_settings").upsert(aDb(form));
    setSaving(false);
    if (error) {
      setSinTabla(true);
      setMsg({ ok: false, text: error.message });
      return;
    }
    setMsg({ ok: true, text: "Configuración guardada correctamente." });
  }

  if (loading) {
    return (
      <div>
        <ModuleHeader
          icon={<CogIcon className="h-6 w-6" />}
          titulo="Configuración"
          descripcion="Datos generales de la iglesia."
        />
        <div className="flex justify-center py-14">
          <Spinner className="h-6 w-6 text-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <ModuleHeader
        icon={<CogIcon className="h-6 w-6" />}
        titulo="Configuración"
        descripcion="Datos generales de la iglesia."
        accion={
          <Button type="submit" loading={saving}>
            Guardar cambios
          </Button>
        }
      />

      {sinTabla && (
        <div className="mb-6">
          <Alerta ok={false}>
            La tabla <code>site_settings</code> aún no existe: se muestran los
            valores actuales del sitio. Créala en Supabase para poder guardar
            (ver instrucciones abajo).
          </Alerta>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Identidad */}
        <Card>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Identidad
          </h3>
          <div className="mt-5 space-y-4">
            <Field label="Nombre de la iglesia">
              <Input value={form.nombre} onChange={set("nombre")} />
            </Field>
            <Field label="Nombre corto">
              <Input value={form.nombreCorto} onChange={set("nombreCorto")} />
            </Field>
            <Field label="Ministerio">
              <Input value={form.ministerio} onChange={set("ministerio")} />
            </Field>
          </div>
        </Card>

        {/* Contacto */}
        <Card>
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
            <MailIcon className="h-5 w-5 text-blue-600" />
            Contacto
          </h3>
          <div className="mt-5 space-y-4">
            <Field label="Correo">
              <Input type="email" value={form.correo} onChange={set("correo")} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Teléfono">
                <Input value={form.telefono} onChange={set("telefono")} placeholder="+56 9 ..." />
              </Field>
              <Field label="WhatsApp">
                <Input value={form.whatsapp} onChange={set("whatsapp")} placeholder="+56 9 ..." />
              </Field>
            </div>
            <Field label="Dirección / templo">
              <Input value={form.direccion} onChange={set("direccion")} />
            </Field>
            <Field label="Enlace de Google Maps" hint="URL de maps.app.goo.gl">
              <Input value={form.mapsUrl} onChange={set("mapsUrl")} />
            </Field>
          </div>
        </Card>

        {/* Redes */}
        <Card className="lg:col-span-2">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
            <MapPinIcon className="h-5 w-5 text-blue-600" />
            Redes sociales
          </h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <RedField
              icon={<FacebookIcon className="h-5 w-5 text-blue-600" />}
              label="Facebook"
              value={form.facebook}
              onChange={set("facebook")}
            />
            <RedField
              icon={<InstagramIcon className="h-5 w-5 text-pink-600" />}
              label="Instagram"
              value={form.instagram}
              onChange={set("instagram")}
            />
            <RedField
              icon={<YoutubeIcon className="h-5 w-5 text-red-600" />}
              label="YouTube"
              value={form.youtube}
              onChange={set("youtube")}
            />
            <RedField
              icon={<TiktokIcon className="h-5 w-5 text-slate-900 dark:text-white" />}
              label="TikTok"
              value={form.tiktok}
              onChange={set("tiktok")}
            />
          </div>
        </Card>
      </div>

      {msg && (
        <div className="mt-6">
          <Alerta ok={msg.ok}>{msg.text}</Alerta>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Button type="submit" loading={saving}>
          Guardar cambios
        </Button>
      </div>
    </form>
  );
}

function RedField({
  icon,
  label,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (e: { target: { value: string } }) => void;
}) {
  return (
    <Field label={label}>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
          {icon}
        </span>
        <Input value={value} onChange={onChange} className="pl-10" />
      </div>
    </Field>
  );
}
