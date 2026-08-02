"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, EstadoVacio, ModuleHeader } from "./ui";
import { BookIcon } from "@/app/components/icons";
import { getDb } from "./db";

type Accion = "CREAR" | "EDITAR" | "ELIMINAR";

type Registro = {
  id: string;
  usuario_id: string | null;
  accion: Accion;
  modulo: string;
  detalles: Record<string, unknown> | null;
  creado_at: string;
};

const ACCION_COLOR: Record<Accion, string> = {
  CREAR:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  EDITAR: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  ELIMINAR: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
};

const MODULO_LABEL: Record<string, string> = {
  finanzas: "Tesorería",
  miembros: "Fichas",
  usuarios: "Usuarios",
};

const SEL_CLS =
  "rounded-lg border border-slate-200 bg-white py-1.5 pl-2.5 pr-7 text-sm text-slate-700 outline-none transition-colors focus:border-blue-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200";

function fechaLarga(iso: string): string {
  return new Date(iso).toLocaleString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Resumen legible de la columna `detalles` (jsonb). */
function resumenDetalles(det: Record<string, unknown> | null): string {
  if (!det) return "—";
  const partes: string[] = [];
  for (const [k, v] of Object.entries(det)) {
    if (k === "id") continue; // el id interno no aporta al lector
    let val: string;
    if (k === "monto" && typeof v === "number") val = "$" + v.toLocaleString("es-CL");
    else if (typeof v === "boolean") val = v ? "activo" : "inactivo";
    else val = String(v);
    partes.push(`${k}: ${val}`);
  }
  return partes.length ? partes.join(" · ") : "—";
}

export default function AuditoriaModule() {
  const supabase = getDb();
  const [lista, setLista] = useState<Registro[]>([]);
  const [correos, setCorreos] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [fModulo, setFModulo] = useState<string>("todos");
  const [fAccion, setFAccion] = useState<string>("todos");

  useEffect(() => {
    let vivo = true;
    (async () => {
      const [logsRes, perfilesRes] = await Promise.all([
        supabase
          .from("audit_log")
          .select("id, usuario_id, accion, modulo, detalles, creado_at")
          .order("creado_at", { ascending: false })
          .limit(300),
        supabase.from("perfiles").select("id, correo, nombre"),
      ]);
      if (!vivo) return;
      const mapa: Record<string, string> = {};
      (
        (perfilesRes.data as {
          id: string;
          correo: string | null;
          nombre: string | null;
        }[]) ?? []
      ).forEach((p) => {
        mapa[p.id] = p.correo || p.nombre || "—";
      });
      setCorreos(mapa);
      if (logsRes.data) setLista(logsRes.data as Registro[]);
      setLoading(false);
    })();
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtrada = useMemo(
    () =>
      lista.filter(
        (r) =>
          (fModulo === "todos" || r.modulo === fModulo) &&
          (fAccion === "todos" || r.accion === fAccion),
      ),
    [lista, fModulo, fAccion],
  );

  return (
    <div>
      <ModuleHeader
        icon={<BookIcon className="h-6 w-6" />}
        titulo="Auditoría"
        descripcion="Bitácora de acciones sobre datos sensibles (finanzas, fichas y usuarios)."
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <select
          value={fModulo}
          onChange={(e) => setFModulo(e.target.value)}
          className={SEL_CLS}
        >
          <option value="todos">Todos los módulos</option>
          <option value="finanzas">Tesorería</option>
          <option value="miembros">Fichas</option>
          <option value="usuarios">Usuarios</option>
        </select>
        <select
          value={fAccion}
          onChange={(e) => setFAccion(e.target.value)}
          className={SEL_CLS}
        >
          <option value="todos">Todas las acciones</option>
          <option value="CREAR">Crear</option>
          <option value="EDITAR">Editar</option>
          <option value="ELIMINAR">Eliminar</option>
        </select>
        <span className="text-sm text-slate-400">
          {filtrada.length} {filtrada.length === 1 ? "registro" : "registros"}
        </span>
      </div>

      <Card className="p-0 sm:p-0">
        {loading ? (
          <div className="p-6">
            <EstadoVacio loading>Cargando bitácora…</EstadoVacio>
          </div>
        ) : filtrada.length === 0 ? (
          <div className="p-6">
            <EstadoVacio>Aún no hay registros de auditoría.</EstadoVacio>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="px-5 py-3">Fecha</th>
                  <th className="px-5 py-3">Usuario</th>
                  <th className="px-5 py-3">Acción</th>
                  <th className="px-5 py-3">Módulo</th>
                  <th className="px-5 py-3">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {filtrada.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70 dark:border-slate-800 dark:hover:bg-slate-800/40"
                  >
                    <td className="whitespace-nowrap px-5 py-4 text-slate-500 dark:text-slate-400">
                      {fechaLarga(r.creado_at)}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-800 dark:text-slate-100">
                      {r.usuario_id ? (correos[r.usuario_id] ?? "—") : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${ACCION_COLOR[r.accion]}`}
                      >
                        {r.accion}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {MODULO_LABEL[r.modulo] ?? r.modulo}
                    </td>
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                      {resumenDetalles(r.detalles)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
