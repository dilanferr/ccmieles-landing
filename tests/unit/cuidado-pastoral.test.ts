import { describe, it, expect } from "vitest";
import {
  calcularOcasion,
  enRango,
  etiquetaProximo,
} from "@/app/(admin)/admin/_components/cuidado-pastoral";

// Hoy fijo (UTC): 11 de agosto de 2026.
const HOY = Date.UTC(2026, 7, 11);
// Hoy fijo cerca de fin de año: 30 de diciembre de 2026.
const FIN_ANIO = Date.UTC(2026, 11, 30);

describe("cuidado-pastoral · calcularOcasion", () => {
  it("cumpleaños hoy: dias 0, años correctos y mesActual", () => {
    const oc = calcularOcasion("1990-08-11", HOY);
    expect(oc).not.toBeNull();
    expect(oc!.dias).toBe(0);
    expect(oc!.anios).toBe(36); // 2026 - 1990
    expect(oc!.mesActual).toBe(true);
  });

  it("cumpleaños en 3 días", () => {
    expect(calcularOcasion("1985-08-14", HOY)!.dias).toBe(3);
  });

  it("cumpleaños ya pasado este año → próximo el año siguiente (mismo mes)", () => {
    const oc = calcularOcasion("1990-08-10", HOY)!;
    expect(oc.dias).toBe(364); // 2026 no bisiesto: 11-ago-2026 → 10-ago-2027
    expect(oc.mesActual).toBe(true); // agosto sigue siendo el mes actual
    expect(oc.anios).toBe(37); // cumple en 2027
  });

  it("cruce de fin de año: hoy 30-dic, cumple 2-ene → 3 días", () => {
    const oc = calcularOcasion("1980-01-02", FIN_ANIO)!;
    expect(oc.dias).toBe(3);
    expect(oc.mesActual).toBe(false); // enero ≠ diciembre
    expect(oc.anios).toBe(47); // cumple en 2027
  });

  it("fecha ausente o inválida devuelve null", () => {
    expect(calcularOcasion(null, HOY)).toBeNull();
    expect(calcularOcasion("", HOY)).toBeNull();
    expect(calcularOcasion("no-es-fecha", HOY)).toBeNull();
  });
});

describe("cuidado-pastoral · enRango", () => {
  const oc = (dias: number, mesActual: boolean) => ({ dias, anios: 30, mesActual });

  it("hoy solo con dias 0", () => {
    expect(enRango(oc(0, true), "hoy")).toBe(true);
    expect(enRango(oc(1, true), "hoy")).toBe(false);
  });

  it("semana incluye 0..7", () => {
    expect(enRango(oc(7, true), "semana")).toBe(true);
    expect(enRango(oc(8, true), "semana")).toBe(false);
  });

  it("mes usa mesActual (aunque ya haya pasado en el mes)", () => {
    expect(enRango(oc(300, true), "mes")).toBe(true);
    expect(enRango(oc(3, false), "mes")).toBe(false);
  });
});

describe("cuidado-pastoral · etiquetaProximo", () => {
  it("hoy / mañana / en N días", () => {
    expect(etiquetaProximo(0)).toMatch(/hoy/i);
    expect(etiquetaProximo(1)).toMatch(/mañana/i);
    expect(etiquetaProximo(5)).toBe("en 5 días");
  });
});
