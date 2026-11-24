import { describe, expect, it } from "vitest";

import {
  canManageResource,
  canModerate,
  hasRole,
  isAppRole,
} from "@/modules/identity/permissions";

describe("permisos de identidad", () => {
  it("reconoce roles válidos y rechaza otros", () => {
    expect(isAppRole("ADMIN")).toBe(true);
    expect(isAppRole("SUPER_ADMIN")).toBe(true);
    expect(isAppRole("GUEST")).toBe(false);
    expect(isAppRole(undefined)).toBe(false);
  });

  it("aplica jerarquía de roles", () => {
    expect(hasRole("SUPER_ADMIN", "ADMIN")).toBe(true);
    expect(hasRole("ADMIN", "ADMIN")).toBe(true);
    expect(hasRole("USER", "ADMIN")).toBe(false);
    expect(hasRole(null, "USER")).toBe(false);
  });

  it("identifica capacidades de moderación", () => {
    expect(canModerate("ADMIN")).toBe(true);
    expect(canModerate("USER")).toBe(false);
  });

  it("autoriza por pertenencia del recurso o moderación", () => {
    expect(canManageResource("u1", "u1", "USER")).toBe(true);
    expect(canManageResource("u1", "u2", "USER")).toBe(false);
    expect(canManageResource("u1", "u2", "ADMIN")).toBe(true);
  });
});
