import type { Metadata } from "next";
import Link from "next/link";
import { SearchXIcon } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Pagination } from "@/components/pagination";
import { Button } from "@/components/ui/button";
import {
  buildQueryString,
  parseSearchParams,
} from "@/modules/properties/filters";
import { FiltersBar } from "@/modules/properties/filters-bar";
import { PropertyCard } from "@/modules/properties/property-card";
import {
  listNeighborhoods,
  searchProperties,
} from "@/modules/properties/service";

export const metadata: Metadata = {
  title: "Explorar inmuebles en arriendo",
  description:
    "Filtra apartamentos, casas, habitaciones y locales en arriendo en Quibdó y el Chocó por precio, barrio y número de habitaciones.",
};

const PAGE_SIZE = 12;

export default async function PropertiesPage({
  searchParams,
}: PageProps<"/propiedades">) {
  const params = await searchParams;
  const filters = parseSearchParams(params);

  const [result, neighborhoods] = await Promise.all([
    searchProperties({ ...filters, pageSize: PAGE_SIZE }),
    listNeighborhoods(),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Inmuebles en arriendo
        </h1>
        <p className="text-muted-foreground text-sm">
          Quibdó y el Chocó · publicaciones verificadas y disponibles
        </p>
      </header>

      <FiltersBar
        filters={filters}
        neighborhoods={neighborhoods}
        resultCount={result.total}
      />

      {result.items.length === 0 ? (
        <EmptyState
          icon={<SearchXIcon className="size-5" />}
          title="No encontramos inmuebles con esos filtros"
          description="Prueba ampliando el rango de precio, cambiando el barrio o quitando algún filtro."
          action={
            <Button variant="outline" render={<Link href="/propiedades" />}>
              Limpiar filtros
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.items.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          <Pagination
            page={result.page}
            pageCount={result.pageCount}
            buildHref={(page) =>
              `/propiedades${buildQueryString(filters, { page })}`
            }
          />
        </>
      )}
    </div>
  );
}
