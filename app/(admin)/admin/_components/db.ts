import { createClient } from "@/src/utils/supabase";

// Cliente de navegador (con sesión) como singleton, para evitar múltiples
// instancias de GoTrueClient. Usa la sesión del administrador autenticado,
// por lo que respeta las políticas RLS para escritura.
let client: ReturnType<typeof createClient> | null = null;

export function getDb() {
  if (!client) client = createClient();
  return client;
}
