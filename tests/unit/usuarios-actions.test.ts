import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/src/utils/supabase-server", () => ({
  createServerSupabase: vi.fn(),
}));

import { createServerSupabase } from "@/src/utils/supabase-server";
import {
  actualizarRolUsuario,
  cambiarEstadoUsuario,
} from "@/app/(admin)/admin/_components/usuarios-actions";
import { fakeSupabase } from "../helpers/supabase-mock";

const usarSupabase = (sb: unknown) =>
  (createServerSupabase as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
    sb,
  );

describe("usuarios-actions · actualizarRolUsuario", () => {
  beforeEach(() => vi.clearAllMocks());

  it("impide cambiar el rol propio (anti auto-bloqueo)", async () => {
    const sb = fakeSupabase({ user: { id: "me" } });
    usarSupabase(sb);

    const res = await actualizarRolUsuario("me", "admin");
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/propio rol/i);
    expect(sb.from).not.toHaveBeenCalled(); // no tocó la BD
  });

  it("rechaza un rol inválido", async () => {
    usarSupabase(fakeSupabase({ user: { id: "me" } }));
    // @ts-expect-error rol fuera del union permitido
    const res = await actualizarRolUsuario("otro", "superuser");
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/inválido/i);
  });

  it("cambia el rol de otro usuario en éxito", async () => {
    const sb = fakeSupabase({ user: { id: "me" }, result: { error: null } });
    usarSupabase(sb);

    const res = await actualizarRolUsuario("otro", "tesorero");
    expect(res.ok).toBe(true);
    expect(sb.from).toHaveBeenCalledWith("perfiles");
    expect(sb._builder.update).toHaveBeenCalledWith({ rol: "tesorero" });
    expect(sb._builder.eq).toHaveBeenCalledWith("id", "otro");
  });
});

describe("usuarios-actions · cambiarEstadoUsuario", () => {
  beforeEach(() => vi.clearAllMocks());

  it("impide desactivar la cuenta propia", async () => {
    const sb = fakeSupabase({ user: { id: "me" } });
    usarSupabase(sb);

    const res = await cambiarEstadoUsuario("me", false);
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/propia cuenta/i);
    expect(sb.from).not.toHaveBeenCalled();
  });

  it("desactiva a otro usuario (kill-switch)", async () => {
    const sb = fakeSupabase({ user: { id: "me" }, result: { error: null } });
    usarSupabase(sb);

    const res = await cambiarEstadoUsuario("otro", false);
    expect(res.ok).toBe(true);
    expect(sb._builder.update).toHaveBeenCalledWith({ activo: false });
    expect(sb._builder.eq).toHaveBeenCalledWith("id", "otro");
  });
});
