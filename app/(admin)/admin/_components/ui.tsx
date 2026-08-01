"use client";

import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

/** Spinner de carga. */
export function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
      />
    </svg>
  );
}

/** Tarjeta contenedora. */
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7 dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      {children}
    </div>
  );
}

/** Encabezado de módulo. */
export function ModuleHeader({
  icon,
  titulo,
  descripcion,
  accion,
}: {
  icon: ReactNode;
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-300">
          {icon}
        </span>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {titulo}
          </h2>
          {descripcion && (
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              {descripcion}
            </p>
          )}
        </div>
      </div>
      {accion}
    </div>
  );
}

/** Campo con etiqueta. */
export function Field({
  label,
  htmlFor,
  children,
  hint,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </span>
      {children}
      {hint && (
        <span className="mt-1 block text-xs text-slate-400 dark:text-slate-500">
          {hint}
        </span>
      )}
    </label>
  );
}

const inputBase =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-900/50";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return <input {...rest} className={`${inputBase} ${className}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", ...rest } = props;
  return (
    <textarea {...rest} className={`${inputBase} min-h-36 resize-y ${className}`} />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = "", ...rest } = props;
  return <select {...rest} className={`${inputBase} ${className}`} />;
}

/** Botón con estados de carga y variantes. */
export function Button({
  children,
  loading = false,
  variant = "primary",
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  variant?: "primary" | "ghost" | "danger";
}) {
  const styles = {
    primary:
      "bg-blue-700 text-white shadow-lg shadow-blue-600/25 hover:-translate-y-0.5 hover:bg-blue-800",
    ghost:
      "border border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600",
    danger:
      "border border-red-200 bg-white text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:bg-slate-800 dark:text-red-400",
  }[variant];

  return (
    <button
      {...rest}
      disabled={rest.disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60 ${styles} ${className}`}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
}

/** Mensaje de resultado. */
export function Alerta({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <div
      role="status"
      className={`rounded-xl border px-4 py-3 text-sm font-medium ${
        ok
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
          : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
      }`}
    >
      {children}
    </div>
  );
}

/** Estado vacío / de carga. */
export function EstadoVacio({
  loading = false,
  children,
}: {
  loading?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 py-14 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400">
      {loading && <Spinner className="h-6 w-6 text-blue-500" />}
      {children}
    </div>
  );
}
