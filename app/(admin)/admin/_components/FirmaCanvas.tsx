"use client";

import { useEffect, useRef, type PointerEvent as RPointerEvent } from "react";

/**
 * Lienzo para capturar una firma digital (mouse o táctil). Emite la imagen
 * como data URL (PNG) por `onChange` al terminar cada trazo. Si recibe `value`
 * (firma existente) la dibuja al montar para poder continuar o conservarla.
 */
export default function FirmaCanvas({
  value,
  onChange,
}: {
  value?: string;
  onChange: (dataUrl: string) => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const dibujando = useRef(false);
  const ultimo = useRef<{ x: number; y: number } | null>(null);

  // Configura el trazo y carga la firma existente (si la hay) una sola vez.
  useEffect(() => {
    const c = ref.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0f172a";
    if (value?.startsWith("data:image")) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, c.width, c.height);
      img.src = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Coordenadas del puntero mapeadas al tamaño real del canvas. */
  function pos(e: RPointerEvent<HTMLCanvasElement>) {
    const c = ref.current!;
    const r = c.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (c.width / r.width),
      y: (e.clientY - r.top) * (c.height / r.height),
    };
  }

  function inicio(e: RPointerEvent<HTMLCanvasElement>) {
    e.preventDefault();
    dibujando.current = true;
    ultimo.current = pos(e);
    ref.current?.setPointerCapture(e.pointerId);
  }

  function mover(e: RPointerEvent<HTMLCanvasElement>) {
    if (!dibujando.current) return;
    const ctx = ref.current!.getContext("2d")!;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(ultimo.current!.x, ultimo.current!.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    ultimo.current = p;
  }

  function fin() {
    if (!dibujando.current) return;
    dibujando.current = false;
    ultimo.current = null;
    onChange(ref.current!.toDataURL("image/png"));
  }

  function limpiar() {
    const c = ref.current!;
    c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
    onChange("");
  }

  return (
    <div>
      <canvas
        ref={ref}
        width={600}
        height={200}
        onPointerDown={inicio}
        onPointerMove={mover}
        onPointerUp={fin}
        onPointerLeave={fin}
        style={{ aspectRatio: "3 / 1", touchAction: "none" }}
        className="w-full cursor-crosshair rounded-xl border border-dashed border-slate-300 bg-white dark:border-slate-600"
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          Firma con el mouse o el dedo (en celular/tablet).
        </span>
        <button
          type="button"
          onClick={limpiar}
          className="text-xs font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-400"
        >
          Limpiar firma
        </button>
      </div>
    </div>
  );
}
