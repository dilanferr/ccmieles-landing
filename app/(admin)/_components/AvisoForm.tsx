"use client";

import { useActionState, useEffect, useRef } from "react";
import { createAviso } from "../actions";
import { fieldClass, Label, SubmitButton, Feedback } from "./fields";

export default function AvisoForm() {
  const [state, action] = useActionState(createAviso, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="aviso-titulo">Título del aviso</Label>
          <input
            id="aviso-titulo"
            name="titulo"
            required
            placeholder="Ej: Servicios de Gasfitería"
            className={fieldClass}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="aviso-oficio">Tipo de oficio</Label>
          <input
            id="aviso-oficio"
            name="oficio"
            required
            placeholder="Ej: Gasfitería, Electricidad, Costura"
            className={fieldClass}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="aviso-autor">Nombre del hermano que ofrece el servicio</Label>
          <input
            id="aviso-autor"
            name="autor"
            required
            placeholder="Ej: Hno. Juan Pérez"
            className={fieldClass}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="aviso-descripcion">Descripción</Label>
          <textarea
            id="aviso-descripcion"
            name="descripcion"
            required
            rows={4}
            placeholder="Describe el servicio ofrecido…"
            className={`${fieldClass} resize-none`}
          />
        </div>
      </div>

      <Feedback state={state} />
      <SubmitButton>Publicar aviso</SubmitButton>
    </form>
  );
}
