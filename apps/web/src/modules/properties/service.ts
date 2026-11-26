import { prisma, type Prisma } from "@mh/database";
import { PROPERTY_TYPES, type PropertyTypeValue } from "@mh/contracts";

/** Solo las publicaciones aprobadas y disponibles son visibles al público. */
const PUBLIC_WHERE = {
  moderationStatus: "APPROVED",
  availability: "AVAILABLE",
} satisfies Prisma.PropertyWhereInput;

export type PropertyListItem = {
  id: string;
  title: string;
  price: string;
  type: PropertyTypeValue;
  bedrooms: number;
  bathrooms: number;
  areaM2: number | null;
  city: string;
  neighborhood: string;
  coverUrl: string | null;
  ownerName: string;
  publishedAt: string | null;
};

export type PropertySearchFilters = {
  q?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  neighborhood?: string;
  page?: number;
  pageSize?: number;
};

export type PropertySearchResult = {
  items: PropertyListItem[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export const LIST_INCLUDE = {
  media: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
  owner: { select: { name: true } },
} satisfies Prisma.PropertyInclude;

export function toListItem(row: {
  id: string;
  title: string;
  price: Prisma.Decimal;
  type: PropertyTypeValue;
  bedrooms: number;
  bathrooms: number;
  areaM2: number | null;
  city: string;
  neighborhood: string;
  publishedAt: Date | null;
  media: { url: string }[];
  owner: { name: string };
}): PropertyListItem {
  return {
    id: row.id,
    title: row.title,
    price: row.price.toString(),
    type: row.type,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    areaM2: row.areaM2,
    city: row.city,
    neighborhood: row.neighborhood,
    coverUrl: row.media[0]?.url ?? null,
    ownerName: row.owner.name,
    publishedAt: row.publishedAt?.toISOString() ?? null,
  };
}

function buildWhere(filters: PropertySearchFilters): Prisma.PropertyWhereInput {
  const where: Prisma.PropertyWhereInput = { ...PUBLIC_WHERE };

  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { description: { contains: filters.q, mode: "insensitive" } },
      { neighborhood: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  if (
    filters.type &&
    (PROPERTY_TYPES as readonly string[]).includes(filters.type)
  ) {
    where.type = filters.type as PropertyTypeValue;
  }

  if (filters.minPrice != null || filters.maxPrice != null) {
    where.price = {
      ...(filters.minPrice != null ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice != null ? { lte: filters.maxPrice } : {}),
    };
  }

  if (filters.bedrooms != null && filters.bedrooms > 0) {
    where.bedrooms = { gte: filters.bedrooms };
  }

  if (filters.neighborhood) {
    where.neighborhood = { equals: filters.neighborhood, mode: "insensitive" };
  }

  return where;
}

export async function searchProperties(
  filters: PropertySearchFilters,
): Promise<PropertySearchResult> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(24, Math.max(1, filters.pageSize ?? 12));
  const where = buildWhere(filters);

  const [rows, total] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: LIST_INCLUDE,
    }),
    prisma.property.count({ where }),
  ]);

  return {
    items: rows.map(toListItem),
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getFeaturedProperties(
  limit = 6,
): Promise<PropertyListItem[]> {
  const rows = await prisma.property.findMany({
    where: PUBLIC_WHERE,
    orderBy: [{ publishedAt: "desc" }],
    take: limit,
    include: LIST_INCLUDE,
  });
  return rows.map(toListItem);
}

export async function listNeighborhoods(limit = 20): Promise<string[]> {
  const rows = await prisma.property.findMany({
    where: PUBLIC_WHERE,
    distinct: ["neighborhood"],
    orderBy: { neighborhood: "asc" },
    take: limit,
    select: { neighborhood: true },
  });
  return rows.map((row) => row.neighborhood);
}

export type PropertyDetail = {
  id: string;
  title: string;
  description: string;
  price: string;
  type: PropertyTypeValue;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  areaM2: number | null;
  city: string;
  neighborhood: string;
  viewsCount: number;
  publishedAt: string | null;
  images: { url: string; altText: string | null }[];
  owner: { id: string; name: string };
  /** Dirección exacta: solo para el propietario o un moderador. */
  addressLine: string | null;
};

export async function getPropertyDetail(
  id: string,
  viewer?: { id: string; role: string } | null,
): Promise<PropertyDetail | null> {
  const row = await prisma.property.findUnique({
    where: { id },
    include: {
      media: { orderBy: { position: "asc" } },
      owner: { select: { id: true, name: true } },
    },
  });

  if (!row) return null;

  const isOwner = viewer?.id === row.ownerId;
  const isModerator =
    viewer?.role === "ADMIN" || viewer?.role === "SUPER_ADMIN";
  const isPublic =
    row.moderationStatus === "APPROVED" && row.availability === "AVAILABLE";

  if (!isPublic && !isOwner && !isModerator) return null;

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: row.price.toString(),
    type: row.type,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    parkingSpaces: row.parkingSpaces,
    areaM2: row.areaM2,
    city: row.city,
    neighborhood: row.neighborhood,
    viewsCount: row.viewsCount,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    images: row.media
      .filter((media) => media.type === "IMAGE")
      .map((media) => ({ url: media.url, altText: media.altText })),
    owner: row.owner,
    addressLine: isOwner || isModerator ? (row.addressLine ?? null) : null,
  };
}

export type OwnerPropertyItem = PropertyListItem & {
  moderationStatus: string;
  availability: string;
  rejectionReason: string | null;
  favoriteCount: number;
};

export async function listPropertiesByOwner(
  ownerId: string,
): Promise<OwnerPropertyItem[]> {
  const rows = await prisma.property.findMany({
    where: { ownerId },
    orderBy: { updatedAt: "desc" },
    include: {
      media: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
      owner: { select: { name: true } },
      _count: { select: { favorites: true } },
    },
  });

  return rows.map((row) => ({
    ...toListItem(row),
    moderationStatus: row.moderationStatus,
    availability: row.availability,
    rejectionReason: row.rejectionReason,
    favoriteCount: row._count.favorites,
  }));
}

export async function countPropertiesByOwner(ownerId: string): Promise<number> {
  return prisma.property.count({ where: { ownerId } });
}

/** Datos editables de un inmueble, restringido a su propietario o moderadores. */
export async function getEditableProperty(
  id: string,
  actorId: string,
  role: string,
) {
  const row = await prisma.property.findUnique({
    where: { id },
    include: { media: { orderBy: { position: "asc" } } },
  });
  if (!row) return null;

  const isOwner = row.ownerId === actorId;
  const isModerator = role === "ADMIN" || role === "SUPER_ADMIN";
  if (!isOwner && !isModerator) return null;

  return row;
}

export async function incrementPropertyViews(id: string): Promise<void> {
  await prisma.property.update({
    where: { id },
    data: { viewsCount: { increment: 1 } },
  });
}
