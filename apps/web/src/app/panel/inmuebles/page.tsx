import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Building2Icon,
  EyeIcon,
  ImageOffIcon,
  PencilIcon,
  PlayIcon,
  PauseIcon,
} from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { requireSession } from "@/modules/identity/session";
import { ArchivePropertyButton } from "@/modules/properties/archive-button";
import {
  AVAILABILITY_LABELS,
  MODERATION_LABELS,
  PROPERTY_TYPE_LABELS,
} from "@mh/contracts";
import { listPropertiesByOwner } from "@/modules/properties/service";
import { setPropertyAvailabilityAction } from "@/modules/properties/actions";

export const metadata: Metadata = { title: "Mis inmuebles" };

const MODERATION_VARIANTS: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  APPROVED: "default",
  PENDING_REVIEW: "secondary",
  REJECTED: "destructive",
  ARCHIVED: "outline",
  DRAFT: "outline",
};

export default async function PanelPropertiesPage({
  searchParams,
}: PageProps<"/panel/inmuebles">) {
  const session = await requireSession();
  const params = await searchParams;
  const properties = await listPropertiesByOwner(session.user.id);

  const created = params.creado === "1";
  const updated = params.actualizado === "1";

  return (
    <div className="space-y-4">
      {created || updated ? (
        <div className="border-primary/20 bg-primary/5 text-foreground rounded-lg border px-4 py-3 text-sm">
          {created
            ? "Publicación creada. Está en revisión y se mostrará al público cuando sea aprobada."
            : "Publicación actualizada. Volverá a revisión antes de publicarse."}
        </div>
      ) : null}

      {properties.length === 0 ? (
        <EmptyState
          icon={<Building2Icon className="size-5" />}
          title="Aún no has publicado inmuebles"
          description="Publica tu primer inmueble en arriendo y empieza a recibir mensajes de interesados."
          action={
            <Button render={<Link href="/panel/inmuebles/nuevo" />}>
              Publicar inmueble
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {properties.map((property) => {
            const isPaused = property.availability === "PAUSED";
            const isArchived = property.moderationStatus === "ARCHIVED";

            return (
              <li
                key={property.id}
                className="bg-card ring-foreground/10 flex flex-col gap-3 rounded-xl p-3 ring-1 sm:flex-row sm:items-center"
              >
                <div className="bg-muted relative aspect-4/3 w-full shrink-0 overflow-hidden rounded-lg sm:aspect-auto sm:size-24">
                  {property.coverUrl ? (
                    <Image
                      src={property.coverUrl}
                      alt={property.title}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="text-muted-foreground flex h-full items-center justify-center">
                      <ImageOffIcon className="size-5" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge
                      variant={
                        MODERATION_VARIANTS[property.moderationStatus] ??
                        "outline"
                      }
                    >
                      {MODERATION_LABELS[
                        property.moderationStatus as keyof typeof MODERATION_LABELS
                      ] ?? property.moderationStatus}
                    </Badge>
                    <Badge variant="secondary">
                      {property.moderationStatus === "APPROVED"
                        ? (AVAILABILITY_LABELS[
                            property.availability as keyof typeof AVAILABILITY_LABELS
                          ] ?? property.availability)
                        : PROPERTY_TYPE_LABELS[property.type]}
                    </Badge>
                  </div>
                  <h3 className="line-clamp-1 font-medium">{property.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {formatCurrency(property.price)} /mes ·{" "}
                    {property.neighborhood}, {property.city}
                  </p>
                  {property.moderationStatus === "REJECTED" &&
                  property.rejectionReason ? (
                    <p className="text-destructive text-xs">
                      Motivo del rechazo: {property.rejectionReason}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-1 sm:justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    render={<Link href={`/propiedades/${property.id}`} />}
                  >
                    <EyeIcon />
                    Ver
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    render={
                      <Link href={`/panel/inmuebles/${property.id}/editar`} />
                    }
                  >
                    <PencilIcon />
                    Editar
                  </Button>

                  {!isArchived && property.moderationStatus === "APPROVED" ? (
                    <form action={setPropertyAvailabilityAction}>
                      <input
                        type="hidden"
                        name="propertyId"
                        value={property.id}
                      />
                      <input
                        type="hidden"
                        name="availability"
                        value={isPaused ? "AVAILABLE" : "PAUSED"}
                      />
                      <Button type="submit" variant="ghost" size="sm">
                        {isPaused ? <PlayIcon /> : <PauseIcon />}
                        {isPaused ? "Activar" : "Pausar"}
                      </Button>
                    </form>
                  ) : null}

                  {!isArchived ? (
                    <ArchivePropertyButton propertyId={property.id} />
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
