import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/src/utils/supabase-server", () => ({
  createServerSupabase: vi.fn(),
}));

import { createServerSupabase } from "@/src/utils/supabase-server";
import {
  crearConsolidacion,
  consolidarDesdeAsistencia,
  actualizarContacto,
  cambiarEstado,
  asignarResponsable,
  agregarNota,
  convertirEnMiembro,
  eliminarConsolidacion,
} from "@/app/(admin)/admin/_components/consolidacion-actions";
import { fakeSupabase } from "../helpers/supabase-mock";

const usarSupabase = (sb: unknown) =>
  (createServerSupabase as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
    sb,
  );

describe("consolidacion-actions · crearConsolidacion", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sin sesión devuelve error", async () => {
    usarSupabase(fakeSupabase({ user: null }));
    const res = await crearConsolidacion({ nombre: "Ana" });
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/sesión/i);
  });

  it("rechaza un rol sin permisos (p. ej. tesorero)", async () => {
    usarSupabase(fakeSupabase({ rol: "tesorero" }));
    const res = await crearConsolidacion({ nombre: "Ana" });
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/permisos/i);
  });

  it("exige el nombre", async () => {
    usarSupabase(fakeSupabase({ rol: "lider" }));
    const res = await crearConsolidacion({ nombre: "   " });
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/nombre/i);
  });

  it("crea con origen manual y estado recibido", async () => {
    const sb = fakeSupabase({
      rol: "secretaria",
      result: { data: { id: "c1", nombre: "Ana" }, error: null },
    });
    usarSupabase(sb);
    const res = await crearConsolidacion({ nombre: "Ana", telefono: "123" });
    expect(res.ok).toBe(true);
    expect(sb.from).toHaveBeenCalledWith("consolidacion");
    expect(sb._builder.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: "Ana",
        origen: "manual",
        estado: "recibido",
        telefono: "123",
      }),
    );
  });
});

describe("consolidacion-actions · consolidarDesdeAsistencia", () => {
  beforeEach(() => vi.clearAllMocks());

  it("crea desde el visitante de una asistencia", async () => {
    const sb = fakeSupabase({
      rol: "lider",
      result: {
        data: {
          id: "a1",
          visitante_nombre: "Ana",
          miembro_id: null,
          tipo_asistente: "visitante",
        },
        error: null,
      },
    });
    usarSupabase(sb);
    const res = await consolidarDesdeAsistencia("a1");
    expect(res.ok).toBe(true);
    expect(sb.from).toHaveBeenCalledWith("asistencias");
    expect(sb.from).toHaveBeenCalledWith("consolidacion");
    expect(sb._builder.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: "Ana",
        origen: "asistencia",
        asistencia_id: "a1",
      }),
    );
  });

  it("es idempotente: traduce el 23505 a mensaje claro", async () => {
    const sb = fakeSupabase({
      rol: "pastor",
      result: {
        data: { visitante_nombre: "Ana", miembro_id: null },
        error: { message: "dup", code: "23505" },
      },
    });
    usarSupabase(sb);
    const res = await consolidarDesdeAsistencia("a1");
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/ya está en consolidación/i);
  });
});

