"use client";

import { useEffect, useRef, useState } from "react";
import { Card, EstadoVacio, ModuleHeader, Button, Alerta } from "./ui";
import { ImageIcon, DownloadIcon } from "@/app/components/icons";

type Recurso = {
  publicId: string;
  url: string;
  bytes: number;
  format: string;
  width: number;
  height: number;
  createdAt: string;
};

type Usage = {
  plan: string | null;
  recursos: number | null;
  almacenamientoBytes: number | null;
  almacenamientoLimite: number | null;
  creditosUsados: number | null;
};

function fmtBytes(b: number | null | undefined): string {
  if (b == null) return "—";
  const u = ["B", "KB", "MB", "GB", "TB"];
  let n = b;
  let i = 0;
  while (n >= 1024 && i < u.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${u[i]}`;
}

export default function MultimediaModule() {
  const [usage, setUsage] = useState<Usage | null>(null);
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function cargar() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cloudinary", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        setError(
          json.error === "missing-credentials"
            ? "Faltan las credenciales de Cloudinary (CLOUDINARY_API_KEY / API_SECRET) en el servidor."
            : "No se pudo conectar con Cloudinary.",
        );
      } else {
        setUsage(json.usage);
        setRecursos(json.resources ?? []);
      }
    } catch {
      setError("No se pudo conectar con Cloudinary.");
    }
    setLoading(false);
  }

  useEffect(() => {
    cargar();
  }, []);

  async function subir(files: File[]) {
    const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloud || !preset) {
      setError("Falta el upload preset de Cloudinary.");
      return;
    }
    setSubiendo(true);
    setError(null);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("upload_preset", preset);
        await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
          method: "POST",
          body: fd,
        });
      }
    } catch {
      setError("Ocurrió un error al subir. Inténtalo de nuevo.");
    }
    setSubiendo(false);
    cargar();
  }

  const totalImagenes = usage?.recursos ?? recursos.length;

  return (
    <div>
      <ModuleHeader
        icon={<ImageIcon className="h-6 w-6" />}
        titulo="Multimedia"
        descripcion="Biblioteca de imágenes en Cloudinary."
        accion={
          <Button variant="ghost" onClick={cargar} loading={loading}>
            Actualizar
          </Button>
        }
      />

      {error && (
        <div className="mb-6">
          <Alerta ok={false}>{error}</Alerta>
        </div>
      )}

      {/* KPIs de almacenamiento */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Imágenes</p>
          <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
            {loading ? "…" : totalImagenes}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Almacenamiento
          </p>
          <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
            {fmtBytes(usage?.almacenamientoBytes)}
          </p>
          {usage?.almacenamientoLimite != null && (
            <p className="mt-1 text-xs text-slate-400">
              de {fmtBytes(usage.almacenamientoLimite)}
            </p>
          )}
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Créditos usados
          </p>
          <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
            {usage?.creditosUsados != null
              ? `${usage.creditosUsados.toFixed(1)}%`
              : "—"}
          </p>
          {usage?.plan && (
            <p className="mt-1 text-xs text-slate-400">Plan {usage.plan}</p>
          )}
        </Card>
      </div>

      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const files = Array.from(e.dataTransfer.files).filter((f) =>
            f.type.startsWith("image/"),
          );
          if (files.length) subir(files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`mt-6 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-10 text-center transition-colors ${
          drag
            ? "border-blue-500 bg-blue-50 dark:bg-slate-800"
            : "border-slate-300 hover:border-blue-300 dark:border-slate-700"
        }`}
      >
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-blue-300">
          <DownloadIcon className="h-6 w-6 rotate-180" />
        </span>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {subiendo ? "Subiendo…" : "Arrastra imágenes aquí o haz clic"}
        </p>
        <p className="text-xs text-slate-400">
          Se suben directo a Cloudinary (preset seguro).
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length) subir(files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Grid de recursos */}
      <div className="mt-8">
        {loading ? (
          <EstadoVacio loading>Cargando biblioteca…</EstadoVacio>
        ) : recursos.length === 0 ? (
          <EstadoVacio>
            {error ? "Sin conexión con Cloudinary." : "Aún no hay imágenes."}
          </EstadoVacio>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {recursos.map((r) => (
              <div
                key={r.publicId}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="relative aspect-square bg-slate-100 dark:bg-slate-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={r.url}
                    alt={r.publicId}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <p className="truncate text-xs font-medium text-slate-700 dark:text-slate-300">
                    {r.publicId}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {r.format?.toUpperCase()} · {fmtBytes(r.bytes)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
