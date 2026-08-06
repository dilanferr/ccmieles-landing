"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, EstadoVacio, ModuleHeader } from "./ui";
import { BookIcon } from "@/app/components/icons";
import { getDb } from "./db";

/**
 * Bitácora de auditoría (M8). Las filas las escriben TRIGGERS de BD
 * (supabase/audit-triggers.sql): accion INSERT/UPDATE/DELETE, tabla afectada,
 * usuario_id (auth.uid()) y snapshots old_record/new_record. Este módulo
 * también entiende las filas legacy (accion CREAR/EDITAR/ELIMINAR + modulo).
 * Sólo visible para admin/pastor (coincide con la RLS de lectura de audit_log).
 */

type Rec = Record<string, unknown> | null;

type Registro = {
  id: string;
  usuario_id: string | null;
  accion: string;
  tabla: string | null;
  registro_id: string | null;
  old_record: Rec;
  new_record: Rec;
  modulo: string | null;
  detalles: Rec;
  creado_at: string;
};

type AccionKey = "crear" | "editar" | "eliminar";

const ACCION_LABEL: Record<AccionKey, string> = {
  crear: "Creó",
  editar: "Editó",
  eliminar: "Eliminó",
};
const ACCION_COLOR: Record<AccionKey, string> = {
  crear:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  editar: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  eliminar: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
};

