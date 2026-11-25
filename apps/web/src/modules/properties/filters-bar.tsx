import { SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import {
  BEDROOM_OPTIONS,
  PRICE_OPTIONS,
  TYPE_OPTIONS,
  type ParsedFilters,
} from "@/modules/properties/filters";

type FiltersBarProps = {
  filters: ParsedFilters;
  neighborhoods: string[];
  resultCount: number;
};

function priceValue(filters: ParsedFilters): string {
  if (filters.minPrice == null && filters.maxPrice == null) return "";
  const match = PRICE_OPTIONS.find(
    (option) =>
      option.value !== "" &&
      option.value === `${filters.minPrice ?? 0}-${filters.maxPrice ?? ""}`,
  );
  return match?.value ?? "";
}

export function FiltersBar({
  filters,
  neighborhoods,
  resultCount,
}: FiltersBarProps) {
  return (
    <form
      action="/propiedades"
      method="get"
      className="bg-card space-y-3 rounded-xl border p-4"
      aria-label="Filtros de búsqueda"
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          name="q"
          defaultValue={filters.q}
          placeholder="Busca por barrio, título o palabra clave"
          aria-label="Buscar inmuebles"
        />
        <Button type="submit" className="sm:w-auto">
          <SearchIcon />
          Buscar
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <NativeSelect
          name="type"
          defaultValue={filters.type}
          aria-label="Tipo de inmueble"
        >
          <option value="">Todos los tipos</option>
          {TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </NativeSelect>

        <NativeSelect
          name="price"
          defaultValue={priceValue(filters)}
          aria-label="Rango de precio"
        >
          {PRICE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </NativeSelect>

        <NativeSelect
          name="bedrooms"
          defaultValue={filters.bedrooms ? String(filters.bedrooms) : ""}
          aria-label="Habitaciones mínimas"
        >
          {BEDROOM_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.value === "" ? "Habitaciones: cualquiera" : option.label}
            </option>
          ))}
        </NativeSelect>

        <NativeSelect
          name="neighborhood"
          defaultValue={filters.neighborhood}
          aria-label="Barrio"
        >
          <option value="">Todos los barrios</option>
          {neighborhoods.map((neighborhood) => (
            <option key={neighborhood} value={neighborhood}>
              {neighborhood}
            </option>
          ))}
        </NativeSelect>
      </div>

      <p className="text-muted-foreground text-xs" aria-live="polite">
        {resultCount}{" "}
        {resultCount === 1 ? "inmueble encontrado" : "inmuebles encontrados"}
      </p>
    </form>
  );
}
