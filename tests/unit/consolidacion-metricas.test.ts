import { describe, it, expect } from "vitest";
import {
  enRiesgo,
  diasSinActividad,
  metricasSalud,
  DIAS_RIESGO,
  type ItemMetrica,
} from "@/app/(admin)/admin/_components/consolidacion-metricas";

// Reloj fijo para determinismo: 2026-02-01T12:00:00Z.
const AHORA = Date.parse("2026-02-01T12:00:00Z");
const diasAtras = (n: number) => new Date(AHORA - n * 86_400_000).toISOString();

const base = (over: Partial<ItemMetrica> = {}): ItemMetrica => ({
  estado: "recibido",
  responsable_id: null,
  creado_at: diasAtras(0),
  actualizado_at: diasAtras(0),
  fecha_recepcion: null,
  ...over,
});

describe("consolidacion-metricas · enRiesgo", () => {
  it("marca en riesgo un recibido sin nota con >7 días desde la creación", () => {
    const item = base({ estado: "recibido", creado_at: diasAtras(10) });
    expect(enRiesgo(item, null, AHORA)).toBe(true);
  });

  it("NO está en riesgo si tuvo una nota reciente", () => {
    const item = base({ estado: "contactado", creado_at: diasAtras(30) });
    expect(enRiesgo(item, diasAtras(2), AHORA)).toBe(false);
  });

  it("NO aplica riesgo a estados fuera de seguimiento (en_proceso/integrado)", () => {
    const item = base({ estado: "en_proceso", creado_at: diasAtras(60) });
    expect(enRiesgo(item, null, AHORA)).toBe(false);
  });

  it("justo en el umbral (7 días) todavía NO está en riesgo (es > 7)", () => {
    const item = base({ estado: "recibido", creado_at: diasAtras(DIAS_RIESGO) });
    expect(enRiesgo(item, null, AHORA)).toBe(false);
    const item8 = base({ estado: "recibido", creado_at: diasAtras(8) });
    expect(enRiesgo(item8, null, AHORA)).toBe(true);
  });

  it("diasSinActividad usa la actividad más reciente (nota > creación)", () => {
    const item = base({ creado_at: diasAtras(20) });
    expect(diasSinActividad(item, diasAtras(3), AHORA)).toBe(3);
  });
});

describe("consolidacion-metricas · metricasSalud", () => {
  it("calcula embudo, conversión y descarta 'no_continua' de la base", () => {
    const items: ItemMetrica[] = [
      base({ estado: "recibido" }),
      base({ estado: "recibido" }),
      base({ estado: "contactado" }),
      base({ estado: "integrado" }),
      base({ estado: "no_continua" }),
    ];
    const m = metricasSalud(items);
    expect(m.embudo.recibido).toBe(2);
    expect(m.embudo.integrado).toBe(1);
    expect(m.integrados).toBe(1);
    expect(m.totalPipeline).toBe(4); // 5 - 1 descartado
    expect(m.conversion).toBe(25); // 1/4
  });

  it("promedia el tiempo de integración (actualizado_at - creado_at)", () => {
    const items: ItemMetrica[] = [
      base({ estado: "integrado", creado_at: diasAtras(10), actualizado_at: diasAtras(4) }), // 6 días
      base({ estado: "integrado", creado_at: diasAtras(20), actualizado_at: diasAtras(12) }), // 8 días
    ];
    const m = metricasSalud(items);
    expect(m.tiempoPromedioDias).toBe(7); // (6+8)/2
  });

  it("carga por responsable: cuenta activos y ordena desc (excluye integrados)", () => {
    const items: ItemMetrica[] = [
      base({ estado: "recibido", responsable_id: "u1" }),
      base({ estado: "contactado", responsable_id: "u1" }),
      base({ estado: "recibido", responsable_id: "u2" }),
      base({ estado: "integrado", responsable_id: "u2" }), // no cuenta (integrado)
      base({ estado: "recibido", responsable_id: null }), // sin asignar
    ];
    const m = metricasSalud(items);
    expect(m.carga[0]).toEqual({ responsable_id: "u1", activos: 2 });
    const u2 = m.carga.find((c) => c.responsable_id === "u2");
    expect(u2?.activos).toBe(1);
    const sin = m.carga.find((c) => c.responsable_id === null);
    expect(sin?.activos).toBe(1);
  });

  it("sin datos: conversión 0 y tiempo promedio null", () => {
    const m = metricasSalud([]);
    expect(m.conversion).toBe(0);
    expect(m.tiempoPromedioDias).toBeNull();
    expect(m.carga).toEqual([]);
  });
});
