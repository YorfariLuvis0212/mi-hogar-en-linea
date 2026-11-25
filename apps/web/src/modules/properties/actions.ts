"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@mh/database";
import { parseImageUrls, propertySchema } from "@mh/contracts";

import { toFieldErrors, type FormState } from "@/lib/form";
import { recordAudit } from "@/modules/audit/service";
import { requireSession } from "@/modules/identity/session";
import { getEditableProperty } from "@/modules/properties/service";

function revalidatePropertySurfaces(id?: string) {
  revalidatePath("/");
  revalidatePath("/propiedades");
  revalidatePath("/panel");
  revalidatePath("/panel/inmuebles");
  if (id) {
    revalidatePath(`/propiedades/${id}`);
    revalidatePath(`/panel/inmuebles/${id}/editar`);
  }
}

function mediaCreate(urls: string[]) {
  return urls.map((url, index) => ({
    type: "IMAGE" as const,
    url,
    position: index,
    isCover: index === 0,
  }));
}

export async function createPropertyAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();

  const parsed = propertySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors(parsed.error.issues) };
  }

  const { imageUrls, ...data } = parsed.data;
  const media = mediaCreate(parseImageUrls(imageUrls));

  const property = await prisma.property.create({
    data: {
      ownerId: session.user.id,
      title: data.title,
      description: data.description,
      type: data.type,
      price: data.price,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      parkingSpaces: data.parkingSpaces,
      areaM2: data.areaM2 ?? null,
      city: data.city,
      neighborhood: data.neighborhood,
      addressLine: data.addressLine || null,
      moderationStatus: "PENDING_REVIEW",
      availability: "AVAILABLE",
      media: media.length > 0 ? { create: media } : undefined,
    },
  });

  await recordAudit({
    actorId: session.user.id,
    action: "property.create",
    entity: "Property",
    entityId: property.id,
    metadata: { title: property.title, type: property.type, price: data.price },
  });

  revalidatePropertySurfaces(property.id);
  redirect("/panel/inmuebles?creado=1");
}

export async function updatePropertyAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSession();
  const propertyId = String(formData.get("propertyId") ?? "");

  const editable = await getEditableProperty(
    propertyId,
    session.user.id,
    session.user.role,
  );
  if (!editable) {
    return {
      status: "error",
      message: "No tienes permiso para editar este inmueble.",
    };
  }

  const parsed = propertySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors(parsed.error.issues) };
  }

  const { imageUrls, ...data } = parsed.data;
  const media = mediaCreate(parseImageUrls(imageUrls));

  await prisma.$transaction([
    prisma.propertyMedia.deleteMany({ where: { propertyId } }),
    prisma.property.update({
      where: { id: propertyId },
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        price: data.price,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        parkingSpaces: data.parkingSpaces,
        areaM2: data.areaM2 ?? null,
        city: data.city,
        neighborhood: data.neighborhood,
        addressLine: data.addressLine || null,
        moderationStatus: "PENDING_REVIEW",
        rejectionReason: null,
        media: media.length > 0 ? { create: media } : undefined,
      },
    }),
  ]);

  await recordAudit({
    actorId: session.user.id,
    action: "property.update",
    entity: "Property",
    entityId: propertyId,
  });

  revalidatePropertySurfaces(propertyId);
  redirect("/panel/inmuebles?actualizado=1");
}

export async function setPropertyAvailabilityAction(
  formData: FormData,
): Promise<void> {
  const session = await requireSession();
  const propertyId = String(formData.get("propertyId") ?? "");
  const availability = String(formData.get("availability") ?? "");

  if (availability !== "AVAILABLE" && availability !== "PAUSED") return;

  const editable = await getEditableProperty(
    propertyId,
    session.user.id,
    session.user.role,
  );
  if (!editable) return;

  await prisma.property.update({
    where: { id: propertyId },
    data: { availability },
  });
  await recordAudit({
    actorId: session.user.id,
    action: "property.availability",
    entity: "Property",
    entityId: propertyId,
    metadata: { availability },
  });

  revalidatePropertySurfaces(propertyId);
}

export async function archivePropertyAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const propertyId = String(formData.get("propertyId") ?? "");

  const editable = await getEditableProperty(
    propertyId,
    session.user.id,
    session.user.role,
  );
  if (!editable) return;

  await prisma.property.update({
    where: { id: propertyId },
    data: { moderationStatus: "ARCHIVED", availability: "PAUSED" },
  });
  await recordAudit({
    actorId: session.user.id,
    action: "property.archive",
    entity: "Property",
    entityId: propertyId,
  });

  revalidatePropertySurfaces(propertyId);
}
