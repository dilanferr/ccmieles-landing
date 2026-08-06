import { redirect } from "next/navigation";
import { createServerSupabase } from "@/src/utils/supabase-server";
import { AdminShell } from "./_components/AdminShell";
import type { Rol } from "./_components/types";

export default async function AdminPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // El middleware ya protege /admin, pero reforzamos aquí (defensa en profundidad).
  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol, activo")
    .eq("id", user.id)
    .maybeSingle();

  // Kill-switch: cuenta desactivada → fuera del panel de inmediato.
  if (perfil && perfil.activo === false) {
    redirect("/login?error=cuenta_desactivada");
  }

  // Rol del perfil (RBAC). Por defecto 'lider' (mínimo privilegio, fail-closed)
  // si el usuario aún no tiene perfil.
  let rol: Rol = "lider";
  if (perfil?.activo && perfil.rol) rol = perfil.rol as Rol;

  return <AdminShell email={user.email ?? ""} rol={rol} userId={user.id} />;
}
