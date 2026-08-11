"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, Button, Alerta, EstadoVacio, ModuleHeader } from "./ui";
import { TrashIcon } from "@/app/components/icons";
import type { Rol } from "./types";
import {
  listarPapelera,
  restaurarRegistro,
  purgarRegistro,
  type PapeleraItem,
} from "./papelera-actions";

/** Tipos (etiqueta de origen) que devuelve la action, en orden de filtro. */
const TIPOS = [
  "Finanzas",
  "Fichas",
  "Inventario",
  "Asistencia",
  "Cultos",
  "Consolidación",
];

const TIPO_META: Record<string, string> = {
  Finanzas:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  Fichas:
    "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950/40 dark:text-fuchsia-300",
  Inventario:
    "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300",
  Asistencia:
    "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  Cultos:
    "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
  Consolidación:
    "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
};
const BADGE_NEUTRO = "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";

function fmtFecha(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const clave = (i: PapeleraItem) => `${i.tabla}:${i.id}`;

export default function PapeleraModule({ rol }: { rol: Rol }) {
  const esAdmin = rol === "admin";

  const [items, setItems] = useState<PapeleraItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fTipo, setFTipo] = useState("todos");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [procesando, setProcesando] = useState<Set<string>>(new Set());

  useEffect(() => {
    let vivo = true;
    (async () => {
      const res = await listarPapelera();
      if (!vivo) return;
      if (res.ok && res.data) setItems(res.data);
      else setMsg({ ok: false, text: res.error ?? "No se pudo cargar la papelera." });
      setLoading(false);
    })();
    return () => {
      vivo = false;
    };
  }, []);

  const conteos = useMemo(() => {
    const m: Record<string, number> = {};
    for (const i of items) m[i.tipo] = (m[i.tipo] ?? 0) + 1;
    return m;
  }, [items]);

  const filtrados = useMemo(
    () => (fTipo === "todos" ? items : items.filter((i) => i.tipo === fTipo)),
    [items, fTipo],
  );

  function marcar(k: string, on: boolean) {
    setProcesando((s) => {
      const n = new Set(s);
      if (on) n.add(k);
      else n.delete(k);
      return n;
    });
  }

  async function restaurar(i: PapeleraItem) {
    if (!confirm(`¿Restaurar "${i.etiqueta}"? Volverá a aparecer en su módulo.`))
      return;
    const k = clave(i);
    marcar(k, true);
    setMsg(null);
    const res = await restaurarRegistro(i.tabla, i.id);
    if (res.ok) {
      setItems((l) => l.filter((x) => clave(x) !== k));
      setMsg({ ok: true, text: `Restaurado: ${i.etiqueta}.` });
    } else {
      setMsg({ ok: false, text: res.error ?? "No se pudo restaurar." });
    }
    marcar(k, false);
  }

  async function purgar(i: PapeleraItem) {
    if (
      !confirm(
        `¿ELIMINAR DEFINITIVAMENTE "${i.etiqueta}"?\n\nEsta acción es irreversible: el registro se borrará para siempre.`,
      )
    )
      return;
    if (!confirm("Confirmación final. No hay vuelta atrás. ¿Continuar?")) return;
    const k = clave(i);
    marcar(k, true);
    setMsg(null);
    const res = await purgarRegistro(i.tabla, i.id);
    if (res.ok) {
      setItems((l) => l.filter((x) => clave(x) !== k));
      setMsg({ ok: true, text: `Eliminado definitivamente: ${i.etiqueta}.` });
    } else {
      setMsg({ ok: false, text: res.error ?? "No se pudo eliminar." });
    }
    marcar(k, false);
  }

  return (
    <div>
      <ModuleHeader
        icon={<TrashIcon className="h-6 w-6" />}
        titulo="Papelera"
        descripcion="Registros eliminados. Restaura lo que se borró por error o elimínalo de forma definitiva."
      />

      {msg && (
        <div className="mb-5">
          <Alerta ok={msg.ok}>{msg.text}</Alerta>
        </div>
      )}

      {/* KPIs: total + desglose por tipo */}
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <Card className="p-5">
          <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {items.length}
          </p>
          <p className="mt-0.5 text-sm font-medium text-slate-500 dark:text-slate-400">
            En la papelera
          </p>
        </Card>
        {TIPOS.map((t) => (
          <Card key={t} className="p-5">
            <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {conteos[t] ?? 0}
            </p>
            <p className="mt-0.5 text-sm font-medium text-slate-500 dark:text-slate-400">
              {t}
            </p>
          </Card>
        ))}
      </div>

      {/* Filtros por tipo */}
      <div className="mb-5 mt-6 flex flex-wrap items-center gap-2">
        <FiltroChip
          label="Todos"
          n={items.length}
          activo={fTipo === "todos"}
          onClick={() => setFTipo("todos")}
        />
        {TIPOS.map((t) => (
          <FiltroChip
            key={t}
            label={t}
            n={conteos[t] ?? 0}
            activo={fTipo === t}
            onClick={() => setFTipo(t)}
          />
        ))}
      </div>

      <Card className="p-0 sm:p-0">
        {loading ? (
          <div className="p-6">
            <EstadoVacio loading>Cargando papelera…</EstadoVacio>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="p-6">
            <EstadoVacio>
              {items.length === 0
                ? "La papelera está vacía. Nada eliminado por recuperar. 🎉"
                : "Ningún registro coincide con el filtro."}
            </EstadoVacio>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="px-5 py-3">Tipo</th>
                  <th className="px-5 py-3">Descripción</th>
                  <th className="px-5 py-3">Detalle</th>
                  <th className="px-5 py-3">Eliminado el</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((i) => {
                  const k = clave(i);
                  const busy = procesando.has(k);
                  return (
                    <tr
                      key={k}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70 dark:border-slate-800 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${TIPO_META[i.tipo] ?? BADGE_NEUTRO}`}
                        >
                          {i.tipo}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">
                        {i.etiqueta}
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                        {i.detalle}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                        {fmtFecha(i.eliminado_at)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            loading={busy}
                            onClick={() => restaurar(i)}
                            className="px-4 py-2"
                          >
                            Restaurar
                          </Button>
                          {esAdmin && (
                            <Button
                              type="button"
                              variant="danger"
                              disabled={busy}
                              onClick={() => purgar(i)}
                              className="px-4 py-2"
                            >
                              <TrashIcon className="h-4 w-4" />
                              Eliminar def.
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
        Restaurar está disponible para administradores y pastores.
        {esAdmin
          ? " La eliminación definitiva es irreversible."
          : " Solo un administrador puede eliminar definitivamente."}
      </p>
    </div>
  );
}

function FiltroChip({
  label,
  n,
  activo,
  onClick,
}: {
  label: string;
  n: number;
  activo: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
        activo
          ? "border-blue-600 bg-blue-700 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600"
      }`}
    >
      {label}
      <span
        className={`rounded-full px-1.5 text-xs ${
          activo
            ? "bg-white/20 text-white"
            : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300"
        }`}
      >
        {n}
      </span>
    </button>
  );
}
