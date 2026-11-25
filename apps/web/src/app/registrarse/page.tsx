import type { Metadata } from "next";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RegisterForm } from "@/modules/identity/register-form";
import { getSession } from "@/modules/identity/session";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Regístrate para publicar y contactar inmuebles en arriendo.",
};

export default async function RegisterPage({
  searchParams,
}: PageProps<"/registrarse">) {
  const session = await getSession();
  if (session) redirect("/panel");

  const params = await searchParams;
  const redirectTo =
    typeof params.redirect === "string" ? params.redirect : "/panel";

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 items-center px-4 py-12">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Crear cuenta</CardTitle>
          <CardDescription>
            Publica tus inmuebles o contacta anunciantes de forma segura.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm redirectTo={redirectTo} />
        </CardContent>
      </Card>
    </div>
  );
}
