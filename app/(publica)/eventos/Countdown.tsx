"use client";

import { useEffect, useState } from "react";

/** Contador regresivo a una fecha/hora objetivo. */
export default function Countdown({ target }: { target: string }) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const t = new Date(target).getTime();
    // Fecha/hora inválida (NaN): no arrancamos el intervalo; el render lo oculta.
    if (Number.isNaN(t)) return;
    const tick = () => setLeft(Math.max(0, t - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  // Si la fecha/hora es inválida o ya pasó, no mostramos "NaN": ocultamos.
  const invalido = Number.isNaN(new Date(target).getTime());
  if (invalido || left === null || left <= 0) return null;
  const s = Math.floor(left / 1000);
  const partes = [
    { v: Math.floor(s / 86400), l: "días" },
    { v: Math.floor((s % 86400) / 3600), l: "h" },
    { v: Math.floor((s % 3600) / 60), l: "m" },
    { v: s % 60, l: "s" },
  ];
  return (
    <div className="flex gap-3">
      {partes.map((p) => (
        <div
          key={p.l}
          className="rounded-2xl bg-white/10 px-3 py-2 text-center ring-1 ring-white/20 backdrop-blur-sm"
        >
          <p className="text-2xl font-bold tabular-nums text-white sm:text-3xl">
            {String(p.v).padStart(2, "0")}
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-sky-100">
            {p.l}
          </p>
        </div>
      ))}
    </div>
  );
}
