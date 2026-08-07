import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/src/utils/supabase-server", () => ({
  createServerSupabase: vi.fn(),
}));

import { createServerSupabase } from "@/src/utils/supabase-server";
import {
  crearBien,
  eliminarBien,
  type BienInput,
  type EstadoBien,
} from "@/app/(admin)/admin/_components/inventario-actions";
import { fakeSupabase } from "../helpers/supabase-mock";

const usarSupabase = (sb: unknown) =>
  (createServerSupabase as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
    sb,
  );

const base: BienInput = {
  nombre: "Guitarra eléctrica",
  categoria: "Instrumentos",
  cantidad: 1,
  estado: "bueno",
  ubicacion: null,
  responsable_id: null,
  valor: 50000,
  fecha_adquisicion: null,
  nro_serie: null,
  foto_url: null,
  notas: null,
};

describe("inventario-actions · crearBien", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sin sesión devuelve error", async () => {
    usarSupabase(fakeSupabase({ user: null }));
    const res = await crearBien(base);
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/sesión/i);
  });

  it("rechaza un rol sin permisos (p. ej. lider)", async () => {
    usarSupabase(fakeSupabase({ rol: "lider" }));
    const res = await crearBien(base);
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/permisos/i);
  });

  it("rechaza nombre vacío", async () => {
    usarSupabase(fakeSupabase({ rol: "logistica" }));
    const res = await crearBien({ ...base, nombre: "   " });
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/nombre/i);
  });

  it("rechaza estado inválido", async () => {
    usarSupabase(fakeSupabase({ rol: "logistica" }));
    const res = await crearBien({ ...base, estado: "otro" as EstadoBien });
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/estado/i);
  });

  it("rechaza cantidad negativa", async () => {
    usarSupabase(fakeSupabase({ rol: "logistica" }));
    const res = await crearBien({ ...base, cantidad: -1 });
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/cantidad/i);
  });

  it("rechaza valor negativo", async () => {
    usarSupabase(fakeSupabase({ rol: "logistica" }));
    const res = await crearBien({ ...base, valor: -100 });
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/valor/i);
  });

  it("crea el bien (rol logistica) y devuelve la fila", async () => {
    const row = { id: "b1", nombre: "Guitarra eléctrica", categoria: "Instrumentos" };
    const sb = fakeSupabase({ rol: "logistica", result: { data: row, error: null } });
    usarSupabase(sb);

    const res = await crearBien(base);
    expect(res.ok).toBe(true);
    expect(res.data).toEqual(row);
    expect(sb.from).toHaveBeenCalledWith("bienes");
    expect(sb._builder.insert).toHaveBeenCalledWith(
      expect.objectContaining({ nombre: "Guitarra eléctrica", categoria: "Instrumentos", valor: 50000 }),
    );
  });
});

describe("inventario-actions · eliminarBien (soft-delete)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("marca eliminado_at en vez de borrar", async () => {
    const sb = fakeSupabase({ rol: "admin", result: { error: null } });
    usarSupabase(sb);

    const res = await eliminarBien("b1");
    expect(res.ok).toBe(true);
    expect(sb._builder.update).toHaveBeenCalledWith(
      expect.objectContaining({ eliminado_at: expect.any(String) }),
    );
    expect(sb._builder.delete).not.toHaveBeenCalled();
  });
});
