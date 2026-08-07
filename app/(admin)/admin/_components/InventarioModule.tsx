"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Card,
  Field,
  Input,
  Textarea,
  Select,
  Button,
  Alerta,
  EstadoVacio,
  ModuleHeader,
} from "./ui";
import {
  BoxIcon,
  PencilIcon,
  TrashIcon,
  CloseIcon,
  ExchangeIcon,
} from "@/app/components/icons";
import { getDb } from "./db";
import ImageUploader from "./ImageUploader";
import {
  crearBien,
  actualizarBien,
  eliminarBien,
  type BienInput,
  type BienRow,
  type EstadoBien,
} from "./inventario-actions";
import {
  crearPrestamo,
  registrarDevolucion,
  type PrestamoRow,
} from "./prestamos-actions";

type Bien = {
  id: string;
  nombre: string;
  categoria: string;
  cantidad: number;
  estado: EstadoBien;
  ubicacion: string | null;
  responsable_id: string | null;
  valor: number;
  fecha_adquisicion: string | null;
  nro_serie: string | null;
  foto_url: string | null;
  notas: string | null;
};

type Prestamo = {
  id: string;
  bien_id: string;
  miembro_id: string | null;
  cantidad: number;
  fecha_prestamo: string;
  fecha_devolucion_esperada: string | null;
  fecha_devolucion_real: string | null;
};

const COLS =
  "id, nombre, categoria, cantidad, estado, ubicacion, responsable_id, valor, fecha_adquisicion, nro_serie, foto_url, notas";
const PCOLS =
  "id, bien_id, miembro_id, cantidad, fecha_prestamo, fecha_devolucion_esperada, fecha_devolucion_real";

