import { describe, it, expect, vi, beforeEach } from "vitest";

// El módulo de sesión se mockea ANTES de importar las acciones.
vi.mock("@/src/utils/supabase-server", () => ({
  createServerSupabase: vi.fn(),
}));

import { createServerSupabase } from "@/src/utils/supabase-server";
import {
  crearTransaccion,
  actualizarTransaccion,
  eliminarTransaccion,
} from "@/app/(admin)/admin/_components/finanzas-actions";
import { fakeSupabase } from "../helpers/supabase-mock";

const usarSupabase = (sb: unknown) =>
  (createServerSupabase as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
    sb,
  );

const base = {
  tipo: "ingreso" as const,
  monto: 5000,
  categoria: "Diezmos",
  descripcion: null,
  metodo_pago: null,
  fecha: "2026-01-01",
  comprobante_url: null,
};

describe("finanzas-actions · crearTransaccion", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sin sesión devuelve error (fail-closed)", async () => {
    usarSupabase(fakeSupabase({ user: null }));
    const res = await crearTransaccion(base);
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/sesión/i);
  });

  it("rechaza monto <= 0", async () => {
    usarSupabase(fakeSupabase());
    const res = await crearTransaccion({ ...base, monto: 0 });
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/monto/i);
  });

  it("rechaza categoría vacía", async () => {
    usarSupabase(fakeSupabase());
    const res = await crearTransaccion({ ...base, categoria: "   " });
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/categoría/i);
  });

  it("inserta con creado_por de la sesión y devuelve la fila", async () => {
    const row = { id: "t1", tipo: "ingreso", monto: 5000, categoria: "Diezmos" };
    const sb = fakeSupabase({
      user: { id: "user-123" },
      result: { data: row, error: null },
    });
    usarSupabase(sb);

    const res = await crearTransaccion(base);
    expect(res.ok).toBe(true);
    expect(res.data).toEqual(row);
    expect(sb.from).toHaveBeenCalledWith("transacciones_financieras");
    expect(sb._builder.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        creado_por: "user-123",
        monto: 5000,
        categoria: "Diezmos",
      }),
    );
  });

  it("propaga el error de RLS/DB como { ok:false }", async () => {
    const sb = fakeSupabase({
      result: { data: null, error: { message: "violates row-level security policy" } },
    });
    usarSupabase(sb);
    const res = await crearTransaccion(base);
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/row-level security/);
  });
});

describe("finanzas-actions · actualizarTransaccion", () => {
  beforeEach(() => vi.clearAllMocks());

  it("actualiza por id y devuelve la fila", async () => {
    const row = { id: "t9", tipo: "egreso", monto: 200, categoria: "Servicios" };
    const sb = fakeSupabase({ result: { data: row, error: null } });
    usarSupabase(sb);

    const res = await actualizarTransaccion("t9", {
      ...base,
      tipo: "egreso",
      monto: 200,
      categoria: "Servicios",
    });
    expect(res.ok).toBe(true);
    expect(res.data).toEqual(row);
    expect(sb._builder.eq).toHaveBeenCalledWith("id", "t9");
  });
});

describe("finanzas-actions · eliminarTransaccion (soft-delete)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("marca eliminado_at en vez de borrar físicamente", async () => {
    const sb = fakeSupabase({ result: { error: null } });
    usarSupabase(sb);

    const res = await eliminarTransaccion("t1");
    expect(res.ok).toBe(true);
    expect(sb._builder.update).toHaveBeenCalledWith(
      expect.objectContaining({ eliminado_at: expect.any(String) }),
    );
    expect(sb._builder.delete).not.toHaveBeenCalled();
    expect(sb._builder.eq).toHaveBeenCalledWith("id", "t1");
  });
});
