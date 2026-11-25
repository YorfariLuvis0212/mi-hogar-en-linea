/**
 * Roles de la plataforma. Vocabulario compartido entre el frontend y la API.
 */
export const ROLES = ["USER", "ADMIN", "SUPER_ADMIN"] as const;

export type AppRole = (typeof ROLES)[number];

export function isAppRole(value: unknown): value is AppRole {
  return (
    typeof value === "string" && (ROLES as readonly string[]).includes(value)
  );
}
