/**
 * Roles y permisos. El modelo combina rol, estado de cuenta y pertenencia
 * del recurso. Las comprobaciones se ejecutan siempre en el servidor.
 */
export const ROLES = ["USER", "ADMIN", "SUPER_ADMIN"] as const;

export type AppRole = (typeof ROLES)[number];

const ROLE_WEIGHT: Record<AppRole, number> = {
  USER: 0,
  ADMIN: 1,
  SUPER_ADMIN: 2,
};

export function isAppRole(value: unknown): value is AppRole {
  return (
    typeof value === "string" && (ROLES as readonly string[]).includes(value)
  );
}

/** Comprueba si un rol alcanza al menos el nivel requerido. */
export function hasRole(
  role: string | undefined | null,
  required: AppRole,
): boolean {
  if (!isAppRole(role)) return false;
  return ROLE_WEIGHT[role] >= ROLE_WEIGHT[required];
}

export function canModerate(role: string | undefined | null): boolean {
  return hasRole(role, "ADMIN");
}

export function canManagePlatform(role: string | undefined | null): boolean {
  return hasRole(role, "SUPER_ADMIN");
}

/**
 * Autorización por pertenencia: solo el propietario del recurso o un rol
 * con capacidad de moderación puede operar sobre él.
 */
export function canManageResource(
  actorId: string,
  ownerId: string,
  role: string | undefined | null,
): boolean {
  return actorId === ownerId || canModerate(role);
}
