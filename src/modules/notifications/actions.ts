"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/modules/identity/session";

/** Marca como leídas todas las notificaciones del usuario autenticado. */
export async function markNotificationsReadAction(): Promise<void> {
  const session = await requireSession();

  await prisma.notification.updateMany({
    where: { userId: session.user.id, readAt: null },
    data: { readAt: new Date() },
  });

  revalidatePath("/panel");
}
