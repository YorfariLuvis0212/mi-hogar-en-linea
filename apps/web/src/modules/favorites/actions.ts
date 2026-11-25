"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@mh/database";
import { requireSession } from "@/modules/identity/session";

export type FavoriteToggleResult = { status: "added" | "removed" };

/**
 * Añade o quita un inmueble de favoritos del usuario autenticado.
 * La operación es idempotente por la clave única (userId, propertyId).
 */
export async function toggleFavoriteAction(
  propertyId: string,
): Promise<FavoriteToggleResult> {
  const session = await requireSession();

  const existing = await prisma.favorite.findUnique({
    where: { userId_propertyId: { userId: session.user.id, propertyId } },
    select: { id: true },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    revalidatePath("/panel/favoritos");
    revalidatePath(`/propiedades/${propertyId}`);
    return { status: "removed" };
  }

  await prisma.favorite.create({
    data: { userId: session.user.id, propertyId },
  });

  revalidatePath("/panel/favoritos");
  revalidatePath(`/propiedades/${propertyId}`);
  return { status: "added" };
}
