"use client";

import { useEffect, useMemo, useRef, useState, type ElementType } from "react";

interface BlurTextProps {
  text: string;
  /** Etiqueta a renderizar (h1, h2, p, span…). */
  as?: ElementType;
  className?: string;
  /** Retraso (ms) tras entrar en pantalla antes de iniciar la animación. */
  delay?: number;
}

/**
 * Revela el texto palabra por palabra con un desenfoque cinematográfico
 * cuando la sección entra en el viewport. Las variaciones por palabra son
 * deterministas (sin Math.random) para evitar errores de hidratación en SSR.
 */
export default function BlurText({
  text,
  as: Tag = "p",
  className = "",
  delay = 100,
}: BlurTextProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  const words = useMemo(() => {
    const arr = text.split(" ");
    return arr.map((word, i) => {
      const progress = i / Math.max(1, arr.length);
      return {
        text: word,
        duration: 1.5 + Math.cos(i * 0.3) * 0.25,
        delay:
          i * 0.06 + Math.pow(progress, 0.8) * 0.4 + Math.sin(i * 1.7) * 0.02,
        blur: 10 + ((i * 5) % 8),
        scale: 0.92 + Math.sin(i * 0.2) * 0.04,
      };
    });
  }, [text]);

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
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(timer);
    };
  }, [delay]);

  return (
    <Tag ref={ref} className={className}>
      {words.map((w, i) => (
        <span
          key={i}
          className="inline-block will-change-[filter,transform,opacity]"
          style={{
            transition: `filter ${w.duration}s cubic-bezier(0.25,0.46,0.45,0.94) ${w.delay}s, transform ${w.duration}s cubic-bezier(0.25,0.46,0.45,0.94) ${w.delay}s, opacity ${w.duration}s ${w.delay}s`,
            filter: shown ? "blur(0px)" : `blur(${w.blur}px)`,
            opacity: shown ? 1 : 0,
            transform: shown
              ? "translateY(0) scale(1)"
              : `translateY(14px) scale(${w.scale})`,
            marginRight: "0.28em",
          }}
        >
          {w.text}
        </span>
      ))}
    </Tag>
  );
}
