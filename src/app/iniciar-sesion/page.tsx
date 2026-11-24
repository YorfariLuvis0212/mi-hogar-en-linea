import type { Metadata } from "next";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/modules/identity/login-form";
import { getSession } from "@/modules/identity/session";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Accede a tu cuenta de Mi Hogar en Línea.",
};

export default async function LoginPage({
  searchParams,
}: PageProps<"/iniciar-sesion">) {
  const session = await getSession();
  if (session) redirect("/panel");

  const params = await searchParams;
  const redirectTo =
    typeof params.redirect === "string" ? params.redirect : "/panel";

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 items-center px-4 py-12">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Iniciar sesión</CardTitle>
          <CardDescription>Ingresa con tu correo y contraseña.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm redirectTo={redirectTo} />
        </CardContent>
      </Card>
    </div>
  );
}
