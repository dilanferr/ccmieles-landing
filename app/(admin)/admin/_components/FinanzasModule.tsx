"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
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
  WalletIcon,
  PencilIcon,
  TrashIcon,
  CloseIcon,
  DownloadIcon,
  SearchIcon,
} from "@/app/components/icons";
import { getDb } from "./db";
import { LOGO_URL, IGLESIA } from "@/app/data/iglesia";
import {
  crearTransaccion,
  actualizarTransaccion,
  eliminarTransaccion,
  type TipoTrx,
} from "./finanzas-actions";

type Trx = {
  id: string;
  tipo: TipoTrx;
  monto: number;
  categoria: string;
  descripcion: string;
  metodo_pago: string;
  fecha: string;
  comprobante_url: string;
};

type FilaDB = {
  id: string;
  tipo: TipoTrx;
  monto: number | string;
  categoria: string;
  descripcion: string | null;
  metodo_pago: string | null;
  fecha: string;
  comprobante_url: string | null;
};

const COLS =
  "id, tipo, monto, categoria, descripcion, metodo_pago, fecha, comprobante_url, creado_por, created_at";

const CATEGORIAS = [
  "Diezmo",
  "Ofrenda",
  "Pro-Templo",
  "Evento",
  "Arriendo",
  "Servicios Básicos",
  "Mantención",
  "Ayuda Social",
  "Otros",
];
const METODOS = ["Efectivo", "Transferencia", "Tarjeta", "Otro"];

/** Clases para los <select> de filtros (ancho automático, no full-width). */
const SEL_CLS =
  "rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-8 text-sm text-slate-700 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200";

const RANGOS: { id: string; label: string; corto: string }[] = [
  { id: "mes", label: "Mes actual", corto: "del mes" },
  { id: "trimestre", label: "Trimestre", corto: "del trimestre" },
  { id: "anio", label: "Año", corto: "del año" },
  { id: "todo", label: "Histórico", corto: "histórico" },
];

const VACIO = {
  tipo: "ingreso" as TipoTrx,
  monto: "",
  categoria: "Ofrenda",
  metodo_pago: "Efectivo",
  fecha: new Date().toISOString().slice(0, 10),
  descripcion: "",
  comprobante_url: "",
};

/* ---------- helpers ---------- */

const clpFmt = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});
const clp = (n: number) => clpFmt.format(n || 0);

