"use client";

import * as React from "react";
import Link from "next/link";
import { useActionState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormField } from "@/components/forms/form-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { initialFormState } from "@/lib/form";
import { loginAction } from "@/modules/identity/actions";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, action] = useActionState(loginAction, initialFormState);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="redirect" value={redirectTo} />

      {state.message ? (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <FormField
        id="email"
        label="Correo electrónico"
        error={state.fieldErrors?.email?.[0]}
      >
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </FormField>

      <FormField
        id="password"
        label="Contraseña"
        error={state.fieldErrors?.password?.[0]}
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </FormField>

      <SubmitButton className="w-full" pendingLabel="Ingresando…">
        Iniciar sesión
      </SubmitButton>

      <p className="text-muted-foreground text-center text-sm">
        ¿No tienes cuenta?{" "}
        <Link
          href="/registrarse"
          className="text-primary font-medium hover:underline"
        >
          Crear una cuenta
        </Link>
      </p>
    </form>
  );
}
