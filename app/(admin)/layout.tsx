import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/src/utils/supabase-server";
import { cerrarSesion } from "./actions";

export const metadata: Metadata = {
  title: "Panel de Administración",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Doble verificación (además del middleware) para nunca renderizar el panel
  // sin sesión.
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Cabecera */}
      <header className="sticky top-0 z-40 border-b border-blue-800 bg-linear-to-r from-blue-900 to-blue-700 text-white shadow-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-base font-bold ring-1 ring-white/20">
              M
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold">Panel de Administración</p>
              <p className="text-xs text-sky-200">Centro Cristiano Mieles</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-sky-100 sm:block">
              {user.email}
            </span>
            <Link
              href="/"
              className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/20 transition-colors hover:bg-white/20"
            >
              Ver sitio
            </Link>
            <form action={cerrarSesion}>
              <button
                type="submit"
                className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-blue-800 transition-colors hover:bg-sky-100"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
