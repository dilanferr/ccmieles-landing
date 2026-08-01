"use client";

import { useState } from "react";
import { ImageIcon, TrashIcon } from "@/app/components/icons";

/**
 * Subida de imágenes directa a Cloudinary (a través de nuestro Route Handler
 * firmado). El administrador solo elige/arrastra la foto: se sube ordenada a
 * la carpeta indicada y se optimiza en el servidor. No hay que pegar links.
 */
export default function ImageUploader({
  value,
  onChange,
  folder,
  label = "Imagen",
  hint,
}: {
  value: string;
  onChange: (url: string) => void;
  /** Carpeta de Cloudinary, ej. "Mieles/eventos". */
  folder: string;
  label?: string;
  hint?: string;
}) {
  const [subiendo, setSubiendo] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function subir(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen.");
      return;
    }
    setSubiendo(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      const res = await fetch("/api/cloudinary", { method: "POST", body: fd });
      const json = await res.json();
      if (res.ok && json?.secure_url) {
        onChange(json.secure_url as string);
      } else {
        setError(
          json?.error
            ? `No se pudo subir: ${json.error}`
            : "No se pudo subir la imagen.",
        );
      }
    } catch {
      setError("No se pudo subir la imagen.");
    }
    setSubiendo(false);
  }

  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </p>

      {value ? (
        <div className="group relative overflow-hidden rounded-xl ring-1 ring-slate-200 dark:ring-slate-700">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Vista previa"
            className="h-44 w-full object-cover"
          />
          <div className="absolute inset-0 flex items-end justify-end gap-2 bg-linear-to-t from-slate-900/60 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
            <label className="cursor-pointer rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-white">
              {subiendo ? "Subiendo…" : "Cambiar"}
              <input
                type="file"
                accept="image/*"
                hidden
                disabled={subiendo}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) subir(file);
                  e.target.value = "";
                }}
              />
            </label>
            <button
              type="button"
              onClick={() => {
                onChange("");
                setError(null);
              }}
              className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-red-600 shadow-sm transition-colors hover:bg-white"
            >
              <TrashIcon className="h-3.5 w-3.5" />
              Quitar
            </button>
          </div>
        </div>
      ) : (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setArrastrando(true);
          }}
          onDragLeave={() => setArrastrando(false)}
          onDrop={(e) => {
            e.preventDefault();
            setArrastrando(false);
            const file = e.dataTransfer.files?.[0];
            if (file) subir(file);
          }}
          className={`flex h-44 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 text-center text-sm transition-colors ${
            arrastrando
              ? "border-blue-400 bg-blue-50/60 text-blue-700 dark:bg-blue-950/30"
              : "border-slate-300 bg-slate-50/60 text-slate-500 hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400"
          }`}
        >
          {subiendo ? (
            <span className="font-semibold">Subiendo foto…</span>
          ) : (
            <>
              <ImageIcon className="h-8 w-8 text-slate-400" />
              <span className="font-semibold">
                Arrastra una foto o haz clic para subir
              </span>
              <span className="text-xs">Se sube y optimiza automáticamente</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            hidden
            disabled={subiendo}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) subir(file);
              e.target.value = "";
            }}
          />
        </label>
      )}

      {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
      {hint && !error && (
        <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">{hint}</p>
      )}
    </div>
  );
}