// tabla (trigger) o modulo (legacy) → etiqueta y clave de filtro.
const TABLA_LABEL: Record<string, string> = {
  transacciones_financieras: "Tesorería",
  miembros_iglesia: "Fichas",
  perfiles: "Usuarios",
  turnos_servidores: "Turnos",
};
const MODULO_LEGACY: Record<string, string> = {
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

function canonModulo(r: Registro): string {
  const t = r.tabla ?? r.modulo ?? "";
  if (t === "transacciones_financieras" || t === "finanzas") return "tesoreria";
  if (t === "miembros_iglesia" || t === "miembros") return "fichas";
  if (t === "perfiles" || t === "usuarios") return "usuarios";
  if (t === "turnos_servidores") return "turnos";
  return "otro";
}

function moduloLabel(r: Registro): string {
  if (r.tabla) return TABLA_LABEL[r.tabla] ?? r.tabla;
  if (r.modulo) return MODULO_LEGACY[r.modulo] ?? r.modulo;
  return "—";
}

/** Acción efectiva: detecta soft-delete/restauración (UPDATE de eliminado_at). */
function accionEfectiva(r: Registro): { key: AccionKey; label: string } {
  const key: AccionKey =
    r.accion === "INSERT" || r.accion === "CREAR"
      ? "crear"
      : r.accion === "DELETE" || r.accion === "ELIMINAR"
        ? "eliminar"
        : "editar";
  if (key === "editar" && r.old_record && r.new_record) {
    const o = r.old_record["eliminado_at"];
    const n = r.new_record["eliminado_at"];
    if (!o && n) return { key: "eliminar", label: "Eliminó (papelera)" };
    if (o && !n) return { key: "crear", label: "Restauró" };
  }
  return { key, label: ACCION_LABEL[key] };
}

const money = (v: unknown) => "$" + Number(v ?? 0).toLocaleString("es-CL");

/** Resumen legible según el módulo, a partir del snapshot disponible. */
function resumen(r: Registro): string {
  const rec = (r.new_record ?? r.old_record) as Record<string, unknown> | null;
  const canon = canonModulo(r);
  if (rec) {
    if (canon === "tesoreria")
      return `${rec.tipo ?? ""} · ${money(rec.monto)} · ${rec.categoria ?? ""}`.trim();
    if (canon === "fichas") return String(rec.nombre_completo ?? "—");
    if (canon === "usuarios")
      return `${rec.correo ?? rec.nombre ?? "—"} · rol: ${rec.rol ?? "—"}`;
    if (canon === "turnos")
      return `${rec.fecha ?? ""}${rec.rol_en_equipo ? ` · ${rec.rol_en_equipo}` : ""}`.trim();
  }
  // Filas legacy (app-level): resumen desde `detalles`.
  if (r.detalles) {
    const partes = Object.entries(r.detalles)
      .filter(([k]) => k !== "id")
      .map(([k, v]) => `${k}: ${v}`);
    if (partes.length) return partes.join(" · ");
  }
  return r.registro_id ? `#${r.registro_id.slice(0, 8)}` : "—";
}

export default function AuditoriaModule() {
  const supabase = getDb();
  const [lista, setLista] = useState<Registro[]>([]);
  const [correos, setCorreos] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [fModulo, setFModulo] = useState<string>("todos");
  const [fAccion, setFAccion] = useState<string>("todos");
  const [abierto, setAbierto] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    (async () => {
      const [logsRes, perfilesRes] = await Promise.all([
        supabase
          .from("audit_log")
          .select(
            "id, usuario_id, accion, tabla, registro_id, old_record, new_record, modulo, detalles, creado_at",
          )
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
      lista.filter((r) => {
        const okMod = fModulo === "todos" || canonModulo(r) === fModulo;
        const okAcc = fAccion === "todos" || accionEfectiva(r).key === fAccion;
        return okMod && okAcc;
      }),
    [lista, fModulo, fAccion],
  );

  return (
    <div>
      <ModuleHeader
        icon={<BookIcon className="h-6 w-6" />}
        titulo="Auditoría"
        descripcion="Bitácora inalterable (triggers de BD) sobre finanzas, fichas, usuarios y turnos."
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <select
          value={fModulo}
          onChange={(e) => setFModulo(e.target.value)}
          className={SEL_CLS}
        >
          <option value="todos">Todos los módulos</option>
          <option value="tesoreria">Tesorería</option>
          <option value="fichas">Fichas</option>
          <option value="usuarios">Usuarios</option>
          <option value="turnos">Turnos</option>
        </select>
        <select
          value={fAccion}
          onChange={(e) => setFAccion(e.target.value)}
          className={SEL_CLS}
        >
          <option value="todos">Todas las acciones</option>
          <option value="crear">Crear</option>
          <option value="editar">Editar</option>
          <option value="eliminar">Eliminar</option>
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
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="px-5 py-3">Fecha</th>
                  <th className="px-5 py-3">Usuario</th>
                  <th className="px-5 py-3">Acción</th>
                  <th className="px-5 py-3">Módulo</th>
                  <th className="px-5 py-3">Detalle</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtrada.map((r) => {
                  const acc = accionEfectiva(r);
                  const expandido = abierto === r.id;
                  const tieneJson = !!(r.old_record || r.new_record);
                  return (
                    <FragmentRow
                      key={r.id}
                      r={r}
                      acc={acc}
                      usuario={
                        r.usuario_id
                          ? (correos[r.usuario_id] ?? "Sistema")
                          : "Sistema"
                      }
                      expandido={expandido}
                      tieneJson={tieneJson}
                      onToggle={() => setAbierto(expandido ? null : r.id)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function FragmentRow({
  r,
  acc,
  usuario,
  expandido,
  tieneJson,
  onToggle,
}: {
  r: Registro;
  acc: { key: AccionKey; label: string };
  usuario: string;
  expandido: boolean;
  tieneJson: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70 dark:border-slate-800 dark:hover:bg-slate-800/40">
        <td className="whitespace-nowrap px-5 py-4 text-slate-500 dark:text-slate-400">
          {fechaLarga(r.creado_at)}
        </td>
        <td className="px-5 py-4 font-medium text-slate-800 dark:text-slate-100">
          {usuario}
        </td>
        <td className="px-5 py-4">
          <span
            className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${ACCION_COLOR[acc.key]}`}
          >
            {acc.label}
          </span>
        </td>
        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
          {moduloLabel(r)}
        </td>
        <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
          {resumen(r)}
        </td>
        <td className="px-5 py-4 text-right">
          {tieneJson && (
            <button
              type="button"
              onClick={onToggle}
              className="rounded-lg px-2.5 py-1 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40"
            >
              {expandido ? "Ocultar" : "Ver JSON"}
            </button>
          )}
        </td>
      </tr>
      {expandido && tieneJson && (
        <tr className="border-b border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/40">
          <td colSpan={6} className="px-5 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              {r.old_record && (
                <div>
                  <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    Antes
                  </p>
                  <pre className="max-h-72 overflow-auto rounded-lg bg-white p-3 text-xs text-slate-700 ring-1 ring-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:ring-slate-800">
                    {JSON.stringify(r.old_record, null, 2)}
                  </pre>
                </div>
              )}
              {r.new_record && (
                <div>
                  <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Después
                  </p>
                  <pre className="max-h-72 overflow-auto rounded-lg bg-white p-3 text-xs text-slate-700 ring-1 ring-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:ring-slate-800">
                    {JSON.stringify(r.new_record, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
