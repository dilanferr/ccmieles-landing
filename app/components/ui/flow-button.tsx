"use client";

/**
 * FlowButton — botón expansivo premium del Centro Cristiano Mieles.
 * Adaptado a Tailwind v4 y a la paleta de marca (brand-*).
 * En lugar de flechas usa una cruz latina (cruz de Cristo) en SVG propio,
 * así no añadimos la dependencia `lucide-react`.
 */

/** Cruz latina dibujada con trazos; hereda el color vía `stroke-*`. */
function CrossIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v18" />
      <path d="M6 9h12" />
    </svg>
  );
}

interface FlowButtonProps {
  text?: string;
  onClick?: () => void;
  className?: string;
}

export function FlowButton({
  text = "Petición de Oración",
  onClick,
  className = "",
}: FlowButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex cursor-pointer items-center gap-2 overflow-hidden rounded-[100px] border-[1.5px] border-brand-600/40 bg-transparent px-6 py-2.5 text-sm font-semibold text-brand-700 transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:rounded-[12px] hover:border-transparent hover:text-white active:scale-[0.95] ${className}`}
    >
      {/* Cruz que entra desde la izquierda al hacer hover */}
      <CrossIcon className="absolute left-[-25%] z-[9] h-4 w-4 fill-none stroke-brand-700 transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:left-4 group-hover:stroke-white" />

      {/* Texto */}
      <span className="relative z-[1] -translate-x-2 transition-all duration-[800ms] ease-out group-hover:translate-x-4">
        {text}
      </span>

      {/* Círculo que se expande para llenar el botón */}
      <span className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600 opacity-0 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:h-[260px] group-hover:w-[260px] group-hover:opacity-100" />

      {/* Cruz que sale por la derecha al hacer hover */}
      <CrossIcon className="absolute right-4 z-[9] h-4 w-4 fill-none stroke-brand-700 transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:right-[-25%] group-hover:stroke-white" />
    </button>
  );
}
