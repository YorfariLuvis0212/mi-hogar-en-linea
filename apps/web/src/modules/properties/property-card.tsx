import Image from "next/image";
import Link from "next/link";
import {
  BathIcon,
  BedDoubleIcon,
  ImageOffIcon,
  MapPinIcon,
  RulerIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import { PROPERTY_TYPE_LABELS } from "@mh/contracts";
import type { PropertyListItem } from "@/modules/properties/service";

export function PropertyCard({ property }: { property: PropertyListItem }) {
  return (
    <article className="group bg-card text-card-foreground ring-foreground/10 overflow-hidden rounded-xl ring-1 transition-shadow hover:shadow-md">
      <Link href={`/propiedades/${property.id}`} className="block">
        <div className="bg-muted relative aspect-4/3 w-full">
          {property.coverUrl ? (
            <Image
              src={property.coverUrl}
              alt={property.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center">
              <ImageOffIcon className="size-6" />
            </div>
          )}
          <Badge variant="secondary" className="absolute top-2 left-2">
            {PROPERTY_TYPE_LABELS[property.type]}
          </Badge>
        </div>

        <div className="space-y-2 p-4">
          <p className="text-lg font-semibold">
            {formatCurrency(property.price)}
            <span className="text-muted-foreground text-xs font-normal">
              {" "}
              /mes
            </span>
          </p>
          <h3 className="line-clamp-2 text-sm font-medium">{property.title}</h3>
          <p className="text-muted-foreground flex items-center gap-1 text-xs">
            <MapPinIcon className="size-3.5" />
            {property.neighborhood}, {property.city}
          </p>
          <div className="text-muted-foreground flex flex-wrap gap-3 text-xs">
            <span className="inline-flex items-center gap-1">
              <BedDoubleIcon className="size-3.5" />
              {property.bedrooms} hab.
            </span>
            <span className="inline-flex items-center gap-1">
              <BathIcon className="size-3.5" />
              {property.bathrooms} baños
            </span>
            {property.areaM2 ? (
              <span className="inline-flex items-center gap-1">
                <RulerIcon className="size-3.5" />
                {property.areaM2} m²
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
}