const ESTADOS: EstadoBien[] = ["nuevo", "bueno", "regular", "reparacion", "baja"];
const ESTADO_META: Record<EstadoBien, { label: string; cls: string }> = {
  nuevo: {
    label: "Nuevo",
    cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  bueno: {
    label: "Bueno",
    cls: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  },
  regular: {
    label: "Regular",
    cls: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  },
  reparacion: {
    label: "En reparación",
    cls: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
  },
  baja: {
    label: "De baja",
    cls: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  },
};

const clp = (n: number) => "$" + Math.round(n).toLocaleString("es-CL");
const fmtFecha = (s: string | null) => {
  if (!s) return "—";
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
};
function hoyISO() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const SEL =
  "rounded-lg border border-slate-200 bg-white py-1.5 pl-2.5 pr-7 text-sm text-slate-700 outline-none transition-colors focus:border-blue-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200";

const VACIO = {
  nombre: "",
  categoria: "",
  cantidad: "1",
  estado: "bueno",
  ubicacion: "",
  responsable_id: "",
  valor: "0",
  fecha_adquisicion: "",
  nro_serie: "",
  foto_url: "",
  notas: "",
};
const P_VACIO = {
  miembro_id: "",
  cantidad: "1",
  fecha_prestamo: "",
  fecha_devolucion_esperada: "",
  notas: "",
};

export default function InventarioModule() {
  const supabase = getDb();
  const [lista, setLista] = useState<Bien[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [directorio, setDirectorio] = useState<{ id: string; nombre: string }[]>(
    [],
  );
  const [abiertos, setAbiertos] = useState<Prestamo[]>([]); // préstamos vigentes
  const [loading, setLoading] = useState(true);

  const [fCat, setFCat] = useState("todas");
  const [fEstado, setFEstado] = useState("todos");

  // Modal de bien (crear/editar)
  const [abierto, setAbierto] = useState(false);
  const [form, setForm] = useState(VACIO);
  const [editId, setEditId] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Modal de préstamos (por bien)
  const [bienPrestamo, setBienPrestamo] = useState<Bien | null>(null);
  const [hist, setHist] = useState<Prestamo[]>([]);
  const [histLoading, setHistLoading] = useState(false);
  const [pForm, setPForm] = useState(P_VACIO);
  const [pGuardando, setPGuardando] = useState(false);
  const [pMsg, setPMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    let vivo = true;
    (async () => {
      const [bienesRes, catRes, dirRes, presRes] = await Promise.all([
        supabase
          .from("bienes")
          .select(COLS)
          .is("eliminado_at", null)
          .order("nombre", { ascending: true }),
        supabase
          .from("categorias_bien")
          .select("nombre")
          .eq("activo", true)
          .order("orden", { ascending: true }),
        supabase.rpc("directorio_miembros"),
        supabase.from("prestamos_bienes").select(PCOLS).is("fecha_devolucion_real", null),
      ]);
      if (!vivo) return;
      if (bienesRes.data) setLista(bienesRes.data as Bien[]);
      setCategorias(
        ((catRes.data as { nombre: string }[]) ?? []).map((c) => c.nombre),
      );
      setDirectorio((dirRes.data as { id: string; nombre: string }[]) ?? []);
      setAbiertos((presRes.data as Prestamo[]) ?? []);
      setLoading(false);
    })();
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nombreResponsable = useMemo(() => {
    const m = new Map(directorio.map((d) => [d.id, d.nombre]));
    return (id: string | null) => (id ? (m.get(id) ?? "—") : "—");
  }, [directorio]);

  const porBien = useMemo(() => {
    const m = new Map<string, Prestamo[]>();
    for (const p of abiertos) {
      const arr = m.get(p.bien_id) ?? [];
      arr.push(p);
      m.set(p.bien_id, arr);
    }
    return m;
  }, [abiertos]);

  const filtrados = useMemo(
    () =>
      lista.filter(
        (b) =>
          (fCat === "todas" || b.categoria === fCat) &&
          (fEstado === "todos" || b.estado === fEstado),
      ),
    [lista, fCat, fEstado],
  );

  const kpis = useMemo(() => {
    let valor = 0;
    let reparacion = 0;
    for (const b of lista) {
      valor += b.valor * (b.cantidad || 1);
      if (b.estado === "reparacion") reparacion++;
    }
    return { items: lista.length, valor, reparacion, prestados: abiertos.length };
  }, [lista, abiertos]);

  const set = (k: keyof typeof VACIO) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));
  const setP = (k: keyof typeof P_VACIO) => (e: { target: { value: string } }) =>
    setPForm((f) => ({ ...f, [k]: e.target.value }));

  // ---- CRUD de bienes ----
  function abrirNuevo() {
    setEditId(null);
    setForm({ ...VACIO, categoria: categorias[0] ?? "" });
    setMsg(null);
    setAbierto(true);
  }
  function editar(b: Bien) {
    setEditId(b.id);
    setForm({
      nombre: b.nombre,
      categoria: b.categoria,
      cantidad: String(b.cantidad),
      estado: b.estado,
      ubicacion: b.ubicacion ?? "",
      responsable_id: b.responsable_id ?? "",
      valor: String(b.valor),
      fecha_adquisicion: b.fecha_adquisicion ?? "",
      nro_serie: b.nro_serie ?? "",
      foto_url: b.foto_url ?? "",
      notas: b.notas ?? "",
    });
    setMsg(null);
    setAbierto(true);
  }
  function cerrar() {
    setAbierto(false);
    setEditId(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setMsg(null);
    const input: BienInput = {
      nombre: form.nombre,
      categoria: form.categoria,
      cantidad: Number(form.cantidad),
      estado: form.estado as EstadoBien,
      ubicacion: form.ubicacion || null,
      responsable_id: form.responsable_id || null,
      valor: Number(form.valor),
      fecha_adquisicion: form.fecha_adquisicion || null,
      nro_serie: form.nro_serie || null,
      foto_url: form.foto_url || null,
      notas: form.notas || null,
    };
    const res = editId
      ? await actualizarBien(editId, input)
      : await crearBien(input);
    setGuardando(false);
    if (!res.ok || !res.data) {
      setMsg({ ok: false, text: res.error ?? "No se pudo guardar el bien." });
      return;
    }
    const fila = res.data as BienRow as Bien;
    setLista((l) =>
      editId ? l.map((b) => (b.id === editId ? fila : b)) : [fila, ...l],
    );
    setMsg({ ok: true, text: editId ? "Bien actualizado." : "Bien registrado." });
    cerrar();
  }

  async function quitar(b: Bien) {
    if (!confirm(`¿Eliminar "${b.nombre}" del inventario?`)) return;
    const res = await eliminarBien(b.id);
    if (!res.ok) {
      setMsg({ ok: false, text: res.error ?? "No se pudo eliminar." });
      return;
    }
    setLista((l) => l.filter((x) => x.id !== b.id));
    setMsg({ ok: true, text: "Bien eliminado del inventario." });
  }

  // ---- Préstamos ----
  async function abrirPrestamos(b: Bien) {
    setBienPrestamo(b);
    setPForm({ ...P_VACIO, fecha_prestamo: hoyISO() });
    setPMsg(null);
    setHistLoading(true);
    setHist([]);
    const { data } = await supabase
      .from("prestamos_bienes")
      .select(PCOLS)
      .eq("bien_id", b.id)
      .order("fecha_prestamo", { ascending: false });
    setHist((data as Prestamo[]) ?? []);
    setHistLoading(false);
  }

  async function submitPrestamo(e: FormEvent) {
    e.preventDefault();
    if (!bienPrestamo) return;
    setPGuardando(true);
    setPMsg(null);
    const res = await crearPrestamo({
      bien_id: bienPrestamo.id,
      miembro_id: pForm.miembro_id || null,
      cantidad: Number(pForm.cantidad),
      fecha_prestamo: pForm.fecha_prestamo || hoyISO(),
      fecha_devolucion_esperada: pForm.fecha_devolucion_esperada || null,
      notas: pForm.notas || null,
    });
    setPGuardando(false);
    if (!res.ok || !res.data) {
      setPMsg({ ok: false, text: res.error ?? "No se pudo registrar el préstamo." });
      return;
    }
    const nuevo = res.data as PrestamoRow as Prestamo;
    setHist((h) => [nuevo, ...h]);
    setAbiertos((a) => [...a, nuevo]);
    setPForm({ ...P_VACIO, fecha_prestamo: hoyISO() });
    setPMsg({ ok: true, text: "Préstamo registrado." });
  }

  async function devolver(p: Prestamo) {
    const res = await registrarDevolucion(p.id);
    if (!res.ok || !res.data) {
      setPMsg({ ok: false, text: res.error ?? "No se pudo registrar la devolución." });
      return;
    }
    const dev = res.data as PrestamoRow as Prestamo;
    setHist((h) => h.map((x) => (x.id === p.id ? dev : x)));
    setAbiertos((a) => a.filter((x) => x.id !== p.id));
    setPMsg({ ok: true, text: "Devolución registrada." });
  }

  const kpiCards = [
    { label: "Ítems registrados", valor: String(kpis.items) },
    { label: "Valor total", valor: clp(kpis.valor) },
    { label: "Prestados", valor: String(kpis.prestados) },
    { label: "En reparación", valor: String(kpis.reparacion) },
  ];

  const vigentes = hist.filter((p) => !p.fecha_devolucion_real);
  const historial = hist.filter((p) => p.fecha_devolucion_real);

  return (
    <div>
      <ModuleHeader
        icon={<BoxIcon className="h-6 w-6" />}
        titulo="Inventario y Bienes"
        descripcion="Catálogo de bienes de la iglesia, su estado, valorización y préstamos."
      />

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((k) => (
          <Card key={k.label} className="p-5">
            <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {k.valor}
            </p>
            <p className="mt-0.5 text-sm font-medium text-slate-500 dark:text-slate-400">
              {k.label}
            </p>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="mb-5 mt-6 flex flex-wrap items-center gap-3">
        <select value={fCat} onChange={(e) => setFCat(e.target.value)} className={SEL}>
          <option value="todas">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={fEstado}
          onChange={(e) => setFEstado(e.target.value)}
          className={SEL}
        >
          <option value="todos">Todos los estados</option>
          {ESTADOS.map((s) => (
            <option key={s} value={s}>
              {ESTADO_META[s].label}
            </option>
          ))}
        </select>
        <span className="text-sm text-slate-400">
          {filtrados.length} {filtrados.length === 1 ? "bien" : "bienes"}
        </span>
        <Button type="button" onClick={abrirNuevo} className="ml-auto">
          + Nuevo bien
        </Button>
      </div>

      <Card className="p-0 sm:p-0">
        {loading ? (
          <div className="p-6">
            <EstadoVacio loading>Cargando inventario…</EstadoVacio>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="p-6">
            <EstadoVacio>
              {lista.length === 0
                ? "Aún no hay bienes registrados."
                : "Ningún bien coincide con los filtros."}
            </EstadoVacio>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="px-5 py-3">Bien</th>
                  <th className="px-5 py-3">Categoría</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3">Disponibilidad</th>
                  <th className="px-5 py-3 text-right">Valor</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((b) => {
                  const abiertosB = porBien.get(b.id) ?? [];
                  return (
                    <tr
                      key={b.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70 dark:border-slate-800 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {b.foto_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={b.foto_url}
                              alt=""
                              className="h-10 w-10 shrink-0 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                            />
                          ) : (
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-400 dark:bg-slate-800">
                              <BoxIcon className="h-5 w-5" />
                            </span>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {b.nombre}
                            </p>
                            <p className="text-xs text-slate-400">
                              {b.categoria}
                              {b.nro_serie ? ` · N° ${b.nro_serie}` : ""}
                              {b.cantidad > 1 ? ` · x${b.cantidad}` : ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                        {b.categoria}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${ESTADO_META[b.estado].cls}`}
                        >
                          {ESTADO_META[b.estado].label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {abiertosB.length === 0 ? (
                          <span className="inline-block rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                            Disponible
                          </span>
                        ) : (
                          <span
                            className="inline-block rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                            title={abiertosB
                              .map((p) => nombreResponsable(p.miembro_id))
                              .join(", ")}
                          >
                            Prestado a {nombreResponsable(abiertosB[0].miembro_id)}
                            {abiertosB.length > 1 ? ` +${abiertosB.length - 1}` : ""}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right font-semibold tabular-nums text-slate-800 dark:text-slate-100">
                        {clp(b.valor)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => abrirPrestamos(b)}
                            aria-label="Préstamos"
                            title="Préstamos y devoluciones"
                            className="inline-grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-teal-50 hover:text-teal-600"
                          >
                            <ExchangeIcon className="h-4.5 w-4.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => editar(b)}
                            aria-label="Editar"
                            className="inline-grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                          >
                            <PencilIcon className="h-4.5 w-4.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => quitar(b)}
                            aria-label="Eliminar"
                            className="inline-grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          >
                            <TrashIcon className="h-4.5 w-4.5" />
                          </button>
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

      {msg && (
        <div className="mt-4">
          <Alerta ok={msg.ok}>{msg.text}</Alerta>
        </div>
      )}

      {/* Modal crear / editar bien */}
      {abierto && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm sm:p-8">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editId ? "Editar bien" : "Nuevo bien"}
              </h2>
              <button
                type="button"
                onClick={cerrar}
                aria-label="Cerrar"
                className="grid h-9 w-9 place-items-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Field label="Nombre del bien">
                <Input
                  value={form.nombre}
                  onChange={set("nombre")}
                  placeholder="Ej: Guitarra eléctrica, Sillas plegables…"
                  required
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Categoría">
                  <Select value={form.categoria} onChange={set("categoria")} required>
                    <option value="" disabled>
                      Selecciona…
                    </option>
                    {categorias.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Estado">
                  <Select value={form.estado} onChange={set("estado")}>
                    {ESTADOS.map((s) => (
                      <option key={s} value={s}>
                        {ESTADO_META[s].label}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Cantidad">
                  <Input
                    type="number"
                    min={0}
                    value={form.cantidad}
                    onChange={set("cantidad")}
                  />
                </Field>
                <Field label="Valor unitario (CLP)" hint="Opcional">
                  <Input
                    type="number"
                    min={0}
                    value={form.valor}
                    onChange={set("valor")}
                    placeholder="0"
                  />
                </Field>
                <Field label="Ubicación" hint="Opcional">
                  <Input
                    value={form.ubicacion}
                    onChange={set("ubicacion")}
                    placeholder="Ej: Bodega, Templo, Sala de música…"
                  />
                </Field>
                <Field label="Responsable" hint="Opcional">
                  <Select value={form.responsable_id} onChange={set("responsable_id")}>
                    <option value="">Sin responsable</option>
                    {directorio.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nombre}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Fecha de adquisición" hint="Opcional">
                  <Input
                    type="date"
                    value={form.fecha_adquisicion}
                    onChange={set("fecha_adquisicion")}
                  />
                </Field>
                <Field label="N° de serie" hint="Opcional">
                  <Input
                    value={form.nro_serie}
                    onChange={set("nro_serie")}
                    placeholder="Ej: SN-000123"
                  />
                </Field>
              </div>

              <ImageUploader
                value={form.foto_url}
                onChange={(url) => setForm((f) => ({ ...f, foto_url: url }))}
                folder="inventario"
                label="Foto del bien"
                hint="Opcional · se sube y optimiza automáticamente"
              />

              <Field label="Notas" hint="Opcional">
                <Textarea
                  value={form.notas}
                  onChange={set("notas")}
                  placeholder="Observaciones, accesorios, detalles…"
                />
              </Field>

              {msg && !msg.ok && <Alerta ok={false}>{msg.text}</Alerta>}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
                <Button type="button" variant="ghost" onClick={cerrar} disabled={guardando}>
                  Cancelar
                </Button>
                <Button type="submit" loading={guardando}>
                  {editId ? "Guardar cambios" : "Registrar bien"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de préstamos */}
      {bienPrestamo && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm sm:p-8">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 sm:p-8">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Préstamos
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {bienPrestamo.nombre}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBienPrestamo(null)}
                aria-label="Cerrar"
                className="grid h-9 w-9 place-items-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Vigentes */}
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              Préstamos vigentes
            </h3>
            {histLoading ? (
              <p className="text-sm text-slate-400">Cargando…</p>
            ) : vigentes.length === 0 ? (
              <p className="text-sm text-slate-400">
                Sin préstamos activos — el bien está disponible.
              </p>
            ) : (
              <ul className="space-y-2">
                {vigentes.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-amber-100 bg-amber-50/60 px-3 py-2 text-sm dark:border-amber-900/40 dark:bg-amber-950/20"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-slate-100">
                        {nombreResponsable(p.miembro_id)}
                        {p.cantidad > 1 ? ` · x${p.cantidad}` : ""}
                      </p>
                      <p className="text-xs text-slate-500">
                        Desde {fmtFecha(p.fecha_prestamo)}
                        {p.fecha_devolucion_esperada
                          ? ` · devolver el ${fmtFecha(p.fecha_devolucion_esperada)}`
                          : ""}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => devolver(p)}
                      className="shrink-0 px-3 py-1.5 text-xs"
                    >
                      Devolver
                    </Button>
                  </li>
                ))}
              </ul>
            )}

            {/* Nuevo préstamo */}
            <form
              onSubmit={submitPrestamo}
              className="mt-5 space-y-4 border-t border-slate-100 pt-5 dark:border-slate-800"
            >
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Registrar préstamo
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Prestado a">
                  <Select value={pForm.miembro_id} onChange={setP("miembro_id")} required>
                    <option value="" disabled>
                      Selecciona…
                    </option>
                    {directorio.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nombre}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Cantidad">
                  <Input
                    type="number"
                    min={1}
                    value={pForm.cantidad}
                    onChange={setP("cantidad")}
                  />
                </Field>
                <Field label="Fecha de préstamo">
                  <Input
                    type="date"
                    value={pForm.fecha_prestamo}
                    onChange={setP("fecha_prestamo")}
                  />
                </Field>
                <Field label="Devolución esperada" hint="Opcional">
                  <Input
                    type="date"
                    value={pForm.fecha_devolucion_esperada}
                    onChange={setP("fecha_devolucion_esperada")}
                  />
                </Field>
              </div>
              <Field label="Notas" hint="Opcional">
                <Input
                  value={pForm.notas}
                  onChange={setP("notas")}
                  placeholder="Detalle del préstamo…"
                />
              </Field>

              {pMsg && <Alerta ok={pMsg.ok}>{pMsg.text}</Alerta>}

              <div className="flex justify-end">
                <Button type="submit" loading={pGuardando}>
                  Registrar préstamo
                </Button>
              </div>
            </form>

            {/* Historial */}
            {historial.length > 0 && (
              <div className="mt-5 border-t border-slate-100 pt-5 dark:border-slate-800">
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Historial devuelto
                </h3>
                <ul className="space-y-1.5 text-sm">
                  {historial.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between text-slate-500 dark:text-slate-400"
                    >
                      <span>{nombreResponsable(p.miembro_id)}</span>
                      <span className="text-xs">
                        {fmtFecha(p.fecha_prestamo)} → {fmtFecha(p.fecha_devolucion_real)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
