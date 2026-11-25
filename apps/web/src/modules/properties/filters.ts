import { PROPERTY_TYPES, PROPERTY_TYPE_LABELS } from "@mh/contracts";

export type RawSearchParams = Record<string, string | string[] | undefined>;

export type ParsedFilters = {
  q: string;
  type: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  neighborhood: string;
  page: number;
};

export const TYPE_OPTIONS = PROPERTY_TYPES.map((value) => ({
  value,
  label: PROPERTY_TYPE_LABELS[value],
}));

export const PRICE_OPTIONS = [
  { value: "", label: "Cualquier precio" },
  { value: "0-500000", label: "Hasta $ 500.000" },
  { value: "500000-900000", label: "$ 500.000 – $ 900.000" },
  { value: "900000-1500000", label: "$ 900.000 – $ 1.500.000" },
  { value: "1500000-", label: "Más de $ 1.500.000" },
] as const;

export const BEDROOM_OPTIONS = [
  { value: "", label: "Cualquiera" },
  { value: "1", label: "1 o más" },
  { value: "2", label: "2 o más" },
  { value: "3", label: "3 o más" },
  { value: "4", label: "4 o más" },
] as const;

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function toPositiveInt(value: string): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function parsePriceRange(value: string): {
  minPrice?: number;
  maxPrice?: number;
} {
  if (!value) return {};
  const [min, max] = value.split("-");
  return {
    minPrice: toPositiveInt(min ?? ""),
    maxPrice: toPositiveInt(max ?? ""),
  };
}

/** Normaliza los `searchParams` de la URL en filtros tipados y seguros. */
export function parseSearchParams(params: RawSearchParams): ParsedFilters {
  const price = parsePriceRange(firstValue(params.price));
  const type = firstValue(params.type);

  return {
    q: firstValue(params.q).trim().slice(0, 80),
    type: (PROPERTY_TYPES as readonly string[]).includes(type) ? type : "",
    minPrice: price.minPrice,
    maxPrice: price.maxPrice,
    bedrooms: toPositiveInt(firstValue(params.bedrooms)),
    neighborhood: firstValue(params.neighborhood).trim().slice(0, 80),
    page: Math.max(1, toPositiveInt(firstValue(params.page)) ?? 1),
  };
}

/** Reconstruye una cadena de consulta conservando solo los filtros activos. */
export function buildQueryString(
  filters: Partial<ParsedFilters>,
  overrides: Record<string, string | number | undefined> = {},
): string {
  const search = new URLSearchParams();

  const flat: Record<string, string | number | undefined> = {
    q: filters.q || undefined,
    type: filters.type || undefined,
    price:
      filters.minPrice != null || filters.maxPrice != null
        ? `${filters.minPrice ?? 0}-${filters.maxPrice ?? ""}`
        : undefined,
    bedrooms: filters.bedrooms || undefined,
    neighborhood: filters.neighborhood || undefined,
    page: filters.page && filters.page > 1 ? filters.page : undefined,
    ...overrides,
  };

  for (const [key, value] of Object.entries(flat)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}
