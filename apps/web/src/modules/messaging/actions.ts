"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { toFieldErrors, type FormState } from "@/lib/form";
import { prisma } from "@mh/database";
import { requireSession } from "@/modules/identity/session";
import { isParticipant } from "@/modules/messaging/service";

const messageSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Escribe un mensaje")
    .max(2000, "Mensaje demasiado largo"),
});

/** Inicia (o reutiliza) la conversación privada entre interesado y propietario. */
export async function startConversationAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  const propertyId = String(formData.get("propertyId") ?? "");

  const parsed = messageSchema.safeParse({ body: formData.get("body") });
  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors(parsed.error.issues) };
  }

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true, ownerId: true, title: true, moderationStatus: true },
  });
  if (!property)
    return { status: "error", message: "El inmueble ya no está disponible." };
  if (property.ownerId === session.user.id) {
    return {
      status: "error",
      message: "Eres el propietario de este inmueble.",
    };
  }

  const blocked = await prisma.block.findFirst({
    where: { authorId: property.ownerId, targetId: session.user.id },
    select: { id: true },
  });
  if (blocked) {
    return {
      status: "error",
      message: "No es posible contactar a este anunciante.",
    };
  }

  const conversationId = await prisma.$transaction(async (tx) => {
    const existing = await tx.conversation.findFirst({
      where: {
        propertyId,
        participants: { some: { userId: session.user.id } },
      },
      select: { id: true },
    });

    const conversation =
      existing ??
      (await tx.conversation.create({
        data: {
          propertyId,
          participants: {
            create: [{ userId: session.user.id }, { userId: property.ownerId }],
          },
        },
        select: { id: true },
      }));

    await tx.conversationParticipant.upsert({
      where: {
        conversationId_userId: {
          conversationId: conversation.id,
          userId: property.ownerId,
        },
      },
      create: { conversationId: conversation.id, userId: property.ownerId },
      update: {},
    });

    await tx.message.create({
      data: {
        conversationId: conversation.id,
        senderId: session.user.id,
        body: parsed.data.body,
      },
    });

    await tx.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    return conversation.id;
  });

  await prisma.notification.create({
    data: {
      userId: property.ownerId,
      type: "MESSAGE",
      title: "Nuevo mensaje",
      body: `${session.user.name} te escribió sobre "${property.title}"`,
      link: `/panel/mensajes/${conversationId}`,
    },
  });

  revalidatePath("/panel/mensajes");
  redirect(`/panel/mensajes/${conversationId}`);
}

/** Añade un mensaje a una conversación existente. Solo participantes. */
export async function sendMessageAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  const conversationId = String(formData.get("conversationId") ?? "");

  const parsed = messageSchema.safeParse({ body: formData.get("body") });
  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors(parsed.error.issues) };
  }

  const allowed = await isParticipant(conversationId, session.user.id);
  if (!allowed) {
    return { status: "error", message: "No participas en esta conversación." };
  }

  const participants = await prisma.conversationParticipant.findMany({
    where: { conversationId },
    select: { userId: true },
  });

  await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId,
        senderId: session.user.id,
        body: parsed.data.body,
      },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
    prisma.conversationParticipant.updateMany({
      where: { conversationId, userId: session.user.id },
      data: { lastReadAt: new Date() },
    }),
  ]);

  const recipients = participants
    .map((participant) => participant.userId)
    .filter((userId) => userId !== session.user.id);

  if (recipients.length > 0) {
    await prisma.notification.createMany({
      data: recipients.map((userId) => ({
        userId,
        type: "MESSAGE" as const,
        title: "Nuevo mensaje",
        body: `${session.user.name} te envió un mensaje`,
        link: `/panel/mensajes/${conversationId}`,
      })),
    });
  }

  revalidatePath(`/panel/mensajes/${conversationId}`);
  revalidatePath("/panel/mensajes");

  return { status: "success" };
}
