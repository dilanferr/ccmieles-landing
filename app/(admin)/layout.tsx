import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/src/utils/supabase-server";

export const metadata: Metadata = {
  title: "Panel de Administración",
  robots: { index: false, follow: false },
};

// Guard de sesión. El chrome completo (sidebar, topbar, tema) lo aporta el
// AdminShell, para lograr un layout full-bleed estilo SaaS.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <>{children}</>;
}