describe("consolidacion-actions · edición de pipeline", () => {
  beforeEach(() => vi.clearAllMocks());

  it("cambiarEstado rechaza un estado inválido", async () => {
    const sb = fakeSupabase({ rol: "admin" });
    usarSupabase(sb);
    // @ts-expect-error estado fuera del enum
    const res = await cambiarEstado("c1", "bautizando");
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/no válido/i);
    expect(sb._builder.update).not.toHaveBeenCalled();
  });

  it("cambiarEstado actualiza la etapa", async () => {
    const sb = fakeSupabase({
      rol: "lider",
      result: { data: { id: "c1", estado: "contactado" }, error: null },
    });
    usarSupabase(sb);
    const res = await cambiarEstado("c1", "contactado");
    expect(res.ok).toBe(true);
    expect(sb._builder.update).toHaveBeenCalledWith(
      expect.objectContaining({ estado: "contactado" }),
    );
  });

  it("asignarResponsable guarda el responsable", async () => {
    const sb = fakeSupabase({
      rol: "pastor",
      result: { data: { id: "c1", responsable_id: "u9" }, error: null },
    });
    usarSupabase(sb);
    const res = await asignarResponsable("c1", "u9");
    expect(res.ok).toBe(true);
    expect(sb._builder.update).toHaveBeenCalledWith(
      expect.objectContaining({ responsable_id: "u9" }),
    );
  });

  it("actualizarContacto exige el nombre", async () => {
    const sb = fakeSupabase({ rol: "secretaria" });
    usarSupabase(sb);
    const res = await actualizarContacto("c1", { nombre: "" });
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/nombre/i);
  });

  it("eliminarConsolidacion hace soft-delete", async () => {
    const sb = fakeSupabase({ rol: "admin", result: { error: null } });
    usarSupabase(sb);
    const res = await eliminarConsolidacion("c1");
    expect(res.ok).toBe(true);
    expect(sb._builder.update).toHaveBeenCalledWith(
      expect.objectContaining({ eliminado_at: expect.any(String) }),
    );
  });
});

describe("consolidacion-actions · agregarNota (append-only)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rechaza nota vacía", async () => {
    const sb = fakeSupabase({ rol: "lider" });
    usarSupabase(sb);
    const res = await agregarNota("c1", "general", "   ");
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/vacía/i);
  });

  it("rechaza tipo de nota inválido", async () => {
    const sb = fakeSupabase({ rol: "lider" });
    usarSupabase(sb);
    // @ts-expect-error tipo fuera del enum
    const res = await agregarNota("c1", "chisme", "hola");
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/tipo/i);
  });

  it("inserta la nota con autor y tipo", async () => {
    const sb = fakeSupabase({
      rol: "secretaria",
      user: { id: "autor-1" },
      result: { data: { id: "n1" }, error: null },
    });
    usarSupabase(sb);
    const res = await agregarNota("c1", "llamada", "Contacté por teléfono");
    expect(res.ok).toBe(true);
    expect(sb.from).toHaveBeenCalledWith("consolidacion_notas");
    expect(sb._builder.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        consolidacion_id: "c1",
        autor_id: "autor-1",
        tipo: "llamada",
        nota: "Contacté por teléfono",
      }),
    );
  });
});

describe("consolidacion-actions · convertirEnMiembro", () => {
  beforeEach(() => vi.clearAllMocks());

  it("un líder NO puede crear la ficha (solo admin/pastor)", async () => {
    const sb = fakeSupabase({ rol: "lider" });
    usarSupabase(sb);
    const res = await convertirEnMiembro("c1");
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/administrador o pastor/i);
    expect(sb.from).not.toHaveBeenCalled();
  });

  it("no duplica si ya tiene ficha vinculada", async () => {
    const sb = fakeSupabase({
      rol: "admin",
      result: { data: { id: "c1", nombre: "Ana", miembro_id: "m1" }, error: null },
    });
    usarSupabase(sb);
    const res = await convertirEnMiembro("c1");
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/ya tiene una ficha/i);
    expect(sb._builder.insert).not.toHaveBeenCalled();
  });

  it("crea la ficha en miembros_iglesia y la vincula", async () => {
    const sb = fakeSupabase({
      rol: "pastor",
      result: {
        data: { id: "c1", nombre: "Ana", telefono: "123", email: "a@a.cl", miembro_id: null },
        error: null,
      },
    });
    usarSupabase(sb);
    const res = await convertirEnMiembro("c1");
    expect(res.ok).toBe(true);
    expect(sb.from).toHaveBeenCalledWith("miembros_iglesia");
    expect(sb._builder.insert).toHaveBeenCalledWith(
      expect.objectContaining({ nombre_completo: "Ana", correo: "a@a.cl" }),
    );
  });
});
