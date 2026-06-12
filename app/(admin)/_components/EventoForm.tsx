"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { createEvento } from "../actions";
import { fieldClass, Label, SubmitButton, Feedback } from "./fields";

const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export default function EventoForm() {
  const [state, action] = useActionState(createEvento, null);
  const [imagenUrl, setImagenUrl] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      setImagenUrl("");
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="evento-titulo">Título del evento</Label>
          <input
            id="evento-titulo"
            name="titulo"
            required
            placeholder="Ej: Aniversario Mieles"
            className={fieldClass}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="evento-fecha">Fecha</Label>
          <input
            id="evento-fecha"
            name="fecha"
            type="date"
            required
            className={fieldClass}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="evento-hora">Hora</Label>
          <input
            id="evento-hora"
            name="hora"
            placeholder="Ej: 19:00 hrs"
            className={fieldClass}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="evento-lugar">Lugar (opcional)</Label>
          <input
            id="evento-lugar"
            name="lugar"
            placeholder="Ej: Templo Centro Cristiano Mieles"
            className={fieldClass}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="evento-descripcion">Descripción</Label>
          <textarea
            id="evento-descripcion"
            name="descripcion"
            required
            rows={4}
            placeholder="Detalles del evento…"
            className={`${fieldClass} resize-none`}
          />
        </div>
      </div>

      {/* Afiche / foto promocional → Cloudinary (Mieles/eventos) */}
      <div className="space-y-2">
        <Label htmlFor="evento-afiche">Afiche o foto promocional</Label>
        <input type="hidden" name="imagen_url" value={imagenUrl} />

        <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 sm:flex-row sm:items-center">
          {imagenUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagenUrl}
                alt="Afiche del evento"
                className="h-24 w-24 shrink-0 rounded-xl object-cover ring-1 ring-slate-200"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-emerald-700">
                  ✓ Imagen cargada
                </p>
                <p className="truncate text-xs text-slate-400">{imagenUrl}</p>
              </div>
              <button
                type="button"
                onClick={() => setImagenUrl("")}
                className="text-xs font-semibold text-red-600 hover:text-red-700"
              >
                Quitar
              </button>
            </>
          ) : (
            <CldUploadWidget
              uploadPreset={UPLOAD_PRESET}
              options={{
                folder: "Mieles/eventos",
                sources: ["local", "url", "camera"],
                multiple: false,
                maxFiles: 1,
              }}
              onSuccess={(results) => {
                const info = results?.info;
                if (info && typeof info === "object" && "secure_url" in info) {
                  setImagenUrl(info.secure_url as string);
                }
              }}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => open()}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 ring-1 ring-blue-200 transition-colors hover:bg-blue-50"
                >
                  ⬆️ Subir afiche a Cloudinary
                </button>
              )}
            </CldUploadWidget>
          )}
        </div>
        {!UPLOAD_PRESET && (
          <p className="text-xs text-amber-600">
            Define <span className="font-mono">NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</span>{" "}
            y <span className="font-mono">NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</span> para
            habilitar la subida de imágenes.
          </p>
        )}
      </div>

      <Feedback state={state} />
      <SubmitButton>Publicar evento</SubmitButton>
    </form>
  );
}