function fmtFecha(iso: string) {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Fecha "desde" (YYYY-MM-DD) según el rango elegido; "" = sin límite. */
function desdeDeRango(rango: string): string {
  const n = new Date();
  const y = n.getFullYear();
  if (rango === "mes") return `${y}-${String(n.getMonth() + 1).padStart(2, "0")}-01`;
  if (rango === "trimestre") {
    const mesInicio = Math.floor(n.getMonth() / 3) * 3;
    return `${y}-${String(mesInicio + 1).padStart(2, "0")}-01`;
  }
  if (rango === "anio") return `${y}-01-01`;
  return "";
}

function esc(s: string) {
  return (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function desdeDB(r: FilaDB): Trx {
  return {
    id: String(r.id),
    tipo: r.tipo,
    monto: Number(r.monto) || 0,
    categoria: r.categoria,
    descripcion: r.descripcion ?? "",
    metodo_pago: r.metodo_pago ?? "",
    fecha: r.fecha,
    comprobante_url: r.comprobante_url ?? "",
  };
}

/** Reporte de balance para imprimir / guardar como PDF. */
function balanceHTML(
  filas: Trx[],
  periodo: string,
  ingresos: number,
  egresos: number,
) {
  const balance = ingresos - egresos;
  const rows = filas
    .map(
      (t) => `<tr>
      <td>${esc(fmtFecha(t.fecha))}</td>
      <td><span class="tag ${t.tipo}">${t.tipo === "ingreso" ? "Ingreso" : "Egreso"}</span></td>
      <td>${esc(t.categoria)}</td>
      <td>${t.descripcion ? esc(t.descripcion) : "<span class='muted'>—</span>"}</td>
      <td>${esc(t.metodo_pago || "—")}</td>
      <td class="num ${t.tipo}">${t.tipo === "egreso" ? "-" : ""}${esc(clp(t.monto))}</td>
    </tr>`,
    )
    .join("");

  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8" />
<title>Balance · ${esc(IGLESIA.nombreCorto)}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;background:#fff;padding:32px}
  .wrap{max-width:900px;margin:0 auto}
  .head{display:flex;align-items:center;gap:18px;border-bottom:4px solid #1e3a8a;padding-bottom:18px}
  .head img{height:66px}
  .eyebrow{font-size:11px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#2563eb}
  .head h1{font-size:22px;font-weight:800;margin-top:3px}
  .head .sub{margin-top:4px;font-size:13px;color:#475569}
  .kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:22px}
  .kpi{border:1px solid #e2e8f0;border-radius:12px;padding:14px 16px}
  .kpi .l{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#94a3b8}
  .kpi .v{font-size:22px;font-weight:800;margin-top:4px}
  .kpi .v.in{color:#059669}.kpi .v.eg{color:#dc2626}
  .kpi .v.pos{color:#059669}.kpi .v.neg{color:#dc2626}
  table{width:100%;border-collapse:collapse;margin-top:24px;font-size:12px}
  thead th{background:#1e3a8a;color:#fff;text-align:left;padding:9px 12px;font-size:10px;text-transform:uppercase;letter-spacing:.04em}
  thead th:last-child{text-align:right}
  tbody td{padding:9px 12px;border-bottom:1px solid #e9eef5}
  tbody tr:nth-child(even){background:#f8fafc}
  .num{text-align:right;font-weight:700;font-variant-numeric:tabular-nums}
  .num.ingreso{color:#059669}.num.egreso{color:#dc2626}
  .tag{display:inline-block;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:700}
  .tag.ingreso{background:#ecfdf5;color:#059669}.tag.egreso{background:#fef2f2;color:#dc2626}
  .muted{color:#94a3b8}
  .foot{margin-top:26px;text-align:center;font-size:11px;color:#94a3b8}
  @page{margin:12mm}
  @media print{body{padding:0}thead{display:table-header-group}tr{break-inside:avoid}}
</style></head>
<body><div class="wrap">
  <div class="head">
    <img src="${esc(LOGO_URL)}" alt="Logo" />
    <div>
      <div class="eyebrow">${esc(IGLESIA.nombre)}</div>
      <h1>Rendición de Cuentas · Balance</h1>
      <div class="sub">Periodo: ${esc(periodo)} · Documento confidencial</div>
    </div>
  </div>
  <div class="kpis">
    <div class="kpi"><div class="l">Total Ingresos</div><div class="v in">${esc(clp(ingresos))}</div></div>
    <div class="kpi"><div class="l">Total Egresos</div><div class="v eg">${esc(clp(egresos))}</div></div>
    <div class="kpi"><div class="l">Balance Neto</div><div class="v ${balance >= 0 ? "pos" : "neg"}">${esc(clp(balance))}</div></div>
  </div>
  <table>
    <thead><tr>
      <th>Fecha</th><th>Tipo</th><th>Categoría</th><th>Descripción</th><th>Método</th><th>Monto</th>
    </tr></thead>
    <tbody>${rows || '<tr><td colspan="6" class="muted" style="padding:20px;text-align:center">Sin movimientos en el periodo.</td></tr>'}</tbody>
  </table>
  <div class="foot">${esc(IGLESIA.nombre)} · ${esc(IGLESIA.dominio)}</div>
</div>
<script>window.addEventListener('load',function(){setTimeout(function(){window.focus();window.print();},350)});</script>
</body></html>`;
}

export default function FinanzasModule() {
  const supabase = getDb();
  const [lista, setLista] = useState<Trx[]>([]);
  const [loading, setLoading] = useState(true);

  const [rango, setRango] = useState("mes");
  const [fTipo, setFTipo] = useState("todos");
  const [fCat, setFCat] = useState("todas");
  const [q, setQ] = useState("");

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(VACIO);
  const [editId, setEditId] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const set = (k: keyof typeof VACIO) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const cerrar = useCallback(() => {
    setModal(false);
    setEditId(null);
  }, []);

  useEffect(() => {
    let activo = true;
    (async () => {
      const { data, error } = await supabase
        .from("transacciones_financieras")
        .select(COLS)
        .is("eliminado_at", null)
        .order("fecha", { ascending: false })
        .order("created_at", { ascending: false });
      if (!activo) return;
      if (!error && data) setLista((data as FilaDB[]).map(desdeDB));
      setLoading(false);
    })();
    return () => {
      activo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [modal, cerrar]);

  // Transacciones dentro del rango de fechas (base para KPIs y tabla).
  const enRango = useMemo(() => {
    const desde = desdeDeRango(rango);
    return desde ? lista.filter((t) => t.fecha >= desde) : lista;
  }, [lista, rango]);

  // KPIs del periodo (solo dependen del rango, no de los filtros de la tabla).
  const kpis = useMemo(() => {
    let ingresos = 0;
    let egresos = 0;
    const porCat: Record<string, number> = {};
    for (const t of enRango) {
      if (t.tipo === "ingreso") ingresos += t.monto;
      else egresos += t.monto;
      porCat[t.categoria] = (porCat[t.categoria] ?? 0) + t.monto;
    }
    const categorias = Object.entries(porCat)
      .map(([categoria, total]) => ({ categoria, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
    return { ingresos, egresos, balance: ingresos - egresos, categorias };
  }, [enRango]);

  const maxCat = kpis.categorias[0]?.total || 1;

  // Tabla: rango + filtros de tipo/categoría/búsqueda.
  const filtradas = useMemo(() => {
    const t = q.trim().toLowerCase();
    return enRango
      .filter((x) => fTipo === "todos" || x.tipo === fTipo)
      .filter((x) => fCat === "todas" || x.categoria === fCat)
      .filter((x) =>
        !t
          ? true
          : `${x.descripcion} ${x.categoria}`.toLowerCase().includes(t),
      );
  }, [enRango, fTipo, fCat, q]);

  function abrir() {
    setForm(VACIO);
    setEditId(null);
    setMsg(null);
    setModal(true);
  }

  function editar(t: Trx) {
    setForm({
      tipo: t.tipo,
      monto: String(t.monto),
      categoria: t.categoria,
      metodo_pago: t.metodo_pago || "Efectivo",
      fecha: t.fecha,
      descripcion: t.descripcion,
      comprobante_url: t.comprobante_url,
    });
    setEditId(t.id);
    setMsg(null);
    setModal(true);
  }

  async function guardar(e: FormEvent) {
    e.preventDefault();
    const monto = Number(form.monto);
    if (!Number.isFinite(monto) || monto <= 0) {
      setMsg({ ok: false, text: "Ingresa un monto válido mayor a 0." });
      return;
    }
    setGuardando(true);
    const input = {
      tipo: form.tipo,
      monto,
      categoria: form.categoria,
      descripcion: form.descripcion || null,
      metodo_pago: form.metodo_pago || null,
      fecha: form.fecha,
      comprobante_url: form.comprobante_url || null,
    };
    const res = editId
      ? await actualizarTransaccion(editId, input)
      : await crearTransaccion(input);
    setGuardando(false);
    if (!res.ok || !res.data) {
      setMsg({
        ok: false,
        text:
          res.error ??
          (editId
            ? "No se pudo actualizar la transacción."
            : "No se pudo registrar la transacción."),
      });
      return;
    }
    const fila = desdeDB(res.data as FilaDB);
    setLista((l) =>
      editId ? l.map((t) => (t.id === editId ? fila : t)) : [fila, ...l],
    );
    setModal(false);
    setEditId(null);
    setMsg({
      ok: true,
      text: editId ? "Transacción actualizada." : "Transacción registrada.",
    });
  }

  async function quitar(t: Trx) {
    if (!confirm(`¿Eliminar este ${t.tipo} de ${clp(t.monto)}?`)) return;
    const res = await eliminarTransaccion(t.id);
    if (!res.ok) {
      setMsg({ ok: false, text: res.error ?? "No se pudo eliminar." });
      return;
    }
    setLista((l) => l.filter((x) => x.id !== t.id));
    if (editId === t.id) cerrar();
    setMsg({ ok: true, text: "Transacción eliminada." });
  }

  function exportar() {
    const win = window.open("", "_blank", "width=940,height=1000");
    if (!win) {
      setMsg({
        ok: false,
        text: "Permite las ventanas emergentes para exportar el balance.",
      });
      return;
    }
    const periodo = RANGOS.find((r) => r.id === rango)?.label ?? "Histórico";
    win.document.write(
      balanceHTML(filtradas, periodo, kpis.ingresos, kpis.egresos),
    );
    win.document.close();
  }

  const periodoCorto = RANGOS.find((r) => r.id === rango)?.corto ?? "";

  return (
    <div>
      <ModuleHeader
        icon={<WalletIcon className="h-6 w-6" />}
        titulo="Tesorería y Finanzas"
        descripcion="Control de ingresos, egresos y balance de la iglesia."
        accion={
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={exportar}
              disabled={loading}
            >
              <DownloadIcon className="h-4 w-4" />
              Exportar Balance
            </Button>
            <Button type="button" onClick={abrir}>
              + Nueva transacción
            </Button>
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Ingresos {periodoCorto}
          </p>
          <p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {clp(kpis.ingresos)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Egresos {periodoCorto}
          </p>
          <p className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">
            {clp(kpis.egresos)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Balance Neto
          </p>
          <p
            className={`mt-2 text-3xl font-bold ${
              kpis.balance >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {clp(kpis.balance)}
          </p>
        </Card>
      </div>

      {/* Desglose por categoría */}
      <Card className="mt-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Desglose por categoría {periodoCorto}
        </h3>
        {kpis.categorias.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">Sin movimientos.</p>
        ) : (
          <ul className="mt-4 space-y-2.5">
            {kpis.categorias.map((c) => (
              <li key={c.categoria} className="flex items-center gap-3 text-sm">
                <span className="w-32 shrink-0 truncate font-medium text-slate-700 dark:text-slate-300">
                  {c.categoria}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-blue-600 to-sky-500"
                    style={{ width: `${(c.total / maxCat) * 100}%` }}
                  />
                </div>
                <span className="w-28 shrink-0 text-right font-semibold tabular-nums text-slate-600 dark:text-slate-300">
                  {clp(c.total)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Filtros */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <select
          value={rango}
          onChange={(e) => setRango(e.target.value)}
          className={SEL_CLS}
        >
          {RANGOS.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
        <select
          value={fTipo}
          onChange={(e) => setFTipo(e.target.value)}
          className={SEL_CLS}
        >
          <option value="todos">Todos</option>
          <option value="ingreso">Ingresos</option>
          <option value="egreso">Egresos</option>
        </select>
        <select
          value={fCat}
          onChange={(e) => setFCat(e.target.value)}
          className={SEL_CLS}
        >
          <option value="todas">Todas las categorías</option>
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div className="relative min-w-52 flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por descripción o categoría…"
            className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Tabla */}
      <Card className="mt-4 p-0 sm:p-0">
        {loading ? (
          <div className="p-6">
            <EstadoVacio loading>Cargando movimientos…</EstadoVacio>
          </div>
        ) : filtradas.length === 0 ? (
          <div className="p-6">
            <EstadoVacio>No hay movimientos para estos filtros.</EstadoVacio>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="px-5 py-3">Fecha</th>
                  <th className="px-5 py-3">Tipo</th>
                  <th className="px-5 py-3">Categoría</th>
                  <th className="px-5 py-3">Descripción</th>
                  <th className="px-5 py-3">Método</th>
                  <th className="px-5 py-3 text-right">Monto</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map((t) => (
                  <tr
                    key={t.id}
                    className={`border-b border-slate-100 transition-colors last:border-0 dark:border-slate-800 ${
                      editId === t.id
                        ? "bg-blue-50/70 dark:bg-blue-950/30"
                        : "hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                      {fmtFecha(t.fecha)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${
                          t.tipo === "ingreso"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                        }`}
                      >
                        {t.tipo === "ingreso" ? "Ingreso" : "Egreso"}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-700 dark:text-slate-300">
                      {t.categoria}
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                      {t.descripcion || <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                      {t.metodo_pago || "—"}
                    </td>
                    <td
                      className={`px-5 py-4 text-right font-bold tabular-nums ${
                        t.tipo === "ingreso"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {t.tipo === "egreso" ? "-" : "+"}
                      {clp(t.monto)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => editar(t)}
                          aria-label="Editar"
                          className="inline-grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                        >
                          <PencilIcon className="h-4.5 w-4.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => quitar(t)}
                          aria-label="Eliminar"
                          className="inline-grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <TrashIcon className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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

      {!loading && (
        <p className="mt-3 text-xs text-slate-400">
          {filtradas.length}{" "}
          {filtradas.length === 1 ? "movimiento" : "movimientos"} · Balance del
          periodo: {clp(kpis.balance)}
        </p>
      )}

      {/* Modal crear / editar */}
      {modal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Transacción"
          className="fixed inset-0 z-50 grid place-items-start justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm sm:place-items-center"
          onClick={cerrar}
        >
          <div
            className="my-4 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:p-7"
            onClick={(ev) => ev.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editId ? "Editar transacción" : "Nueva transacción"}
              </h2>
              <button
                type="button"
                onClick={cerrar}
                aria-label="Cerrar"
                className="grid h-9 w-9 place-items-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={guardar} className="mt-5 space-y-4">
              {/* Selector de tipo */}
              <div className="grid grid-cols-2 gap-2">
                {(["ingreso", "egreso"] as TipoTrx[]).map((tp) => {
                  const activo = form.tipo === tp;
                  const esIn = tp === "ingreso";
                  return (
                    <button
                      key={tp}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, tipo: tp }))}
                      className={`rounded-xl border px-4 py-2.5 text-sm font-bold transition-all ${
                        activo && esIn
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : activo
                            ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                            : "border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-700"
                      }`}
                    >
                      {esIn ? "Ingreso" : "Egreso"}
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Monto (CLP)">
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    value={form.monto}
                    onChange={set("monto")}
                    placeholder="Ej: 50000"
                  />
                </Field>
                <Field label="Fecha">
                  <Input type="date" value={form.fecha} onChange={set("fecha")} />
                </Field>
                <Field label="Categoría">
                  <Select value={form.categoria} onChange={set("categoria")}>
                    {CATEGORIAS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Método de pago">
                  <Select value={form.metodo_pago} onChange={set("metodo_pago")}>
                    {METODOS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <Field label="Descripción / Concepto" hint="Opcional">
                <Textarea
                  value={form.descripcion}
                  onChange={set("descripcion")}
                  placeholder="Ej: Ofrenda culto dominical / Pago cuenta de luz"
                />
              </Field>

              <Field label="Comprobante (URL)" hint="Opcional · boleta o factura">
                <Input
                  value={form.comprobante_url}
                  onChange={set("comprobante_url")}
                  placeholder="https://…"
                />
              </Field>

              {msg && !msg.ok && <Alerta ok={false}>{msg.text}</Alerta>}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={cerrar}
                  disabled={guardando}
                >
                  Cancelar
                </Button>
                <Button type="submit" loading={guardando}>
                  {editId ? "Guardar cambios" : "Registrar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
