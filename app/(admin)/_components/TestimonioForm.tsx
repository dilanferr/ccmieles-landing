"use client";

import { useActionState, useEffect, useRef } from "react";
import { createTestimonio } from "../actions";
import { fieldClass, Label, SubmitButton, Feedback } from "./fields";

export default function TestimonioForm() {
  const [state, action] = useActionState(createTestimonio, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="test-titulo">Título del testimonio</Label>
          <input
            id="test-titulo"
            name="titulo"
            required
            placeholder="Ej: Cicatrices de un milagro"
            className={fieldClass}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="test-youtube">ID de video de YouTube</Label>
          <input
            id="test-youtube"
            name="youtube_id"
            required
            placeholder="Ej: ysz5S6PUM-U"
            className={`${fieldClass} font-mono`}
          />
          <p className="text-xs text-slate-400">
            Solo el ID, no la URL completa (lo que va después de{" "}
            <span className="font-mono">v=</span>).
          </p>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="test-bendecidos">Nombre de los bendecidos</Label>
          <input
            id="test-bendecidos"
            name="bendecidos"
            placeholder="Ej: Familia Pérez, Hna. María González"
            className={fieldClass}
          />
          <p className="text-xs text-slate-400">
            Separa varios nombres con comas.
          </p>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="test-descripcion">Descripción escrita</Label>
          <textarea
            id="test-descripcion"
            name="descripcion"
            required
            rows={5}
            placeholder="Relata el testimonio de fe…"
            className={`${fieldClass} resize-none`}
          />
        </div>
      </div>

      <Feedback state={state} />
      <SubmitButton>Publicar testimonio</SubmitButton>
    </form>
  );
}
