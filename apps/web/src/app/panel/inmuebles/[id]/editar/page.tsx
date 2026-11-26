import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { requireSession } from "@/modules/identity/session";
import { PropertyForm } from "@/modules/properties/property-form";
import { getEditableProperty } from "@/modules/properties/service";

export const metadata: Metadata = { title: "Editar inmueble" };

export default async function EditPropertyPage({
  params,
}: PageProps<"/panel/inmuebles/[id]/editar">) {
  const session = await requireSession();
  const { id } = await params;

  const property = await getEditableProperty(
    id,
    session.user.id,
    session.user.role,
  );
  if (!property) notFound();

  const imageUrls = property.media
    .filter((media) => media.type === "IMAGE")
    .map((media) => media.url)
    .join("\n");

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/panel/inmuebles" />}
        >
          <ArrowLeftIcon />
          Mis inmuebles
        </Button>
        <h2 className="text-xl font-semibold tracking-tight">
          Editar inmueble
        </h2>
        <p className="text-muted-foreground text-sm">
          Los cambios devuelven la publicación a revisión antes de volver al
          catálogo.
        </p>
      </div>

      <PropertyForm
        mode="edit"
        propertyId={property.id}
        defaultValues={{
          title: property.title,
          description: property.description,
          type: property.type,
          price: property.price.toString(),
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          parkingSpaces: property.parkingSpaces,
          areaM2: property.areaM2,
          city: property.city,
          neighborhood: property.neighborhood,
          addressLine: property.addressLine,
          imageUrls,
        }}
      />
    </div>
  );
}
