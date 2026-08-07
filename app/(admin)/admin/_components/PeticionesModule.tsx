"use client";

import { useEffect, useMemo, useState } from "react";
import { getDb } from "./db";
import { Button, EstadoVacio, ModuleHeader, Input, Select } from "./ui";
import {
  PrayingHands,
  CheckIcon,
  SearchIcon,
  DownloadIcon,
} from "@/app/components/icons";

type Peticion = {
  id: string | number;
  nombre: string | null;
  apellido: string | null;
  motivo: string | null;
  descripcion: string | null;
  leido: boolean;
};

type EstadoFiltro = "todas" | "nuevas" | "atendidas";

function exportarCSV(rows: Peticion[]) {
  const head = ["Nombre", "Apellido", "Motivo", "Descripción", "Estado"];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const body = rows.map((p) =>
    [
      p.nombre,
      p.apellido,
      p.motivo,
      p.descripcion,
      p.leido ? "Atendida" : "Nueva",
    ]
      .map(esc)
      .join(","),
  );
  const csv = ["﻿" + head.join(","), ...body].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `peticiones-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function PeticionesModule() {
  const supabase = getDb();
  const [lista, setLista] = useState<Peticion[]>([]);
  const [loading, setLoading] = useState(true);
  const [actualizando, setActualizando] = useState<Peticion["id"] | null>(null);

  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState<EstadoFiltro>("todas");
  const [motivo, setMotivo] = useState("");

  useEffect(() => {
    let vivo = true;
    (async () => {
      const { data, error } = await supabase
        .from("peticiones_oracion")
        .select("*")
        .order("leido", { ascending: true })
        .order("id", { ascending: false });
      if (!vivo) return;
      if (!error && data) setLista(data as Peticion[]);
      setLoading(false);
    })();
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function marcar(id: Peticion["id"], leido: boolean) {
    setActualizando(id);
    const { error } = await supabase
      .from("peticiones_oracion")
      .update({ leido })
      .eq("id", id);
    setActualizando(null);
    if (!error) {
      setLista((l) => l.map((p) => (p.id === id ? { ...p, leido } : p)));
    }
  }

  const motivos = useMemo(
    () =>
      Array.from(new Set(lista.map((p) => p.motivo).filter(Boolean))) as string[],
    [lista],
  );

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return lista.filter((p) => {
      if (estado === "nuevas" && p.leido) return false;
      if (estado === "atendidas" && !p.leido) return false;
      if (motivo && p.motivo !== motivo) return false;
      if (q) {
        const texto = `${p.nombre ?? ""} ${p.apellido ?? ""} ${p.descripcion ?? ""}`.toLowerCase();
        if (!texto.includes(q)) return false;
      }
      return true;
    });
  }, [lista, busqueda, estado, motivo]);

  const pendientes = lista.filter((p) => !p.leido).length;
  const atendidas = lista.length - pendientes;

  const chips: { id: EstadoFiltro; label: string; n: number }[] = [
    { id: "todas", label: "Todas", n: lista.length },
    { id: "nuevas", label: "Nuevas", n: pendientes },
    { id: "atendidas", label: "Atendidas", n: atendidas },
  ];

  return (
    <div>
      <ModuleHeader
        icon={<PrayingHands className="h-6 w-6" />}
        titulo="Peticiones de Oración"
        descripcion="Lee, filtra y gestiona lo que envían los hermanos."
        accion={
          <Button
            variant="ghost"
            onClick={() => exportarCSV(filtradas)}
            disabled={filtradas.length === 0}
          >
            <DownloadIcon className="h-4 w-4" />
            Exportar
          </Button>
        }
      />

      {/* Barra de filtros */}
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setEstado(c.id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                estado === c.id
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {c.label}
              <span
                className={`rounded-full px-1.5 text-xs ${
                  estado === c.id
                    ? "bg-white/20"
                    : "bg-slate-100 dark:bg-slate-700"
                }`}
              >
                {c.n}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {motivos.length > 0 && (
            <Select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-auto"
            >
              <option value="">Todos los motivos</option>
              {motivos.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
          )}
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar…"
              className="w-full pl-9 sm:w-56"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <EstadoVacio loading>Cargando peticiones…</EstadoVacio>
      ) : filtradas.length === 0 ? (
        <EstadoVacio>
          {lista.length === 0
            ? "Aún no hay peticiones de oración."
            : "Ninguna petición coincide con el filtro."}
        </EstadoVacio>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtradas.map((p) => (
            <article
              key={p.id}
              className={`flex flex-col rounded-2xl border p-5 shadow-sm transition-colors ${
                p.leido
                  ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/50 dark:bg-emerald-950/30"
                  : "border-blue-200 bg-white dark:border-slate-700 dark:bg-slate-900"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {[p.nombre, p.apellido].filter(Boolean).join(" ") ||
                      "Anónimo"}
                  </p>
                  {p.motivo && (
                    <span className="mt-1 inline-flex rounded-full bg-blue-700 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
                      {p.motivo}
                    </span>
                  )}
                </div>
                {p.leido && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                    <CheckIcon className="h-3.5 w-3.5" />
                    Atendida
                  </span>
                )}
              </div>

              <p className="mt-3 flex-1 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {p.descripcion || "Sin descripción."}
              </p>

              <div className="mt-4 flex justify-end">
                {p.leido ? (
                  <Button
                    variant="ghost"
                    loading={actualizando === p.id}
                    onClick={() => marcar(p.id, false)}
                  >
                    Reabrir
                  </Button>
                ) : (
                  <Button
                    loading={actualizando === p.id}
                    onClick={() => marcar(p.id, true)}
                  >
                    <CheckIcon className="h-4 w-4" />
                    Marcar como atendida
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
