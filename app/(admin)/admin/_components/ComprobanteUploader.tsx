"use client";

import { useState } from "react";
import { FileIcon, TrashIcon, DownloadIcon } from "@/app/components/icons";

/**
 * Cargador de comprobantes (boletas/facturas) para Tesorería.
 * Acepta imágenes (JPG/PNG/WEBP/GIF) y PDF, sube a Cloudinary vía el Route
 * Handler firmado y devuelve la URL segura. Imágenes → vista previa; PDF →
 * ficha con nombre y enlace "Ver". Sin pegar links a mano.
 */

const TIPOS_OK = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "application/pdf",
];
const ACCEPT = TIPOS_OK.join(",");
const MAX_MB = 10;

/** Un comprobante es imagen si: va por el proxy privado con rt=image, tiene
 *  extensión de imagen, o va por el pipeline /image/upload/. Los PDF son raw. */
const esImagenUrl = (u: string) =>
  /[?&]rt=image(&|$)/.test(u) ||
  /\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(u) ||
  /\/image\/upload\//.test(u);

export default function ComprobanteUploader({
  value,
  onChange,
  folder,
  label = "Comprobante",
  hint,
}: {
  value: string;
  onChange: (url: string) => void;
  /** Carpeta de Cloudinary, ej. "finanzas" → se guarda en "Mieles/finanzas". */
  folder: string;
  label?: string;
  hint?: string;
}) {
  const [subiendo, setSubiendo] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function subir(file: File) {
    if (!TIPOS_OK.includes(file.type)) {
      setError("Formato no permitido. Usa JPG, PNG, WEBP o PDF.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`El archivo supera los ${MAX_MB} MB.`);
      return;
    }
    setSubiendo(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      fd.append("privado", "1"); // sube como recurso privado (type=authenticated)
      const res = await fetch("/api/cloudinary", { method: "POST", body: fd });
      const json = await res.json();
      if (res.ok && json?.public_id) {
        // Guardamos la URL del PROXY gateado, no la de Cloudinary.
        const rt = json.resource_type === "raw" ? "raw" : "image";
        const p = new URLSearchParams({ rt, id: String(json.public_id) });
        if (rt === "image" && json.format) p.set("f", String(json.format));
        onChange(`/api/comprobante?${p.toString()}`);
      } else {
        setError(
          json?.error
            ? `No se pudo subir: ${json.error}`
            : "No se pudo subir el archivo.",
        );
      }
    } catch {
      setError("No se pudo subir el archivo.");
    }
    setSubiendo(false);
  }

  const inputFile = (
    <input
      type="file"
      accept={ACCEPT}
      hidden
      disabled={subiendo}
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) subir(file);
        e.target.value = "";
      }}
    />
  );

  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </p>

      {value ? (
        esImagenUrl(value) ? (
          /* ── Imagen: vista previa con acciones al pasar el cursor ── */
          <div className="group relative overflow-hidden rounded-xl ring-1 ring-slate-200 dark:ring-slate-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Comprobante"
              className="h-44 w-full object-contain bg-slate-50 dark:bg-slate-800"
            />
            <div className="absolute inset-0 flex items-end justify-end gap-2 bg-linear-to-t from-slate-900/60 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-white"
              >
                <DownloadIcon className="h-3.5 w-3.5" />
                Ver
              </a>
              <label className="cursor-pointer rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-white">
                {subiendo ? "Subiendo…" : "Cambiar"}
                {inputFile}
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
          /* ── Documento (PDF): ficha con nombre y enlace ── */
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-700 dark:bg-slate-800/40">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300">
              <FileIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                Comprobante PDF
              </p>
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Ver documento →
              </a>
            </div>
            <label className="cursor-pointer rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700">
              {subiendo ? "Subiendo…" : "Cambiar"}
              {inputFile}
            </label>
            <button
              type="button"
              onClick={() => {
                onChange("");
                setError(null);
              }}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/40"
              title="Quitar comprobante"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        )
      ) : (
        /* ── Sin comprobante: zona de arrastre / botón ── */
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
          className={`flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 text-center text-sm transition-colors ${
            arrastrando
              ? "border-blue-400 bg-blue-50/60 text-blue-700 dark:bg-blue-950/30"
              : "border-slate-300 bg-slate-50/60 text-slate-500 hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400"
          }`}
        >
          {subiendo ? (
            <span className="font-semibold">Subiendo comprobante…</span>
          ) : (
            <>
              <FileIcon className="h-7 w-7 text-slate-400" />
              <span className="font-semibold">
                Arrastra la boleta/factura o haz clic para subir
              </span>
              <span className="text-xs">JPG, PNG, WEBP o PDF · máx {MAX_MB} MB</span>
            </>
          )}
          {inputFile}
        </label>
      )}

      {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
      {hint && !error && (
        <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">{hint}</p>
      )}
    </div>
  );
}
