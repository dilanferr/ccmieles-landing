import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/src/utils/supabase-server", () => ({
  createServerSupabase: vi.fn(),
}));

import { createServerSupabase } from "@/src/utils/supabase-server";
import {
  crearSesionCulto,
  registrarCheckIn,
  registrarCheckOut,
  cerrarSesionCulto,
  type SesionInput,
} from "@/app/(admin)/admin/_components/asistencia-actions";
import { fakeSupabase } from "../helpers/supabase-mock";

const usarSupabase = (sb: unknown) =>
  (createServerSupabase as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
    sb,
  );

const sesionBase: SesionInput = {
  nombre: "Culto Familiar",
  tipo: "culto",
  fecha: "2026-01-04",
  hora: null,
  descripcion: null,
};

describe("asistencia-actions · crearSesionCulto", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sin sesión devuelve error", async () => {
    usarSupabase(fakeSupabase({ user: null }));
    const res = await crearSesionCulto(sesionBase);
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/sesión/i);
  });

  it("rechaza un rol sin permisos (p. ej. tesorero)", async () => {
    usarSupabase(fakeSupabase({ rol: "tesorero" }));
    const res = await crearSesionCulto(sesionBase);
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/permisos/i);
  });

  it("rechaza nombre vacío", async () => {
    usarSupabase(fakeSupabase({ rol: "lider" }));
    const res = await crearSesionCulto({ ...sesionBase, nombre: "  " });
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/nombre/i);
  });

  it("crea la sesión (rol lider) y devuelve la fila", async () => {
    const row = { id: "s1", nombre: "Culto Familiar", tipo: "culto" };
    const sb = fakeSupabase({ rol: "lider", result: { data: row, error: null } });
    usarSupabase(sb);
    const res = await crearSesionCulto(sesionBase);
    expect(res.ok).toBe(true);
    expect(res.data).toEqual(row);
    expect(sb.from).toHaveBeenCalledWith("eventos_cultos");
  });
});

describe("asistencia-actions · registrarCheckIn", () => {
  beforeEach(() => vi.clearAllMocks());

  it("exige un miembro o un visitante", async () => {
    usarSupabase(fakeSupabase({ rol: "secretaria" }));
    const res = await registrarCheckIn({ evento_culto_id: "s1" });
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/miembro o el nombre del visitante/i);
  });

  it("registra la asistencia de un miembro", async () => {
    const row = { id: "a1", evento_culto_id: "s1", miembro_id: "m1" };
    const sb = fakeSupabase({ rol: "lider", result: { data: row, error: null } });
    usarSupabase(sb);
    const res = await registrarCheckIn({ evento_culto_id: "s1", miembro_id: "m1" });
    expect(res.ok).toBe(true);
    expect(sb.from).toHaveBeenCalledWith("asistencias");
    expect(sb._builder.insert).toHaveBeenCalledWith(
      expect.objectContaining({ miembro_id: "m1", tipo_asistente: "miembro" }),
    );
  });

  it("traduce la violación única (23505) a 'ya registrado'", async () => {
    const sb = fakeSupabase({
      rol: "lider",
      result: { data: null, error: { message: "duplicate key", code: "23505" } },
    });
    usarSupabase(sb);
    const res = await registrarCheckIn({ evento_culto_id: "s1", miembro_id: "m1" });
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/ya está registrado/i);
  });
});

describe("asistencia-actions · check-out / cierre", () => {
  beforeEach(() => vi.clearAllMocks());

  it("registrarCheckOut hace soft-delete (eliminado_at)", async () => {
    const sb = fakeSupabase({ rol: "lider", result: { error: null } });
    usarSupabase(sb);
    const res = await registrarCheckOut("a1");
    expect(res.ok).toBe(true);
    expect(sb._builder.update).toHaveBeenCalledWith(
      expect.objectContaining({ eliminado_at: expect.any(String) }),
    );
  });

  it("cerrarSesionCulto marca cerrada_at", async () => {
    const row = { id: "s1", cerrada_at: "2026-01-04T12:00:00Z" };
    const sb = fakeSupabase({ rol: "admin", result: { data: row, error: null } });
    usarSupabase(sb);
    const res = await cerrarSesionCulto("s1", true);
    expect(res.ok).toBe(true);
    expect(sb._builder.update).toHaveBeenCalledWith(
      expect.objectContaining({ cerrada_at: expect.any(String) }),
    );
  });

  it("cerrarSesionCulto reabre (cerrada_at = null)", async () => {
    const row = { id: "s1", cerrada_at: null };
    const sb = fakeSupabase({ rol: "admin", result: { data: row, error: null } });
    usarSupabase(sb);
    const res = await cerrarSesionCulto("s1", false);
    expect(res.ok).toBe(true);
    expect(sb._builder.update).toHaveBeenCalledWith(
      expect.objectContaining({ cerrada_at: null }),
    );
  });
});
