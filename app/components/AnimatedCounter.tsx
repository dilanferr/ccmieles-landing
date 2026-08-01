"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Contador que anima de 0 a `value` cuando entra en el viewport.
 * - Usa IntersectionObserver (misma mecánica que <Reveal>) para dispararse
 *   una sola vez al ser visible.
 * - Respeta `prefers-reduced-motion`: si el usuario lo pide, muestra el
 *   número final sin animar.
 * - Separador de miles en formato es-CL (15.000).
 */
export default function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  duration = 1600,
  className = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  /** Duración de la animación en ms. */
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let raf = 0;
    let start = 0;
    const step = (now: number) => {
      if (!start) start = now;
      const progress = Math.min((now - start) / duration, 1);
      // easeOutCubic para un frenado natural.
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Si el usuario prefiere menos movimiento, saltamos al valor final.
          if (reduce) setDisplay(value);
          else raf = requestAnimationFrame(step);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toLocaleString("es-CL")}
      {suffix}
    </span>
  );
}
