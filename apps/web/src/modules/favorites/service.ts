import { prisma } from "@mh/database";
import {
  LIST_INCLUDE,
  toListItem,
  type PropertyListItem,
} from "@/modules/properties/service";

export type FavoriteItem = PropertyListItem & { favoritedAt: string };

/** Inmuebles guardados por el usuario, más recientes primero. */
export async function listFavoritesForUser(
  userId: string,
): Promise<FavoriteItem[]> {
  const rows = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { property: { include: LIST_INCLUDE } },
  });

  return rows.map((row) => ({
    ...toListItem(row.property),
    favoritedAt: row.createdAt.toISOString(),
  }));
}

export async function isFavorite(
  userId: string,
  propertyId: string,
): Promise<boolean> {
  const row = await prisma.favorite.findUnique({
    where: { userId_propertyId: { userId, propertyId } },
    select: { id: true },
  });
  return Boolean(row);
}

export async function countFavoritesForUser(userId: string): Promise<number> {
  return prisma.favorite.count({ where: { userId } });
}
