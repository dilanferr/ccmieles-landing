import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/src/utils/supabase-server", () => ({
  createServerSupabase: vi.fn(),
}));

import { createServerSupabase } from "@/src/utils/supabase-server";
import {
  listarPapelera,
  restaurarRegistro,
  purgarRegistro,
} from "@/app/(admin)/admin/_components/papelera-actions";
import { fakeSupabase } from "../helpers/supabase-mock";

const usarSupabase = (sb: unknown) =>
  (createServerSupabase as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
    sb,
  );

describe("papelera-actions · listarPapelera", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sin sesión devuelve error", async () => {
    usarSupabase(fakeSupabase({ user: null }));
    const res = await listarPapelera();
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/sesión/i);
  });

  it("rechaza un rol sin permisos (p. ej. tesorero)", async () => {
    usarSupabase(fakeSupabase({ rol: "tesorero" }));
    const res = await listarPapelera();
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/permisos/i);
  });

  it("consulta las 5 tablas y unifica los eliminados", async () => {
    const fila = { id: "x1", nombre: "Silla", categoria: "Mobiliario", eliminado_at: "2026-02-01" };
    const sb = fakeSupabase({ rol: "pastor", result: { data: [fila], error: null } });
    usarSupabase(sb);

    const res = await listarPapelera();
    expect(res.ok).toBe(true);
    expect(res.data).toHaveLength(5); // 1 fila por cada una de las 5 tablas
    expect(sb.from).toHaveBeenCalledWith("transacciones_financieras");
    expect(sb.from).toHaveBeenCalledWith("miembros_iglesia");
    expect(sb.from).toHaveBeenCalledWith("bienes");
    expect(sb.from).toHaveBeenCalledWith("asistencias");
    expect(sb.from).toHaveBeenCalledWith("eventos_cultos");
    expect(sb._builder.not).toHaveBeenCalledWith("eliminado_at", "is", null);
  });
});

describe("papelera-actions · restaurarRegistro", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rechaza tabla fuera de la allowlist", async () => {
    const sb = fakeSupabase({ rol: "admin" });
    usarSupabase(sb);
    // @ts-expect-error tabla no permitida
    const res = await restaurarRegistro("perfiles", "1");
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/no permitida/i);
    expect(sb.from).not.toHaveBeenCalled();
  });

  it("restaura poniendo eliminado_at en null", async () => {
    const sb = fakeSupabase({ rol: "pastor", result: { error: null } });
    usarSupabase(sb);
    const res = await restaurarRegistro("bienes", "b1");
    expect(res.ok).toBe(true);
    expect(sb._builder.update).toHaveBeenCalledWith({ eliminado_at: null });
    expect(sb._builder.eq).toHaveBeenCalledWith("id", "b1");
  });

  it("traduce el conflicto único (23505) a un mensaje claro", async () => {
    const sb = fakeSupabase({
      rol: "admin",
      result: { error: { message: "dup", code: "23505" } },
    });
    usarSupabase(sb);
    const res = await restaurarRegistro("asistencias", "a1");
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/registro activo equivalente/i);
  });
});

describe("papelera-actions · purgarRegistro", () => {
  beforeEach(() => vi.clearAllMocks());

  it("el pastor NO puede purgar (solo admin)", async () => {
    const sb = fakeSupabase({ rol: "pastor" });
    usarSupabase(sb);
    const res = await purgarRegistro("bienes", "b1");
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/administrador/i);
    expect(sb._builder.delete).not.toHaveBeenCalled();
  });

  it("el admin purga con borrado físico", async () => {
    const sb = fakeSupabase({ rol: "admin", result: { error: null } });
    usarSupabase(sb);
    const res = await purgarRegistro("bienes", "b1");
    expect(res.ok).toBe(true);
    expect(sb._builder.delete).toHaveBeenCalled();
    expect(sb._builder.eq).toHaveBeenCalledWith("id", "b1");
  });
});
