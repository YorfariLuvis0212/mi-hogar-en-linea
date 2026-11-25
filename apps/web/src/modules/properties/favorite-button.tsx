"use client";

import * as React from "react";
import { HeartIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toggleFavoriteAction } from "@/modules/favorites/actions";

type FavoriteButtonProps = {
  propertyId: string;
  initialFavorite?: boolean;
  /** Variante visual: `icon` para tarjetas, `full` para la ficha. */
  variant?: "icon" | "full";
};

export function FavoriteButton({
  propertyId,
  initialFavorite = false,
  variant = "icon",
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = React.useState(initialFavorite);
  const [isPending, startTransition] = React.useTransition();

  function handleClick() {
    const next = !isFavorite;
    setIsFavorite(next); // actualización optimista

    startTransition(async () => {
      try {
        const result = await toggleFavoriteAction(propertyId);
        setIsFavorite(result.status === "added");
      } catch {
        setIsFavorite(!next); // revierte si falla
      }
    });
  }

  if (variant === "full") {
    return (
      <Button
        type="button"
        variant={isFavorite ? "secondary" : "outline"}
        className="w-full"
        onClick={handleClick}
        disabled={isPending}
        aria-pressed={isFavorite}
      >
        <HeartIcon className={cn(isFavorite && "text-primary fill-current")} />
        {isFavorite ? "Guardado" : "Guardar"}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon-sm"
      className="bg-background/90 rounded-full backdrop-blur"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
    >
      <HeartIcon className={cn(isFavorite && "text-primary fill-current")} />
    </Button>
  );
}
