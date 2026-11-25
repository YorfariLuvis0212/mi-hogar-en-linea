import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

type PaginationProps = {
  page: number;
  pageCount: number;
  buildHref: (page: number) => string;
};

export function Pagination({ page, pageCount, buildHref }: PaginationProps) {
  if (pageCount <= 1) return null;

  const prevDisabled = page <= 1;
  const nextDisabled = page >= pageCount;

  return (
    <nav
      className="flex items-center justify-between gap-4"
      aria-label="Paginación"
    >
      <Button
        variant="outline"
        size="sm"
        disabled={prevDisabled}
        render={prevDisabled ? undefined : <Link href={buildHref(page - 1)} />}
      >
        <ChevronLeftIcon />
        Anterior
      </Button>

      <span className="text-muted-foreground text-sm">
        Página {page} de {pageCount}
      </span>

      <Button
        variant="outline"
        size="sm"
        disabled={nextDisabled}
        render={nextDisabled ? undefined : <Link href={buildHref(page + 1)} />}
      >
        Siguiente
        <ChevronRightIcon />
      </Button>
    </nav>
  );
}
