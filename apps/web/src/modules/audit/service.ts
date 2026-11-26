import { prisma, type Prisma } from "@mh/database";

/**
 * Registro auditable de operaciones sensibles. Nunca debe romper el flujo
 * principal: si la escritura falla, se registra en consola y continúa.
 */
export async function recordAudit(entry: {
  actorId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: entry.actorId ?? null,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId ?? null,
        metadata: entry.metadata,
      },
    });
  } catch (error) {
    console.error("No se pudo registrar la auditoría:", error);
  }
}
