import { describe, it, expect } from "vitest";
import {
  normalizarTelefono,
  construirWaLink,
  renderPlantilla,
} from "@/app/(admin)/admin/_components/wa";

describe("wa · normalizarTelefono", () => {
  it("antepone +56 a un móvil chileno sin código", () => {
    expect(normalizarTelefono("912345678")).toBe("56912345678");
  });

  it("respeta un número con + internacional y quita el formato", () => {
    expect(normalizarTelefono("+56 9 1234 5678")).toBe("56912345678");
    expect(normalizarTelefono("+1 202 555 0143")).toBe("12025550143");
  });

  it("no duplica el código si ya empieza por 56", () => {
    expect(normalizarTelefono("56912345678")).toBe("56912345678");
  });

  it("limpia espacios, guiones y paréntesis", () => {
    expect(normalizarTelefono("(9) 1234-5678")).toBe("56912345678");
  });

  it("quita un 0 troncal antes de anteponer el código", () => {
    expect(normalizarTelefono("0912345678")).toBe("56912345678");
  });

  it("devuelve null para entradas vacías o no numéricas", () => {
    expect(normalizarTelefono("")).toBeNull();
    expect(normalizarTelefono(null)).toBeNull();
    expect(normalizarTelefono("hola")).toBeNull();
    expect(normalizarTelefono("123")).toBeNull(); // demasiado corto
  });
});

describe("wa · construirWaLink", () => {
  it("arma el enlace con el mensaje codificado", () => {
    expect(construirWaLink("56912345678", "Hola mundo")).toBe(
      "https://wa.me/56912345678?text=Hola%20mundo",
    );
  });

  it("codifica emojis y saltos de línea", () => {
    const link = construirWaLink("56912345678", "Hola 🎉");
    expect(link).toContain("https://wa.me/56912345678?text=");
    expect(link).toContain(encodeURIComponent("Hola 🎉"));
  });

  it("sin mensaje deja solo la base", () => {
    expect(construirWaLink("56912345678", "")).toBe("https://wa.me/56912345678");
  });

  it("devuelve null si el teléfono es null", () => {
    expect(construirWaLink(null, "Hola")).toBeNull();
  });
});

describe("wa · renderPlantilla", () => {
  it("reemplaza las variables presentes", () => {
    expect(
      renderPlantilla("Hola {nombre}, te saluda {ministerio}", {
        nombre: "Ana",
        ministerio: "CCM",
      }),
    ).toBe("Hola Ana, te saluda CCM");
  });

  it("reemplaza todas las apariciones de una misma variable", () => {
    expect(renderPlantilla("{nombre} {nombre}", { nombre: "Ana" })).toBe("Ana Ana");
  });

  it("deja intactas las variables sin valor", () => {
    expect(renderPlantilla("{saludo} {nombre}", { nombre: "Ana" })).toBe(
      "{saludo} Ana",
    );
  });
});
