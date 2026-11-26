import { z } from "zod";

export const PROPERTY_TYPES = [
  "APARTMENT",
  "HOUSE",
  "ROOM",
  "STUDIO",
  "COMMERCIAL",
  "LOT",
] as const;

export type PropertyTypeValue = (typeof PROPERTY_TYPES)[number];

export const PROPERTY_TYPE_LABELS: Record<PropertyTypeValue, string> = {
  APARTMENT: "Apartamento",
  HOUSE: "Casa",
  ROOM: "Habitación",
  STUDIO: "Apartaestudio",
  COMMERCIAL: "Local comercial",
  LOT: "Lote",
};

export const AVAILABILITY_LABELS = {
  AVAILABLE: "Disponible",
  RENTED: "Arrendada",
  PAUSED: "Pausada",
} as const;

export const MODERATION_LABELS = {
  DRAFT: "Borrador",
  PENDING_REVIEW: "En revisión",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
  ARCHIVED: "Archivada",
} as const;

export const propertySchema = z.object({
  title: z.string().trim().min(6, "Mínimo 6 caracteres").max(120),
  description: z
    .string()
    .trim()
    .min(20, "Describe el inmueble (mínimo 20 caracteres)")
    .max(4000),
  type: z.enum(PROPERTY_TYPES),
  price: z.coerce
    .number()
    .positive("El precio debe ser mayor que cero")
    .max(1_000_000_000),
  bedrooms: z.coerce.number().int().min(0).max(30).default(0),
  bathrooms: z.coerce.number().int().min(0).max(30).default(0),
  parkingSpaces: z.coerce.number().int().min(0).max(30).default(0),
  areaM2: z.coerce.number().int().min(0).max(5000).optional(),
  city: z.string().trim().min(2).max(80).default("Quibdó"),
  neighborhood: z.string().trim().min(2, "Indica el barrio").max(80),
  addressLine: z.string().trim().max(160).optional().or(z.literal("")),
  imageUrls: z.string().optional(),
});

export type PropertyInput = z.infer<typeof propertySchema>;

/** Normaliza el campo de imágenes (URLs separadas por líneas o comas). */
export function parseImageUrls(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(/[\n,]/)
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .slice(0, 20);
}
