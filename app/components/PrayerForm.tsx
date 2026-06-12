"use client";

import { useState } from "react";
import { createClient } from "@/src/utils/supabase";
import { MOTIVOS_ORACION } from "@/app/data/iglesia";
import { CheckIcon, LockIcon, HeartIcon } from "./icons";

type Estado = "idle" | "enviando" | "ok" | "error";

const inputBase =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100";

export default function PrayerForm() {
  const [estado, setEstado] = useState<Estado>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEstado("enviando");
    setErrorMsg("");

    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      nombre: String(fd.get("nombre") ?? "").trim(),
      apellido: String(fd.get("apellido") ?? "").trim(),
      motivo: String(fd.get("motivo") ?? ""),
      descripcion: String(fd.get("descripcion") ?? "").trim(),
      leido: false,
    };

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("peticiones_oracion")
        .insert(payload);

      if (error) throw error;
      setEstado("ok");
      form.reset();
    } catch (err) {
      setEstado("error");
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "No pudimos enviar tu petición. Inténtalo nuevamente.",
      );
    }
  }

  if (estado === "ok") {
    return (
      <div className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-10 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
          <CheckIcon className="h-8 w-8" />
        </div>
        <h3 className="mt-6 text-2xl font-bold text-slate-900">
          Tu petición fue recibida
        </h3>
        <p className="mx-auto mt-3 max-w-md text-slate-600">
          Estamos contigo en oración. Tu mensaje es confidencial y solo será
          leído por el equipo pastoral.
        </p>
        <button
          type="button"
          onClick={() => setEstado("idle")}
          className="mt-6 rounded-full bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
        >
          Enviar otra petición
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-sky-500/5 sm:p-8"
    >
      <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700">
        <HeartIcon className="h-4 w-4" />
        Petición de oración
      </div>

      {/* Banner de confidencialidad */}
      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-700 text-white">
          <LockIcon className="h-5 w-5" />
        </span>
        <p className="text-sm leading-relaxed text-slate-600">
          <span className="font-semibold text-slate-800">
            La descripción es confidencial
          </span>{" "}
          y solo la puede visualizar el Encargado y el Cuerpo Ministerial.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="nombre" className="text-sm font-medium text-slate-700">
            Nombre
          </label>
          <input
            id="nombre"
            name="nombre"
            required
            autoComplete="given-name"
            placeholder="Tu nombre"
            className={inputBase}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="apellido" className="text-sm font-medium text-slate-700">
            Apellido
          </label>
          <input
            id="apellido"
            name="apellido"
            required
            autoComplete="family-name"
            placeholder="Tu apellido"
            className={inputBase}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="motivo" className="text-sm font-medium text-slate-700">
            Motivo
          </label>
          <select
            id="motivo"
            name="motivo"
            required
            defaultValue=""
            className={`${inputBase} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%2394a3b8%22 stroke-width=%222%22><path stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19 9l-7 7-7-7%22/></svg>')] bg-[length:1.25rem] bg-[right_0.85rem_center] bg-no-repeat pr-10`}
          >
            <option value="" disabled>
              Selecciona un motivo…
            </option>
            {MOTIVOS_ORACION.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label
            htmlFor="descripcion"
            className="text-sm font-medium text-slate-700"
          >
            Descripción
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            required
            rows={5}
            placeholder="Cuéntanos por qué oramos contigo…"
            className={`${inputBase} resize-none`}
          />
        </div>
      </div>

      {estado === "error" && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={estado === "enviando"}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-700 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-blue-600/40 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
      >
        {estado === "enviando" ? "Enviando…" : "Enviar mi petición"}
      </button>
    </form>
  );
}
