"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { toFieldErrors, type FormState } from "@/lib/form";
import { prisma } from "@mh/database";
import { requireSession } from "@/modules/identity/session";

const visitSchema = z.object({
  propertyId: z.string().min(1),
  scheduledAt: z.string().optional(),
  notes: z.string().trim().max(500, "Máximo 500 caracteres").optional(),
});

export async function requestVisitAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();

  const parsed = visitSchema.safeParse({
    propertyId: formData.get("propertyId"),
    scheduledAt: formData.get("scheduledAt") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors(parsed.error.issues) };
  }

  const property = await prisma.property.findUnique({
    where: { id: parsed.data.propertyId },
    select: { id: true, ownerId: true, title: true },
  });
  if (!property)
    return { status: "error", message: "El inmueble ya no está disponible." };
  if (property.ownerId === session.user.id) {
    return {
      status: "error",
      message: "Eres el propietario de este inmueble.",
    };
  }

  let scheduledAt: Date | null = null;
  if (parsed.data.scheduledAt) {
    const candidate = new Date(parsed.data.scheduledAt);
    if (Number.isNaN(candidate.getTime())) {
      return {
        status: "error",
        fieldErrors: { scheduledAt: ["Fecha inválida"] },
      };
    }
    scheduledAt = candidate;
  }

  await prisma.visit.create({
    data: {
      propertyId: property.id,
      requesterId: session.user.id,
      hostId: property.ownerId,
      scheduledAt,
      notes: parsed.data.notes ?? null,
    },
  });

  await prisma.notification.create({
    data: {
      userId: property.ownerId,
      type: "VISIT",
      title: "Nueva solicitud de visita",
      body: `${session.user.name} quiere visitar "${property.title}"`,
      link: "/panel/visitas",
    },
  });

  revalidatePath("/panel/visitas");
  return {
    status: "success",
    message: "Solicitud de visita enviada. El anunciante te confirmará.",
  };
}

const respondSchema = z.object({
  visitId: z.string().min(1),
  decision: z.enum(["ACCEPTED", "REJECTED", "COMPLETED", "CANCELLED"]),
});

export async function respondVisitAction(formData: FormData): Promise<void> {
  const session = await requireSession();

  const parsed = respondSchema.safeParse({
    visitId: formData.get("visitId"),
    decision: formData.get("decision"),
  });
  if (!parsed.success) return;

  const visit = await prisma.visit.findUnique({
    where: { id: parsed.data.visitId },
    select: { id: true, requesterId: true, hostId: true, propertyId: true },
  });
  if (!visit) return;

  const isHost = visit.hostId === session.user.id;
  const isRequester = visit.requesterId === session.user.id;
  const { decision } = parsed.data;

  const hostAllowed =
    decision === "ACCEPTED" ||
    decision === "REJECTED" ||
    decision === "COMPLETED";
  if (hostAllowed && !isHost) return;
  if (decision === "CANCELLED" && !isRequester) return;

  await prisma.visit.update({
    where: { id: visit.id },
    data: { status: decision },
  });

  const notifyUserId = isHost ? visit.requesterId : visit.hostId;
  const labels: Record<typeof decision, string> = {
    ACCEPTED: "aceptó",
    REJECTED: "rechazó",
    COMPLETED: "marcó como realizada",
    CANCELLED: "canceló",
  };

  await prisma.notification.create({
    data: {
      userId: notifyUserId,
      type: "VISIT",
      title: "Actualización de visita",
      body: `${session.user.name} ${labels[decision]} la visita`,
      link: "/panel/visitas",
    },
  });

  revalidatePath("/panel/visitas");
}
