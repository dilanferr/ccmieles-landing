import { createServerSupabase } from "@/src/utils/supabase-server";
import { AdminShell } from "./_components/AdminShell";
import type { Rol } from "./_components/types";

export default async function AdminPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Rol del perfil (RBAC). Por defecto 'lider' (mínimo privilegio, fail-closed)
  // si el usuario aún no tiene perfil o está inactivo.
  let rol: Rol = "lider";
  if (user) {
    const { data: perfil } = await supabase
      .from("perfiles")
      .select("rol, activo")
      .eq("id", user.id)
      .maybeSingle();
    if (perfil?.activo && perfil.rol) rol = perfil.rol as Rol;
  }

  return (
    <AdminShell email={user?.email ?? ""} rol={rol} userId={user?.id ?? ""} />
  );
}
