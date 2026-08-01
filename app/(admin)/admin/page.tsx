import { createServerSupabase } from "@/src/utils/supabase-server";
import { AdminShell } from "./_components/AdminShell";

export default async function AdminPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <AdminShell email={user?.email ?? ""} />;
}
