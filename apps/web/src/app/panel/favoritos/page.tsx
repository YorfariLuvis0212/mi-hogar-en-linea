import type { Metadata } from "next";
import { HeartIcon } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { FavoriteButton } from "@/modules/properties/favorite-button";
import { PropertyCard } from "@/modules/properties/property-card";
import { listFavoritesForUser } from "@/modules/favorites/service";
import { requireSession } from "@/modules/identity/session";

export const metadata: Metadata = { title: "Favoritos" };

export default async function FavoritesPage() {
  const session = await requireSession();
  const favorites = await listFavoritesForUser(session.user.id);

  if (favorites.length === 0) {
    return (
      <EmptyState
        icon={<HeartIcon className="size-5" />}
        title="No tienes inmuebles guardados"
        description="Guarda los inmuebles que te interesen para compararlos y contactar después."
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
      {favorites.map((item) => (
        <div key={item.id} className="space-y-2">
          <PropertyCard property={item} />
          <FavoriteButton propertyId={item.id} initialFavorite variant="full" />
        </div>
      ))}
    </div>
  );
}
