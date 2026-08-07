import { IGLESIA, LOGO_URL } from "@/app/data/iglesia";

/**
 * Utilidad compartida de exportación a PDF (L4).
 * Centraliza lo que repetían Finanzas, Turnos, Servicios y Miembros:
 *  · el escapado de texto (`esc`),
 *  · el esqueleto del documento (cabecera con logo, pie, CSS base, @page),
 *  · el auto-print y la apertura de la ventana de impresión.
 * Cada módulo solo aporta su `cuerpo` (tabla/matriz/ficha) y sus `estilos`.
 */

/** Escapa texto para insertarlo de forma segura en el HTML del documento. */
export function esc(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type ExportPdfOpts = {
  /** Nombre corto para la pestaña / <title> (se le añade el nombre de la iglesia). */
  titulo: string;
  /** Título grande del documento (h1). */
  encabezado: string;
  /** Línea bajo el título (periodo, semana, subtítulo…). */
  subtitulo?: string;
  /** HTML del cuerpo, ya construido por el módulo (tabla, matriz, ficha…). */
  cuerpo: string;
  /** CSS extra específico del módulo (sus propias clases). */
  estilos?: string;
  /** Orientación de la página. */
  orientacion?: "vertical" | "horizontal";
  /** Ancho máximo del contenido en px (por defecto 900). */
  ancho?: number;
  /** Margen de página en mm (por defecto 12). */
  margenMm?: number;
};

function documentoHTML(o: ExportPdfOpts): string {
  const ancho = o.ancho ?? 900;
  const margen = o.margenMm ?? 12;
  const page =
    o.orientacion === "horizontal"
      ? `@page{size:landscape;margin:${margen}mm}`
      : `@page{margin:${margen}mm}`;

  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8" />
<title>${esc(o.titulo)} · ${esc(IGLESIA.nombreCorto)}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;background:#fff;padding:32px}
  .wrap{max-width:${ancho}px;margin:0 auto}
  .head{display:flex;align-items:center;gap:18px;border-bottom:4px solid #1e3a8a;padding-bottom:18px}
  .head img{height:66px;width:auto}
  .eyebrow{font-size:11px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#2563eb}
  .head h1{font-size:22px;font-weight:800;margin-top:3px}
  .head .sub{margin-top:4px;font-size:13px;color:#475569}
  .muted{color:#94a3b8}
  .foot{margin-top:26px;text-align:center;font-size:11px;color:#94a3b8}
  ${page}
  @media print{body{padding:0}thead{display:table-header-group}tr{break-inside:avoid}}
  ${o.estilos ?? ""}
</style></head>
<body><div class="wrap">
  <div class="head">
    <img src="${esc(LOGO_URL)}" alt="Logo ${esc(IGLESIA.nombre)}" />
    <div>
      <div class="eyebrow">${esc(IGLESIA.nombre)}</div>
      <h1>${esc(o.encabezado)}</h1>
      ${o.subtitulo ? `<div class="sub">${esc(o.subtitulo)}</div>` : ""}
    </div>
  </div>
  ${o.cuerpo}
  <div class="foot">${esc(IGLESIA.nombre)} · ${esc(IGLESIA.dominio)}</div>
</div>
<script>window.addEventListener('load',function(){setTimeout(function(){window.focus();window.print();},350)});</script>
</body></html>`;
}

/**
 * Abre la ventana de impresión con el documento y dispara print().
 * Devuelve `false` si el navegador bloqueó la ventana emergente.
 */
export function exportarPdf(o: ExportPdfOpts): boolean {
  const win = window.open("", "_blank", "width=1000,height=1000");
  if (!win) return false;
  win.document.write(documentoHTML(o));
  win.document.close();
  return true;
}
