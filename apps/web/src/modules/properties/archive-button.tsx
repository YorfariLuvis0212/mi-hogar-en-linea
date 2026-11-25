"use client";

import * as React from "react";
import { ArchiveIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { archivePropertyAction } from "@/modules/properties/actions";

/** Archiva una publicación; pide confirmación por ser una acción destructiva. */
export function ArchivePropertyButton({ propertyId }: { propertyId: string }) {
  const [isPending, startTransition] = React.useTransition();

  function handleArchive() {
    if (
      !window.confirm(
        "¿Archivar esta publicación? Dejará de mostrarse en el catálogo.",
      )
    )
      return;

    const formData = new FormData();
    formData.set("propertyId", propertyId);
    startTransition(() => {
      void archivePropertyAction(formData);
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleArchive}
      disabled={isPending}
      className="text-destructive hover:text-destructive"
    >
      <ArchiveIcon />
      Archivar
    </Button>
  );
}
