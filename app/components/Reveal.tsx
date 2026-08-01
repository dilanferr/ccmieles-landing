"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Retraso (ms) tras entrar en pantalla — úsalo para el efecto escalonado. */
  delay?: number;
}

/**
 * Revela su contenido con un fade-in-up suave (desliza hacia arriba + aparece)
 * cuando entra en el viewport. Usa la misma mecánica que <BlurText> —
 * IntersectionObserver + transición CSS— para mantener la armonía visual.
 * Pásale un `delay` incremental (0, 100, 200…) para escalonar varias tarjetas.
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout>;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = setTimeout(() => setShown(true), delay);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(timer);
    };
  }, [delay]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transition:
          "transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.7s cubic-bezier(0.25,0.46,0.45,0.94)",
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(24px)",
        willChange: "transform, opacity",
      }}
    >
      {children}
    </div>
  );
}
