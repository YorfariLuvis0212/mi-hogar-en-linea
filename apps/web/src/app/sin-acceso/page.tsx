import type { Metadata } from "next";
import Link from "next/link";
import { LockIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Sin acceso",
};

export default function NoAccessPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 items-center px-4 py-12">
      <Card className="w-full">
        <CardHeader>
          <span className="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-full">
            <LockIcon className="size-5" />
          </span>
          <CardTitle className="text-lg">
            No tienes acceso a esta sección
          </CardTitle>
          <CardDescription>
            Esta área está reservada para el equipo de administración de la
            plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button render={<Link href="/panel" />} className="w-full">
            Ir a mi panel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
