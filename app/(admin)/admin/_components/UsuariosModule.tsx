"use client";

import { useEffect, useState } from "react";
import { Card, Alerta, EstadoVacio, ModuleHeader } from "./ui";
import { LockIcon } from "@/app/components/icons";
import { getDb } from "./db";
import type { Rol } from "./types";
import {
  actualizarRolUsuario,
  cambiarEstadoUsuario,
} from "./usuarios-actions";

type Usuario = {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
  activo: boolean;
};

type FilaDB = {
  id: string;
  nombre: string | null;
  correo: string | null;
  rol: Rol;
  activo: boolean;
};

const ROLES: { id: Rol; label: string; desc: string }[] = [
  { id: "admin", label: "Admin", desc: "Acceso total" },
  { id: "pastor", label: "Pastor", desc: "Acceso total" },
  { id: "tesorero", label: "Tesorero", desc: "Dashboard + Finanzas" },
  { id: "lider", label: "Líder / Servidor", desc: "Dashboard + Servicios" },
  { id: "secretaria", label: "Secretaría", desc: "Dashboard + Fichas + Servicios" },
];
const ROL_LABEL: Record<Rol, string> = {
  admin: "Admin",
  pastor: "Pastor",
  tesorero: "Tesorero",
  lider: "Líder / Servidor",
  secretaria: "Secretaría",
};
const ROL_COLOR: Record<Rol, string> = {
  admin: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  pastor: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  tesorero:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  lider: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  secretaria:
    "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950/40 dark:text-fuchsia-300",
};

const SEL_CLS =
  "rounded-lg border border-slate-200 bg-white py-1.5 pl-2.5 pr-7 text-sm text-slate-700 outline-none transition-colors focus:border-blue-400 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200";

export default function UsuariosModule({ miId }: { miId: string }) {
  const supabase = getDb();
  const [lista, setLista] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    let activo = true;
    (async () => {
      const { data, error } = await supabase
        .from("perfiles")
        .select("id, nombre, correo, rol, activo")
        .order("creado_at", { ascending: true });
      if (!activo) return;
      if (!error && data)
        setLista(
          (data as FilaDB[]).map((r) => ({
            id: r.id,
            nombre: r.nombre ?? "",
            correo: r.correo ?? "",
            rol: r.rol,
            activo: r.activo,
          })),
        );
      setLoading(false);
    })();
    return () => {
      activo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function cambiarRol(u: Usuario, rol: Rol) {
    const previo = u.rol;
    setLista((l) => l.map((x) => (x.id === u.id ? { ...x, rol } : x)));
    const res = await actualizarRolUsuario(u.id, rol);
    if (!res.ok) {
      setLista((l) => l.map((x) => (x.id === u.id ? { ...x, rol: previo } : x)));
      setMsg({ ok: false, text: res.error ?? "No se pudo cambiar el rol." });
      return;
    }
    setMsg({ ok: true, text: `Rol actualizado a ${ROL_LABEL[rol]}.` });
  }

  async function alternarActivo(u: Usuario) {
    const nuevo = !u.activo;
    setLista((l) => l.map((x) => (x.id === u.id ? { ...x, activo: nuevo } : x)));
    const res = await cambiarEstadoUsuario(u.id, nuevo);
    if (!res.ok) {
      setLista((l) =>
        l.map((x) => (x.id === u.id ? { ...x, activo: !nuevo } : x)),
      );
      setMsg({ ok: false, text: res.error ?? "No se pudo cambiar el estado." });
      return;
    }
    setMsg({
      ok: true,
      text: nuevo ? "Usuario activado." : "Usuario desactivado.",
    });
  }

  return (
    <div>
      <ModuleHeader
        icon={<LockIcon className="h-6 w-6" />}
        titulo="Usuarios y Roles"
        descripcion="Controla quién accede a cada sección del panel."
      />

      <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
        Los usuarios se crean en <strong>Supabase → Authentication → Users</strong>.
        Al crearse, aparecen aquí con el rol mínimo (<em>Líder</em>); luego les
        asignas el rol que corresponda.
      </div>

      <Card className="p-0 sm:p-0">
        {loading ? (
          <div className="p-6">
            <EstadoVacio loading>Cargando usuarios…</EstadoVacio>
          </div>
        ) : lista.length === 0 ? (
          <div className="p-6">
            <EstadoVacio>Aún no hay usuarios registrados.</EstadoVacio>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="px-5 py-3">Usuario</th>
                  <th className="px-5 py-3">Rol</th>
                  <th className="px-5 py-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((u) => {
                  const soyYo = u.id === miId;
                  return (
                    <tr
                      key={u.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70 dark:border-slate-800 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {u.correo || u.nombre || "—"}
                          {soyYo && (
                            <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                              tú
                            </span>
                          )}
                        </p>
                        {u.nombre && u.correo && (
                          <p className="text-xs text-slate-400">{u.nombre}</p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`hidden rounded-full px-2.5 py-1 text-xs font-bold sm:inline-block ${ROL_COLOR[u.rol]}`}
                          >
                            {ROL_LABEL[u.rol]}
                          </span>
                          <select
                            value={u.rol}
                            disabled={soyYo}
                            title={
                              soyYo ? "No puedes cambiar tu propio rol" : undefined
                            }
                            onChange={(e) =>
                              cambiarRol(u, e.target.value as Rol)
                            }
                            className={SEL_CLS}
                          >
                            {ROLES.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.label} · {r.desc}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => alternarActivo(u)}
                          disabled={soyYo}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
                            u.activo
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                          title={
                            soyYo ? "No puedes desactivar tu cuenta" : undefined
                          }
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              u.activo ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                          {u.activo ? "Activo" : "Inactivo"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {msg && (
        <div className="mt-4">
          <Alerta ok={msg.ok}>{msg.text}</Alerta>
        </div>
      )}
    </div>
  );
}
