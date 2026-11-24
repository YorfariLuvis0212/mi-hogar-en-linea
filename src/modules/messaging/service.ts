import { prisma } from "@/lib/prisma";

export type ConversationSummary = {
  id: string;
  propertyId: string;
  propertyTitle: string;
  coverUrl: string | null;
  otherParticipantName: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
};

export type ConversationMessage = {
  id: string;
  body: string;
  createdAt: string;
  senderId: string;
  senderName: string;
  isMine: boolean;
};

export type ConversationView = {
  id: string;
  propertyId: string;
  propertyTitle: string;
  neighborhood: string;
  city: string;
  participants: { id: string; name: string }[];
  messages: ConversationMessage[];
};

/** El usuario debe pertenecer a la conversación para poder leerla. */
export async function isParticipant(
  conversationId: string,
  userId: string,
): Promise<boolean> {
  const row = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
    select: { id: true },
  });
  return Boolean(row);
}

export async function listConversationsForUser(
  userId: string,
): Promise<ConversationSummary[]> {
  const rows = await prisma.conversation.findMany({
    where: { participants: { some: { userId } } },
    orderBy: { updatedAt: "desc" },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          media: { take: 1, select: { url: true } },
        },
      },
      participants: { include: { user: { select: { id: true, name: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return rows.map((row) => {
    const me = row.participants.find(
      (participant) => participant.userId === userId,
    );
    const other = row.participants.find(
      (participant) => participant.userId !== userId,
    );
    const lastReadAt = me?.lastReadAt ?? null;

    return {
      id: row.id,
      propertyId: row.propertyId,
      propertyTitle: row.property.title,
      coverUrl: row.property.media[0]?.url ?? null,
      otherParticipantName: other?.user.name ?? "Participante",
      lastMessage: row.messages[0]?.body ?? null,
      lastMessageAt: row.messages[0]?.createdAt.toISOString() ?? null,
      unreadCount: lastReadAt
        ? row.messages.filter(
            (message) =>
              message.createdAt > lastReadAt && message.senderId !== userId,
          ).length
        : 0,
    };
  });
}

export async function getConversationView(
  conversationId: string,
  userId: string,
): Promise<ConversationView | null> {
  const row = await prisma.conversation.findFirst({
    where: { id: conversationId, participants: { some: { userId } } },
    include: {
      property: {
        select: { id: true, title: true, neighborhood: true, city: true },
      },
      participants: { include: { user: { select: { id: true, name: true } } } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { id: true, name: true } } },
      },
    },
  });

  if (!row) return null;

  return {
    id: row.id,
    propertyId: row.propertyId,
    propertyTitle: row.property.title,
    neighborhood: row.property.neighborhood,
    city: row.property.city,
    participants: row.participants.map((participant) => ({
      id: participant.user.id,
      name: participant.user.name,
    })),
    messages: row.messages.map((message) => ({
      id: message.id,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
      senderId: message.senderId,
      senderName: message.sender.name,
      isMine: message.senderId === userId,
    })),
  };
}

export async function markConversationRead(
  conversationId: string,
  userId: string,
): Promise<void> {
  await prisma.conversationParticipant.updateMany({
    where: { conversationId, userId },
    data: { lastReadAt: new Date() },
  });
}

/** Busca una conversación existente entre el interesado y el propietario. */
export async function findConversation(
  propertyId: string,
  buyerId: string,
): Promise<{ id: string; ownerId: string } | null> {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { ownerId: true },
  });
  if (!property) return null;

  const conversation = await prisma.conversation.findFirst({
    where: { propertyId, participants: { some: { userId: buyerId } } },
    select: { id: true },
  });

  return conversation
    ? { id: conversation.id, ownerId: property.ownerId }
    : null;
}
