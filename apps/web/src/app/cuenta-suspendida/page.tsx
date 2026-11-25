import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignOutButton } from "@/modules/identity/sign-out-button";

export const metadata: Metadata = {
  title: "Cuenta suspendida",
};

export default function SuspendedAccountPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 items-center px-4 py-12">
      <Card className="w-full">
        <CardHeader>
          <span className="bg-destructive/10 text-destructive flex size-10 items-center justify-center rounded-full">
            <ShieldAlertIcon className="size-5" />
          </span>
          <CardTitle className="text-lg">Cuenta suspendida</CardTitle>
          <CardDescription>
            Tu cuenta está temporalmente suspendida. Si crees que es un error,
            contacta al equipo de soporte para revisar tu caso.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button render={<Link href="/" />} variant="outline">
            Volver al inicio
          </Button>
          <SignOutButton className="justify-center" />
        </CardContent>
      </Card>
    </div>
  );
}
