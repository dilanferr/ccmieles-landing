import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/src/utils/supabase-server", () => ({
  createServerSupabase: vi.fn(),
}));

import { createServerSupabase } from "@/src/utils/supabase-server";
import {
  crearPrestamo,
  registrarDevolucion,
  type PrestamoInput,
} from "@/app/(admin)/admin/_components/prestamos-actions";
import { fakeSupabase } from "../helpers/supabase-mock";

const usarSupabase = (sb: unknown) =>
  (createServerSupabase as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
    sb,
  );

const base: PrestamoInput = {
  bien_id: "b1",
  miembro_id: "m1",
  cantidad: 1,
  fecha_prestamo: "2026-01-01",
  fecha_devolucion_esperada: null,
  notas: null,
};

describe("prestamos-actions · crearPrestamo", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rechaza un rol sin permisos", async () => {
    usarSupabase(fakeSupabase({ rol: "secretaria" }));
    const res = await crearPrestamo(base);
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/permisos/i);
  });

  it("exige indicar a quién se presta", async () => {
    usarSupabase(fakeSupabase({ rol: "logistica" }));
    const res = await crearPrestamo({ ...base, miembro_id: null });
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/a quién/i);
  });

  it("rechaza cantidad no positiva", async () => {
    usarSupabase(fakeSupabase({ rol: "logistica" }));
    const res = await crearPrestamo({ ...base, cantidad: 0 });
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/cantidad/i);
  });

  it("registra el préstamo y devuelve la fila", async () => {
    const row = { id: "p1", bien_id: "b1", miembro_id: "m1" };
    const sb = fakeSupabase({ rol: "logistica", result: { data: row, error: null } });
    usarSupabase(sb);

    const res = await crearPrestamo(base);
    expect(res.ok).toBe(true);
    expect(res.data).toEqual(row);
    expect(sb.from).toHaveBeenCalledWith("prestamos_bienes");
  });
});

describe("prestamos-actions · registrarDevolucion", () => {
  beforeEach(() => vi.clearAllMocks());

  it("marca la fecha de devolución de un préstamo vigente", async () => {
    const row = { id: "p1", fecha_devolucion_real: "2026-02-01" };
    const sb = fakeSupabase({ rol: "logistica", result: { data: row, error: null } });
    usarSupabase(sb);

    const res = await registrarDevolucion("p1", "2026-02-01");
    expect(res.ok).toBe(true);
    expect(sb._builder.update).toHaveBeenCalledWith(
      expect.objectContaining({ fecha_devolucion_real: "2026-02-01" }),
    );
    // El filtro .is('fecha_devolucion_real', null) evita devolver dos veces.
    expect(sb._builder.is).toHaveBeenCalledWith("fecha_devolucion_real", null);
  });

  it("informa si el préstamo ya fue devuelto (sin fila)", async () => {
    const sb = fakeSupabase({ rol: "logistica", result: { data: null, error: null } });
    usarSupabase(sb);

    const res = await registrarDevolucion("p1");
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/ya fue devuelto/i);
  });
});
