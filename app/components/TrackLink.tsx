"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { track } from "./track";

/**
 * Enlace que registra un evento de interacción al hacer clic (analítica de
 * Impacto). Sirve para enlaces internos, externos y mailto/tel. Se puede usar
 * dentro de Server Components sin problema (es un componente cliente).
 */
export default function TrackLink({
  href,
  external = false,
  event,
  meta,
  className,
  ariaLabel,
  children,
}: {
  href: string;
  external?: boolean;
  event?: string;
  meta?: Record<string, unknown>;
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
}) {
  const onClick = event ? () => track(event, meta) : undefined;
  const especial = href.startsWith("mailto:") || href.startsWith("tel:");
  const esInterno = href.startsWith("/") && !external && !especial;

  if (esInterno) {
    return (
      <Link href={href} className={className} aria-label={ariaLabel} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className={className}
      aria-label={ariaLabel}
      onClick={onClick}
      target={especial ? undefined : "_blank"}
      rel={especial ? undefined : "noopener noreferrer"}
    >
      {children}
    </a>
  );
}
