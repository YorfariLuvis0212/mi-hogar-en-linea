import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PropertyForm } from "@/modules/properties/property-form";

export const metadata: Metadata = { title: "Publicar inmueble" };

export default function NewPropertyPage() {
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
          Publicar inmueble
        </h2>
        <p className="text-muted-foreground text-sm">
          Completa la información. Podrás editarla mientras la publicación esté
          activa.
        </p>
      </div>
      <PropertyForm mode="create" />
    </div>
  );
}
