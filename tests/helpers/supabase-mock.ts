import { vi } from "vitest";

/**
 * Mock mínimo del cliente de Supabase para probar Server Actions sin BD real.
 * El `builder` es encadenable (from().update().eq().select()...) Y "thenable",
 * de modo que tanto `await ...single()` como `await ...eq()` resuelven el
 * resultado configurado. Con esto simulamos éxito, errores de RLS/DB y sesión.
 */
export interface FakeResult {
  data?: unknown;
  error?: { message: string; code?: string } | null;
}

export function fakeSupabase(
  opts: {
    user?: { id: string } | null;
    result?: FakeResult;
    rol?: string;
  } = {},
) {
  const user = opts.user === undefined ? { id: "u1" } : opts.user;
  const result: FakeResult = opts.result ?? { data: null, error: null };
  const rol = opts.rol ?? "admin"; // rol devuelto por supabase.rpc("mi_rol")

  const builder = {
    insert: vi.fn(() => builder),
    update: vi.fn(() => builder),
    delete: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    select: vi.fn(() => builder),
    is: vi.fn(() => builder),
    not: vi.fn(() => builder),
    order: vi.fn(() => builder),
    single: vi.fn(() => Promise.resolve(result)),
    maybeSingle: vi.fn(() => Promise.resolve(result)),
    // Hace `await from().update().eq()` (sin .single()) resolver el resultado.
    then: (resolve: (v: FakeResult) => void) => resolve(result),
  };

  return {
    _builder: builder,
    from: vi.fn(() => builder),
    auth: { getUser: vi.fn(async () => ({ data: { user } })) },
    rpc: vi.fn(async () => ({ data: rol, error: null })),
  };
}
