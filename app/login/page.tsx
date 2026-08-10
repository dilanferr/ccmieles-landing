"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/src/utils/supabase";
import { LockIcon, MailIcon } from "@/app/components/icons";
import { IGLESIA, LOGO_URL } from "@/app/data/iglesia";

const inputBase =
  "w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  // Mensaje inicial si el middleware nos mandó por cuenta desactivada.
  const [error, setError] = useState(
    params.get("error") === "cuenta_desactivada"
      ? "Tu cuenta está desactivada. Contacta a un administrador para recuperar el acceso."
      : "",
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? "Credenciales incorrectas. Verifica tu correo y contraseña."
          : "No se pudo iniciar sesión.",
      );
      setLoading(false);
    }
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-linear-to-br from-blue-950 via-blue-900 to-sky-800 px-4 py-10">
      {/* Ambiente cálido: destellos y textura institucional */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-sky-400/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-16 h-[28rem] w-[28rem] rounded-full bg-amber-400/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_45%)]"
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Marca */}
        <div className="mb-8 flex flex-col items-center text-center">
          <Link
            href="/"
            className="grid h-20 w-20 place-items-center rounded-3xl bg-white/95 p-2.5 shadow-xl shadow-blue-950/40 ring-1 ring-white/40 transition-transform hover:scale-105"
          >
            <Image
              src={LOGO_URL}
              alt={IGLESIA.nombre}
              width={64}
              height={64}
              priority
              className="h-full w-full object-contain"
            />
          </Link>
          <h1 className="mt-5 text-2xl font-black tracking-tight text-white sm:text-3xl">
            {IGLESIA.nombre}
          </h1>
          <p className="mt-1.5 text-sm font-semibold text-sky-200">
            Centro de control pastoral y congregacional
          </p>
          <p className="mt-1 max-w-xs text-xs leading-relaxed text-sky-100/70">
            {IGLESIA.ministerio}
          </p>
        </div>

        {/* Tarjeta */}
        <div className="rounded-3xl border border-white/15 bg-white/95 p-7 shadow-2xl shadow-blue-950/30 backdrop-blur-xl sm:p-8">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-slate-900">
              Bienvenido de vuelta
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Ingresa para pastorear el contenido y la comunidad.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Correo electrónico
              </label>
              <div className="relative">
                <MailIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="correo@ccmieles.cl"
                  className={`${inputBase} pl-11`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-slate-700"
              >
                Contraseña
              </label>
              <div className="relative">
                <LockIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`${inputBase} pl-11`}
                />
              </div>
            </div>

            {error && (
              <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-linear-to-r from-blue-700 to-sky-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 hover:shadow-blue-600/50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Ingresando…" : "Iniciar sesión"}
            </button>
          </form>
        </div>

        {/* Pie cálido */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm font-medium text-sky-200 transition-colors hover:text-white"
          >
            ← Volver al inicio
          </Link>
          <p className="mt-3 text-xs text-sky-100/50">
            «Hay un lugar para ti» · Desde {IGLESIA.anioFundacion} en Quilicura
          </p>
        </div>
      </div>
    </div>
  );
}
