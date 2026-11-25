import { describe, expect, it } from "vitest";

import { formatCurrency, formatDate } from "@/lib/format";

describe("formato es-CO", () => {
  it("formatea pesos colombianos sin decimales", () => {
    expect(formatCurrency(950000)).toMatch(/950\.000/);
    expect(formatCurrency("1600000")).toMatch(/1\.600\.000/);
    expect(formatCurrency(950000)).not.toContain(",00");
  });

  it("devuelve guion para valores no numéricos", () => {
    expect(formatCurrency(Number.NaN)).toBe("—");
  });

  it("formatea fechas en la zona horaria de Bogotá", () => {
    expect(formatDate(new Date("2026-01-15T12:00:00Z"))).toBe("15/01/2026");
  });
});
