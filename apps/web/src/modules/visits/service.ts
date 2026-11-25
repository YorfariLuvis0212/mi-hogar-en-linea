import { prisma } from "@mh/database";

export type VisitItem = {
  id: string;
  propertyId: string;
  propertyTitle: string;
  status: string;
  scheduledAt: string | null;
  notes: string | null;
  createdAt: string;
  counterpartName: string;
  direction: "requested" | "received";
};

export async function listVisitsForUser(userId: string): Promise<VisitItem[]> {
  const rows = await prisma.visit.findMany({
    where: { OR: [{ requesterId: userId }, { hostId: userId }] },
    orderBy: { createdAt: "desc" },
    include: {
      property: { select: { id: true, title: true } },
      requester: { select: { name: true } },
      host: { select: { name: true } },
    },
  });

  return rows.map((row) => {
    const isRequester = row.requesterId === userId;
    return {
      id: row.id,
      propertyId: row.propertyId,
      propertyTitle: row.property.title,
      status: row.status,
      scheduledAt: row.scheduledAt?.toISOString() ?? null,
      notes: row.notes,
      createdAt: row.createdAt.toISOString(),
      counterpartName: isRequester ? row.host.name : row.requester.name,
      direction: isRequester ? "requested" : "received",
    };
  });
}

/** Solicitudes de visita pendientes de respuesta para el anfitrión. */
export async function countPendingVisitsForHost(
  userId: string,
): Promise<number> {
  return prisma.visit.count({ where: { hostId: userId, status: "REQUESTED" } });
}

export const VISIT_STATUS_LABELS: Record<string, string> = {
  REQUESTED: "Solicitada",
  ACCEPTED: "Aceptada",
  REJECTED: "Rechazada",
  CANCELLED: "Cancelada",
  COMPLETED: "Realizada",
};
